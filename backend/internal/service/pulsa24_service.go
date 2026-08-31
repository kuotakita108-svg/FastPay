package service

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"kuotakita/backend/internal/config"
	"kuotakita/backend/internal/database"
	"net/http"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

// Pulsa24Service is the only component allowed to talk to Pulsa24Jam. API
// credentials never leave this server and are never returned to the browser.
type Pulsa24Service struct {
	baseURL string
	apiKey  string
	pin     string
	client  *http.Client
	state   *database.StateStore
	mu      sync.RWMutex
	orders  map[string]Pulsa24Order
}

type Pulsa24Order struct {
	RefID, UserID, UserRole, ClientRequestID, Product, Destination, TransactionID string
	Qty, Amount, MainUsed, CreditUsed                                             int64
	Status, SN, Message, CustomerName                                             string
	Debited, Refunded, DirectH2H                                                  bool
	CreatedAt, UpdatedAt                                                          time.Time
}

type pulsa24OrderFile struct {
	Orders map[string]Pulsa24Order `json:"orders"`
}

type Pulsa24Result struct {
	OK           bool           `json:"ok"`
	Command      string         `json:"command,omitempty"`
	RefID        string         `json:"refid,omitempty"`
	Status       string         `json:"status,omitempty"`
	SN           string         `json:"sn,omitempty"`
	CustomerName string         `json:"customer_name,omitempty"`
	Message      string         `json:"msg,omitempty"`
	Balance      int64          `json:"balance,omitempty"`
	Amount       int64          `json:"amount,omitempty"`
	Raw          map[string]any `json:"-"`
}

func NewPulsa24Service(cfg config.Config, state *database.StateStore) *Pulsa24Service {
	timeout := cfg.P24RequestTimeoutSeconds
	if timeout < 5 {
		timeout = 15
	}
	s := &Pulsa24Service{baseURL: strings.TrimRight(cfg.P24BaseURL, "/"), apiKey: strings.TrimSpace(cfg.P24APIKey), pin: strings.TrimSpace(cfg.P24PIN), client: &http.Client{Timeout: time.Duration(timeout) * time.Second}, state: state, orders: map[string]Pulsa24Order{}}
	if state != nil {
		var file pulsa24OrderFile
		if found, err := state.Load("h2h-pulsa24-orders", &file); err == nil && found && file.Orders != nil {
			s.orders = file.Orders
		}
	}
	return s
}

func (s *Pulsa24Service) Enabled() bool { return s != nil && s.apiKey != "" && s.pin != "" }
func (s *Pulsa24Service) NewRefID() string {
	b := make([]byte, 6)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("KK%s", strconv.FormatInt(time.Now().UnixNano(), 36))
	}
	// H2HR membatasi refid PPOB/wallet menjadi 27 byte ASCII.
	return fmt.Sprintf("KK%s-%s", strconv.FormatInt(time.Now().UnixMilli(), 36), strings.ToUpper(hex.EncodeToString(b)))
}
func (s *Pulsa24Service) Balance() (Pulsa24Result, error) {
	return s.request("SALDO", map[string]any{})
}
func (s *Pulsa24Service) Products(product string) (Pulsa24Result, error) {
	p := map[string]any{}
	if strings.TrimSpace(product) != "" {
		p["product"] = product
	}
	return s.request("PRODUK", p)
}
func (s *Pulsa24Service) Pay(product, destination string, qty int64, refID string) (Pulsa24Result, error) {
	return s.request("PAY", map[string]any{"product": product, "dest": destination, "qty": qty, "refid": refID})
}
func (s *Pulsa24Service) Inquiry(product, destination, refID string) (Pulsa24Result, error) {
	return s.request("INQ", map[string]any{"product": product, "dest": destination, "refid": refID})
}
func (s *Pulsa24Service) Verify(order Pulsa24Order) (Pulsa24Result, error) {
	return s.request("STATUS-PAY", map[string]any{"product": order.Product, "dest": order.Destination, "qty": order.Qty, "refid": order.RefID})
}

func (s *Pulsa24Service) request(command string, payload map[string]any) (Pulsa24Result, error) {
	if !s.Enabled() {
		return Pulsa24Result{}, errors.New("integrasi Pulsa24Jam belum diaktifkan di server")
	}
	payload["commands"], payload["pin"] = command, s.pin
	body, err := json.Marshal(payload)
	if err != nil {
		return Pulsa24Result{}, err
	}
	endpoint := s.baseURL
	if !strings.HasSuffix(endpoint, "/v1/trx") && !strings.HasSuffix(endpoint, "/v2/trx") {
		endpoint += "/v2/trx"
	}
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	if err != nil {
		return Pulsa24Result{}, err
	}
	req.Header.Set("X-Api-Key", s.apiKey)
	req.Header.Set("Content-Type", "application/json")
	resp, err := s.client.Do(req)
	if err != nil {
		return Pulsa24Result{}, fmt.Errorf("P24 tidak dapat dihubungi: %w", err)
	}
	defer resp.Body.Close()
	responseLimit := int64(1 << 20)
	if command == "PRODUK" {
		// The H2HR catalogue can contain more than nine thousand SKUs.
		responseLimit = 32 << 20
	}
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, responseLimit))
	var data map[string]any
	if err := json.Unmarshal(raw, &data); err != nil {
		return Pulsa24Result{}, fmt.Errorf("balasan P24 tidak valid")
	}
	row := data
	if nested, ok := data["data"].(map[string]any); ok {
		row = nested
	} else if transaction, ok := data["transaksi_member"].(map[string]any); ok {
		row = transaction
	}
	statusText := firstText(stringVal(row, "keterangan"), stringVal(row, "status_label"), stringVal(row, "status_description"))
	status := normalizeP24Status(statusText)
	if status == "" {
		status = normalizeP24Status(stringVal(row, "status"))
	}
	result := Pulsa24Result{
		OK:           boolVal(data, "ok"),
		Command:      command,
		RefID:        firstText(stringVal(row, "refid"), stringVal(row, "ref_id")),
		Status:       status,
		SN:           stringVal(row, "sn"),
		CustomerName: firstText(stringVal(row, "customer_name"), stringVal(row, "customerName"), stringVal(row, "nama_pelanggan"), stringVal(row, "customer"), stringVal(row, "name"), stringVal(row, "nama")),
		Message:      firstText(stringVal(row, "msg"), stringVal(row, "keterangan"), stringVal(data, "msg"), stringVal(data, "message")),
		Balance:      firstIntValP24(row, "balance", "saldo"),
		Amount:       firstIntValP24(row, "amount", "total", "bill", "tagihan", "harga", "price", "nominal", "biaya_perkiraan"),
		Raw:          data,
	}
	if result.RefID == "" {
		result.RefID = stringVal(data, "refid")
	}
	if result.Status == "" {
		result.Status = normalizeP24Status(stringVal(data, "status"))
	}
	if result.Amount == 0 {
		result.Amount = firstIntValP24(data, "amount", "total", "bill", "tagihan", "harga", "price", "nominal")
	}
	if result.CustomerName == "" {
		result.CustomerName = firstText(stringVal(data, "customer_name"), stringVal(data, "customerName"), stringVal(data, "nama_pelanggan"), stringVal(data, "customer"), stringVal(data, "name"), stringVal(data, "nama"))
	}
	if command == "INQ" {
		if result.Amount == 0 {
			result.Amount = labeledAmountP24(result.Message, "total", "grand total", "tagihan")
		}
		if result.CustomerName == "" {
			result.CustomerName = labeledTextP24(result.Message, "nama")
		}
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 || data["ok"] == false {
		if result.Message == "" {
			result.Message = "request Pulsa24Jam ditolak"
		}
		return result, errors.New(result.Message)
	}
	result.OK = true
	// Some providers only acknowledge a PAY request and deliver the final
	// status through a callback. Treat an empty status as pending, never as a
	// successful transaction.
	if command == "PAY" && result.Status == "" {
		result.Status = "pending"
	}
	return result, nil
}

func (s *Pulsa24Service) Record(order Pulsa24Order) error {
	_, _, err := s.RecordUnique(order)
	return err
}

// RecordUnique atomically reserves a browser checkout request. Repeated HTTP
// submissions return the first order and can never result in a second PAY.
func (s *Pulsa24Service) RecordUnique(order Pulsa24Order) (Pulsa24Order, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if order.ClientRequestID != "" {
		for _, existing := range s.orders {
			if existing.UserID == order.UserID && existing.ClientRequestID == order.ClientRequestID {
				return existing, false, nil
			}
		}
	}
	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now().UTC()
	}
	order.UpdatedAt = time.Now().UTC()
	s.orders[order.RefID] = order
	if err := s.saveLocked(); err != nil {
		delete(s.orders, order.RefID)
		return Pulsa24Order{}, false, err
	}
	return order, true, nil
}
func (s *Pulsa24Service) Order(refID string) (Pulsa24Order, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	o, ok := s.orders[refID]
	return o, ok
}

// Orders returns a newest-first snapshot for the internal Operator console.
// A copy is returned so the UI cannot mutate the transaction authority map.
func (s *Pulsa24Service) Orders() []Pulsa24Order {
	if s == nil {
		return []Pulsa24Order{}
	}
	s.mu.RLock()
	items := make([]Pulsa24Order, 0, len(s.orders))
	for _, order := range s.orders {
		items = append(items, order)
	}
	s.mu.RUnlock()
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt.After(items[j].CreatedAt)
	})
	return items
}
func (s *Pulsa24Service) Finalize(refID string, result Pulsa24Result) (Pulsa24Order, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	order, ok := s.orders[refID]
	if !ok {
		return order, false, nil
	}
	// A final status is immutable. This protects an already successful order
	// from a delayed or duplicate webhook.
	if order.Status == "success" || order.Status == "failed" || result.Status == "" {
		return order, true, nil
	}
	order.Status = result.Status
	if result.SN != "" {
		order.SN = result.SN
	}
	if result.Message != "" {
		order.Message = result.Message
	}
	if result.CustomerName != "" {
		order.CustomerName = result.CustomerName
	}
	order.UpdatedAt = time.Now().UTC()
	s.orders[refID] = order
	return order, true, s.saveLocked()
}
func (s *Pulsa24Service) MarkRefunded(refID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	o, ok := s.orders[refID]
	if !ok {
		return nil
	}
	o.Refunded = true
	o.UpdatedAt = time.Now().UTC()
	s.orders[refID] = o
	return s.saveLocked()
}

// RefundOnce atomically marks an order as refunded. This prevents a callback
// and a manual status check from returning an agent's balance twice.
func (s *Pulsa24Service) RefundOnce(refID string) (Pulsa24Order, bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	o, ok := s.orders[refID]
	if !ok || o.Refunded {
		return o, false, nil
	}
	o.Refunded = true
	o.UpdatedAt = time.Now().UTC()
	s.orders[refID] = o
	return o, true, s.saveLocked()
}
func (s *Pulsa24Service) saveLocked() error {
	if s.state == nil {
		return nil
	}
	return s.state.Save("h2h-pulsa24-orders", pulsa24OrderFile{Orders: s.orders})
}

func normalizeP24Status(v string) string {
	v = strings.ToLower(strings.TrimSpace(v))
	switch {
	case v == "1":
		return "pending"
	case v == "2":
		return "success"
	case v == "3":
		return "failed"
	case strings.Contains(v, "sukses"), strings.Contains(v, "success"), strings.Contains(v, "berhasil"):
		return "success"
	case strings.Contains(v, "gagal"), strings.Contains(v, "failed"), strings.Contains(v, "reject"):
		return "failed"
	case strings.Contains(v, "pending"), strings.Contains(v, "proses"), strings.Contains(v, "process"):
		return "pending"
	}
	return v
}
func stringVal(m map[string]any, k string) string {
	if v, ok := m[k]; ok {
		return strings.TrimSpace(fmt.Sprint(v))
	}
	return ""
}
func boolVal(m map[string]any, k string) bool {
	v, ok := m[k]
	if !ok {
		return false
	}
	b, _ := v.(bool)
	return b
}
func intValP24(m map[string]any, k string) int64 {
	switch v := m[k].(type) {
	case float64:
		return int64(v)
	case json.Number:
		n, _ := v.Int64()
		return n
	case int64:
		return v
	case int:
		return int64(v)
	case string:
		n, _ := strconv.ParseInt(strings.ReplaceAll(strings.TrimSpace(v), ".", ""), 10, 64)
		return n
	}
	return 0
}
func firstIntValP24(m map[string]any, keys ...string) int64 {
	for _, key := range keys {
		if value := intValP24(m, key); value > 0 {
			return value
		}
	}
	return 0
}
func firstText(values ...string) string {
	for _, v := range values {
		if strings.TrimSpace(v) != "" {
			return v
		}
	}
	return ""
}

func labeledAmountP24(message string, labels ...string) int64 {
	for _, label := range labels {
		re := regexp.MustCompile(`(?i)(?:^|[,;|])\s*` + regexp.QuoteMeta(label) + `\s*:\s*(?:rp\s*)?([0-9][0-9.]*)`)
		if match := re.FindStringSubmatch(message); len(match) == 2 {
			value, _ := strconv.ParseInt(strings.ReplaceAll(match[1], ".", ""), 10, 64)
			if value > 0 {
				return value
			}
		}
	}
	return 0
}

func labeledTextP24(message, label string) string {
	re := regexp.MustCompile(`(?i)(?:^|[,;|])\s*` + regexp.QuoteMeta(label) + `\s*:\s*([^,;|]+)`)
	if match := re.FindStringSubmatch(message); len(match) == 2 {
		return strings.TrimSpace(match[1])
	}
	return ""
}
