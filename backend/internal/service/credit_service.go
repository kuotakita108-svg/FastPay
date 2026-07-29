package service

import (
	"encoding/json"
	"errors"
	"kuotakita/backend/internal/database"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// CreditService is the server source of truth for agent-credit applications.
// The frontend may cache for display, but all writes are stored in the
// persistent Docker volume so they are available to agent, marketing and analis.
type CreditService struct {
	path  string
	auth  *AuthService
	state *database.StateStore
	mu    sync.RWMutex
	rows  map[string]map[string]any
}

type creditFile struct {
	Applications []map[string]any `json:"applications"`
}

func NewCreditService(path string, auth *AuthService) *CreditService {
	return NewDatabaseCreditService(path, auth, nil)
}

func NewDatabaseCreditService(path string, auth *AuthService, state *database.StateStore) *CreditService {
	s := &CreditService{path: path, auth: auth, state: state, rows: map[string]map[string]any{}}
	if err := s.load(); err != nil {
		panic(err)
	}
	return s
}

func (s *CreditService) List(token string) ([]map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	result := make([]map[string]any, 0, len(s.rows))
	for _, row := range s.rows {
		if user.Role == "agent" && stringValue(row["_owner_id"]) != user.ID {
			continue
		}
		result = append(result, publicCredit(row))
	}
	sort.Slice(result, func(i, j int) bool { return stringValue(result[i]["updatedAt"]) > stringValue(result[j]["updatedAt"]) })
	return result, nil
}

func (s *CreditService) Save(token string, input map[string]any) (map[string]any, error) {
	user, err := s.auth.CurrentUser(token)
	if err != nil {
		return nil, err
	}
	id := strings.TrimSpace(stringValue(input["id"]))
	if id == "" {
		return nil, errors.New("id pengajuan tidak valid")
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	current, exists := s.rows[id]
	if exists && user.Role == "agent" && stringValue(current["_owner_id"]) != user.ID {
		return nil, errors.New("pengajuan ini bukan milik agent")
	}
	if !exists && user.Role != "agent" && user.Role != "marketing" && user.Role != "analis" && user.Role != "master" && user.Role != "admin" {
		return nil, errors.New("akun tidak memiliki akses kredit")
	}

	row := cloneCredit(input)
	if exists {
		// Preserve ownership even when a reviewer updates status, signature, or cicilan.
		row["_owner_id"] = current["_owner_id"]
	} else {
		row["_owner_id"] = user.ID
		if user.Role == "agent" {
			row["userId"] = user.ID
			row["userName"] = user.Name
		}
	}
	row["id"] = id
	if strings.TrimSpace(stringValue(row["createdAt"])) == "" {
		row["createdAt"] = time.Now().UTC().Format(time.RFC3339)
	}
	row["updatedAt"] = time.Now().UTC().Format(time.RFC3339)
	s.rows[id] = row
	if err := s.saveLocked(); err != nil {
		return nil, errors.New("data kredit belum dapat disimpan ke server")
	}
	return publicCredit(row), nil
}

func (s *CreditService) load() error {
	if s.state != nil {
		var file creditFile
		found, err := s.state.Load("credit-applications", &file)
		if err != nil {
			return err
		}
		if found {
			for _, row := range file.Applications {
				if id := strings.TrimSpace(stringValue(row["id"])); id != "" {
					s.rows[id] = row
				}
			}
			return nil
		}
	}
	if err := os.MkdirAll(filepath.Dir(s.path), 0700); err != nil {
		return err
	}
	bytes, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		if s.state != nil {
			return s.state.Save("credit-applications", creditFile{Applications: s.allRows()})
		}
		return nil
	}
	if err != nil {
		return err
	}
	var file creditFile
	if err := json.Unmarshal(bytes, &file); err != nil {
		return err
	}
	for _, row := range file.Applications {
		if id := strings.TrimSpace(stringValue(row["id"])); id != "" {
			s.rows[id] = row
		}
	}
	if s.state != nil {
		return s.state.Save("credit-applications", creditFile{Applications: s.allRows()})
	}
	return nil
}

func (s *CreditService) saveLocked() error {
	items := s.allRows()
	if s.state != nil {
		return s.state.Save("credit-applications", creditFile{Applications: items})
	}
	bytes, err := json.MarshalIndent(creditFile{Applications: items}, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, bytes, 0600); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

func (s *CreditService) allRows() []map[string]any {
	items := make([]map[string]any, 0, len(s.rows))
	for _, row := range s.rows {
		items = append(items, row)
	}
	return items
}

func cloneCredit(value map[string]any) map[string]any {
	encoded, _ := json.Marshal(value)
	var cloned map[string]any
	_ = json.Unmarshal(encoded, &cloned)
	return cloned
}
func publicCredit(row map[string]any) map[string]any {
	out := cloneCredit(row)
	delete(out, "_owner_id")
	return out
}
func stringValue(value any) string { text, _ := value.(string); return text }
