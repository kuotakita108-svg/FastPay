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
				WHEN 'user-preferences' THEN jsonb_object_length(COALESCE(payload->'users', '{}'::jsonb))
				WHEN 'wallet-transactions' THEN jsonb_object_length(COALESCE(payload->'items', '{}'::jsonb))
				ELSE 0
			END AS total_data,
			updated_at
		FROM app_state
		ORDER BY namespace`); err != nil {
		_ = db.Close()
		return nil, err
	}
	return &StateStore{db: db}, nil
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
	return err
}

func (s *StateStore) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}
