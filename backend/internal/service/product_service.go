package service

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"kuotakita/backend/internal/domain"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed h2h_catalog.json
var h2hCatalogJSON []byte

var (
	h2hOnce     sync.Once
	h2hProducts []domain.Product
)

type productReader interface{ FindProducts() []domain.Product }
type ProductService struct {
	repo       productReader
	h2h        *Pulsa24Service
	mu         sync.RWMutex
	live       []domain.Product
	liveLoaded time.Time
}

func NewProductService(r productReader) *ProductService   { return &ProductService{repo: r} }
func (s *ProductService) UseH2H(provider *Pulsa24Service) { s.h2h = provider }
func (s *ProductService) List() []domain.Product {
	h2hOnce.Do(func() {
		if err := json.Unmarshal(h2hCatalogJSON, &h2hProducts); err != nil {
			panic("katalog H2H KuotaKita tidak valid: " + err.Error())
		}
	})
	result := make([]domain.Product, 0, len(h2hProducts)+64)
	result = append(result, h2hProducts...)
	seen := make(map[string]struct{}, len(result))
	for _, product := range result {
		seen[product.ID] = struct{}{}
	}
	for _, product := range append(s.repo.FindProducts(), extendedProducts()...) {
		if _, exists := seen[product.ID]; exists {
			continue
		}
		seen[product.ID] = struct{}{}
		result = append(result, product)
	}
	return result
}

func (s *ProductService) ListByService(serviceName string) []domain.Product {
	if live, err := s.liveProducts(); err == nil && len(live) > 0 {
		return filterProductsByService(live, serviceName)
	}
	// Once H2HR is configured, an embedded snapshot must never become a
	// purchasable fallback. Provider catalogues change and stale SKUs are
	// rejected by PAY even though their old name and price still look valid.
	if s.h2h != nil && s.h2h.Enabled() {
		return []domain.Product{}
	}
	return filterProductsByService(s.List(), serviceName)
}

// LiveProduct returns an exact, currently advertised H2HR SKU. It is used by
// checkout as a final server-side guard against stale browser/catalog data.
func (s *ProductService) LiveProduct(sku string) (domain.Product, bool, error) {
	products, err := s.liveProducts()
	if err != nil {
		return domain.Product{}, false, err
	}
	sku = strings.TrimSpace(sku)
	for _, product := range products {
		if strings.EqualFold(product.SKU, sku) {
			return product, true, nil
		}
	}
	return domain.Product{}, false, nil
}

func filterProductsByService(all []domain.Product, serviceName string) []domain.Product {
	serviceName = strings.TrimSpace(strings.ToLower(serviceName))
	if serviceName == "" {
		return all
	}
	result := make([]domain.Product, 0, len(all)/8)
	for _, product := range all {
		if strings.EqualFold(product.Service, serviceName) {
			result = append(result, product)
		}
	}
	return result
}

func (s *ProductService) liveProducts() ([]domain.Product, error) {
	if s.h2h == nil || !s.h2h.Enabled() {
		return nil, fmt.Errorf("H2HR tidak aktif")
	}
	s.mu.RLock()
	if len(s.live) > 0 && time.Since(s.liveLoaded) < 5*time.Minute {
		result := append([]domain.Product(nil), s.live...)
		s.mu.RUnlock()
		return result, nil
	}
	s.mu.RUnlock()
	response, err := s.h2h.Products("")
	if err != nil {
		return nil, err
	}
	items, ok := response.Raw["items"].([]any)
	if !ok {
		return nil, fmt.Errorf("daftar PRODUK H2HR tidak ditemukan")
	}
	products := make([]domain.Product, 0, len(items))
	seen := make(map[string]struct{}, len(items))
	for _, value := range items {
		row, ok := value.(map[string]any)
		if !ok {
			continue
		}
		sku := strings.TrimSpace(stringVal(row, "sku"))
		if sku == "" {
			continue
		}
		key := strings.ToUpper(sku)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		name := firstText(stringVal(row, "nama"), stringVal(row, "name"), sku)
		group := firstText(stringVal(row, "group_name"), stringVal(row, "group"))
		category := firstText(stringVal(row, "kategori_nama"), stringVal(row, "category"), group)
		brand := firstText(stringVal(row, "brand_nama"), stringVal(row, "brand"), category)
		priceType := strings.ToUpper(firstText(stringVal(row, "tipe_harga"), "FIXED"))
		price := firstIntValP24(row, "harga", "price", "fee_tambahan")
		nominal := price
		if strings.Contains(priceType, "OPEN") {
			// A number of wallet routes are marked OPEN_AMOUNT even though the
			// product name fixes the denomination (for example DANA 10.000).
			// Preserve that denomination so the UI cannot send DANA10 with qty
			// 100000. Truly free-amount products keep nominal zero.
			nominal = namedNominalP24(name)
			if fee := firstIntValP24(row, "fee_tambahan", "fee"); fee > 0 {
				price = fee
			}
		}
		products = append(products, domain.Product{ID: "h2hr-" + strings.ToLower(sku), SKU: sku, Service: classifyH2HRService(category, group, brand, name), Operator: brand, Name: name, Group: group, Category: category, Nominal: nominal, Price: price, Stock: 999, Status: priceType})
	}
	if len(products) == 0 {
		return nil, fmt.Errorf("katalog H2HR kosong")
	}
	s.mu.Lock()
	s.live, s.liveLoaded = append([]domain.Product(nil), products...), time.Now()
	s.mu.Unlock()
	return products, nil
}

var dottedNominalP24 = regexp.MustCompile(`(?:^|\D)(\d{1,3}(?:[.,]\d{3})+)(?:\D|$)`)

func namedNominalP24(name string) int64 {
	match := dottedNominalP24.FindStringSubmatch(name)
	if len(match) != 2 {
		return 0
	}
	value := strings.NewReplacer(".", "", ",", "").Replace(match[1])
	nominal, _ := strconv.ParseInt(value, 10, 64)
	return nominal
}

func classifyH2HRService(category, group, brand, name string) string {
	value := strings.ToLower(strings.Join([]string{category, group, brand, name}, " "))
	rules := []struct {
		service string
		words   []string
	}{
		{"bpjs", []string{"bpjs"}}, {"pdam", []string{"pdam", "air minum"}}, {"pln", []string{"pln", "listrik"}},
		{"gas", []string{"pgn", "tagihan gas"}}, {"multifinance", []string{"multifinance", "leasing", "cicilan"}},
		{"creditcard", []string{"kartu kredit"}}, {"insurance", []string{"asuransi", "insurance"}}, {"school", []string{"pendidikan", "sekolah", "universitas"}},
		{"tax", []string{"pajak", "pbb", "penerimaan negara"}}, {"zakat", []string{"zakat", "donasi"}}, {"parking", []string{"parking", "parkir"}},
		{"toll", []string{"e-toll", "tol"}}, {"emoney", []string{"e-money", "emoney", "uang elektronik"}}, {"bank", []string{"bank transfer", "transfer bank", "rtol"}},
		{"ewallet", []string{"e-wallet", "ewallet", "dompet digital"}}, {"game", []string{"game", "diamond"}}, {"streaming", []string{"streaming"}},
		{"voucher", []string{"voucher"}}, {"esim", []string{"esim"}}, {"data", []string{"paket data", "internet data", "kuota"}},
		{"pulsa", []string{"pulsa", "masa aktif"}}, {"telkom", []string{"telkom", "indihome"}}, {"tv", []string{"televisi", "tv berlangganan"}},
		{"internet", []string{"internet"}}, {"pascabayar", []string{"pascabayar", "postpaid"}},
	}
	for _, rule := range rules {
		for _, word := range rule.words {
			if strings.Contains(value, word) {
				return rule.service
			}
		}
	}
	return "voucher"
}
