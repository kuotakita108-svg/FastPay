package database

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	_ "github.com/lib/pq"
)

// StateStore keeps KuotaKita operational data in PostgreSQL.  Each namespace
// is one atomic JSON document, which lets us migrate the existing server data
// without dropping fields while the product evolves.
type StateStore struct {
	db *sql.DB
}

func OpenStateStore(driver, url string) (*StateStore, error) {
	if strings.TrimSpace(driver) == "" || strings.EqualFold(strings.TrimSpace(driver), "memory") {
		return nil, nil
	}
	if !strings.EqualFold(strings.TrimSpace(driver), "postgres") {
		return nil, fmt.Errorf("database driver %q tidak didukung", driver)
	}
	if strings.TrimSpace(url) == "" {
		return nil, errors.New("DATABASE_URL PostgreSQL belum diatur")
	}
	db, err := sql.Open("postgres", url)
	if err != nil {
		return nil, err
	}
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS app_state (
		namespace TEXT PRIMARY KEY,
		payload JSONB NOT NULL,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`); err != nil {
		_ = db.Close()
		return nil, err
	}
	if _, err := db.Exec(`CREATE OR REPLACE VIEW v_app_state_overview AS
		SELECT
			namespace,
			CASE namespace
				WHEN 'accounts' THEN jsonb_array_length(COALESCE(payload->'users', '[]'::jsonb))
				WHEN 'credit-applications' THEN jsonb_array_length(COALESCE(payload->'applications', '[]'::jsonb))
				WHEN 'user-preferences' THEN (SELECT count(*) FROM jsonb_object_keys(COALESCE(payload->'users', '{}'::jsonb)))
				WHEN 'wallet-transactions' THEN (SELECT count(*) FROM jsonb_object_keys(COALESCE(payload->'items', '{}'::jsonb)))
				ELSE 0
			END AS total_data,
			updated_at
		FROM app_state
		ORDER BY namespace`); err != nil {
		_ = db.Close()
		return nil, err
	}
	store := &StateStore{db: db}
	if err := store.syncExisting(); err != nil {
		_ = db.Close()
		return nil, err
	}
	return store, nil
}

func (s *StateStore) Load(namespace string, target any) (bool, error) {
	if s == nil || s.db == nil {
		return false, nil
	}
	var raw []byte
	err := s.db.QueryRow(`SELECT payload FROM app_state WHERE namespace = $1`, namespace).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	if err := json.Unmarshal(raw, target); err != nil {
		return false, fmt.Errorf("data PostgreSQL %s rusak: %w", namespace, err)
	}
	return true, nil
}

func (s *StateStore) Save(namespace string, value any) error {
	if s == nil || s.db == nil {
		return nil
	}
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`INSERT INTO app_state (namespace, payload, updated_at)
		VALUES ($1, $2::jsonb, NOW())
		ON CONFLICT (namespace) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`, namespace, string(raw))
	if err != nil {
		return err
	}
	return s.syncNamespace(namespace, raw)
}

// syncExisting mirrors existing grouped data into the feature tables. It keeps
// pgAdmin useful for operational checks while app_state remains an atomic,
// backward-compatible source of truth.
func (s *StateStore) syncExisting() error {
	for _, namespace := range []string{"accounts", "wallet-transactions", "credit-applications", "user-preferences"} {
		var raw []byte
		err := s.db.QueryRow(`SELECT payload FROM app_state WHERE namespace = $1`, namespace).Scan(&raw)
		if errors.Is(err, sql.ErrNoRows) {
			continue
		}
		if err != nil {
			return err
		}
		if err := s.syncNamespace(namespace, raw); err != nil {
			return err
		}
	}
	return nil
}

func (s *StateStore) syncNamespace(namespace string, raw []byte) error {
	switch namespace {
	case "accounts":
		return s.syncAccounts(raw)
	case "wallet-transactions":
		return s.syncWalletTransactions(raw)
	case "credit-applications":
		return s.syncCreditApplications(raw)
	case "user-preferences":
		return s.syncPreferences(raw)
	default:
		return nil
	}
}

type storedAccount struct {
	ID                    string `json:"id"`
	Username              string `json:"username"`
	Name                  string `json:"name"`
	Role                  string `json:"role"`
	Phone                 string `json:"phone"`
	Email                 string `json:"email"`
	Balance               int64  `json:"balance"`
	PasswordHash          string `json:"password_hash"`
	GoogleID              string `json:"google_id"`
	InitialBalanceGranted bool   `json:"initial_balance_granted"`
}

func (s *StateStore) syncAccounts(raw []byte) error {
	var doc struct {
		Users []storedAccount `json:"users"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for _, user := range doc.Users {
		if user.ID == "" || user.Username == "" {
			continue
		}
		_, err = tx.Exec(`INSERT INTO app_users
			(id, username, name, role, phone, email, password_hash, google_id, balance, initial_balance_granted, updated_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,NULLIF($8,''),$9,$10,NOW())
			ON CONFLICT (id) DO UPDATE SET username=EXCLUDED.username, name=EXCLUDED.name, role=EXCLUDED.role,
			phone=EXCLUDED.phone, email=EXCLUDED.email, password_hash=EXCLUDED.password_hash, google_id=EXCLUDED.google_id,
			balance=EXCLUDED.balance, initial_balance_granted=EXCLUDED.initial_balance_granted, updated_at=NOW()`,
			user.ID, user.Username, user.Name, user.Role, user.Phone, user.Email, user.PasswordHash, user.GoogleID, user.Balance, user.InitialBalanceGranted)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

type storedTransaction struct {
	ID          string    `json:"id"`
	Customer    string    `json:"customer"`
	Email       string    `json:"email"`
	Method      string    `json:"method"`
	Amount      int64     `json:"amount"`
	Status      string    `json:"status"`
	Target      string    `json:"target"`
	Provider    string    `json:"provider"`
	Title       string    `json:"title"`
	Product     string    `json:"product"`
	OrderNumber string    `json:"order_number"`
	SN          string    `json:"sn"`
	CreatedAt   time.Time `json:"created_at"`
}

func (s *StateStore) syncWalletTransactions(raw []byte) error {
	var doc struct {
		Items map[string][]storedTransaction `json:"items"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for userID, items := range doc.Items {
		for _, item := range items {
			if item.ID == "" || userID == "" {
				continue
			}
			_, err = tx.Exec(`INSERT INTO wallet_transactions
			(id,user_id,customer,email,method,amount,status,target,provider,title,product,order_number,serial_number,created_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
			ON CONFLICT (id) DO UPDATE SET customer=EXCLUDED.customer,email=EXCLUDED.email,method=EXCLUDED.method,amount=EXCLUDED.amount,status=EXCLUDED.status,target=EXCLUDED.target,provider=EXCLUDED.provider,title=EXCLUDED.title,product=EXCLUDED.product,order_number=EXCLUDED.order_number,serial_number=EXCLUDED.serial_number`,
				item.ID, userID, item.Customer, item.Email, item.Method, item.Amount, item.Status, item.Target, item.Provider, item.Title, item.Product, item.OrderNumber, item.SN, item.CreatedAt)
			if err != nil {
				return err
			}
		}
	}
	return tx.Commit()
}

func (s *StateStore) syncCreditApplications(raw []byte) error {
	var doc struct {
		Applications []map[string]json.RawMessage `json:"applications"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for _, row := range doc.Applications {
		var id, owner, status string
		var directAmount, formAmount int64
		_ = json.Unmarshal(row["id"], &id)
		_ = json.Unmarshal(row["_owner_id"], &owner)
		_ = json.Unmarshal(row["status"], &status)
		_ = json.Unmarshal(row["amount"], &directAmount)
		var form map[string]json.RawMessage
		_ = json.Unmarshal(row["form"], &form)
		_ = json.Unmarshal(form["amount"], &formAmount)
		amount := directAmount
		if amount == 0 {
			amount = formAmount
		}
		if id == "" || owner == "" || amount <= 0 {
			continue
		}
		formRaw := jsonOrDefault(row["form"], `{}`)
		documents := jsonOrDefault(row["documents"], `{}`)
		signatures := jsonOrDefault(row["signatures"], `{}`)
		installments := jsonOrDefault(row["installments"], `[]`)
		_, err = tx.Exec(`INSERT INTO credit_applications (id,agent_user_id,status,amount,form,documents,signatures,installments,updated_at)
			VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8::jsonb,NOW())
			ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status,amount=EXCLUDED.amount,form=EXCLUDED.form,documents=EXCLUDED.documents,signatures=EXCLUDED.signatures,installments=EXCLUDED.installments,updated_at=NOW()`, id, owner, status, amount, string(formRaw), string(documents), string(signatures), string(installments))
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *StateStore) syncPreferences(raw []byte) error {
	var doc struct {
		Users map[string]map[string]json.RawMessage `json:"users"`
	}
	if err := json.Unmarshal(raw, &doc); err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	for userID, value := range doc.Users {
		if userID == "" {
			continue
		}
		var theme string
		_ = json.Unmarshal(value["theme"], &theme)
		if theme == "" {
			theme = "light"
		}
		_, err = tx.Exec(`INSERT INTO user_preferences (user_id,favorites,security,notifications,theme,updated_at)
			VALUES ($1,$2::jsonb,$3::jsonb,$4::jsonb,$5,NOW())
			ON CONFLICT (user_id) DO UPDATE SET favorites=EXCLUDED.favorites,security=EXCLUDED.security,notifications=EXCLUDED.notifications,theme=EXCLUDED.theme,updated_at=NOW()`,
			userID, string(jsonOrDefault(value["favorites"], `[]`)), string(jsonOrDefault(value["security"], `{}`)), string(jsonOrDefault(value["notifications"], `{}`)), theme)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func jsonOrDefault(value json.RawMessage, fallback string) json.RawMessage {
	if len(value) == 0 || string(value) == "null" {
		return json.RawMessage(fallback)
	}
	return value
}

func (s *StateStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}
