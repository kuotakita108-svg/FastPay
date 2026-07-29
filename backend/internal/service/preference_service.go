package service

import (
	"encoding/json"
	"errors"
	"kuotakita/backend/internal/database"
	"os"
	"path/filepath"
	"sync"
)

// PreferenceService keeps per-account UI and payment preferences in the
// server data volume. Nothing in this service is shared between users.
type PreferenceService struct {
	mu       sync.RWMutex
	auth     *AuthService
	dataFile string
	state    *database.StateStore
	users    map[string]map[string]any
}

type preferenceFile struct {
	Users map[string]map[string]any `json:"users"`
}

func NewPreferenceService(auth *AuthService, dataFile string) *PreferenceService {
	return NewDatabasePreferenceService(auth, dataFile, nil)
}

func NewDatabasePreferenceService(auth *AuthService, dataFile string, state *database.StateStore) *PreferenceService {
	s := &PreferenceService{auth: auth, dataFile: dataFile, state: state, users: map[string]map[string]any{}}
	_ = s.load()
	return s
}

func (s *PreferenceService) Get(token string) (map[string]any, error) {
	id, err := s.auth.UserID(token)
	if err != nil {
		return nil, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	return clonePreferences(s.users[id]), nil
}

func (s *PreferenceService) Save(token string, update map[string]any) (map[string]any, error) {
	id, err := s.auth.UserID(token)
	if err != nil {
		return nil, err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	current := clonePreferences(s.users[id])
	for _, section := range []string{"favorites", "security", "notifications", "theme"} {
		if value, ok := update[section]; ok {
			current[section] = value
		}
	}
	s.users[id] = current
	if err := s.saveLocked(); err != nil {
		return nil, err
	}
	return clonePreferences(current), nil
}

func clonePreferences(in map[string]any) map[string]any {
	if in == nil {
		return map[string]any{}
	}
	b, _ := json.Marshal(in)
	out := map[string]any{}
	_ = json.Unmarshal(b, &out)
	return out
}
func (s *PreferenceService) load() error {
	if s.state != nil {
		var data preferenceFile
		found, err := s.state.Load("user-preferences", &data)
		if err != nil {
			return err
		}
		if found {
			if data.Users != nil {
				s.users = data.Users
			}
			return nil
		}
	}
	if s.dataFile == "" {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(s.dataFile), 0700); err != nil {
		return err
	}
	b, err := os.ReadFile(s.dataFile)
	if os.IsNotExist(err) {
		if s.state != nil {
			return s.state.Save("user-preferences", preferenceFile{Users: s.users})
		}
		return nil
	}
	if err != nil {
		return err
	}
	var data preferenceFile
	if err := json.Unmarshal(b, &data); err != nil {
		return err
	}
	if data.Users != nil {
		s.users = data.Users
	}
	if s.state != nil {
		return s.state.Save("user-preferences", preferenceFile{Users: s.users})
	}
	return nil
}
func (s *PreferenceService) saveLocked() error {
	if s.state != nil {
		return s.state.Save("user-preferences", preferenceFile{Users: s.users})
	}
	if s.dataFile == "" {
		return errors.New("penyimpanan preferensi belum diatur")
	}
	b, err := json.Marshal(preferenceFile{Users: s.users})
	if err != nil {
		return err
	}
	tmp := s.dataFile + ".tmp"
	if err := os.WriteFile(tmp, b, 0600); err != nil {
		return err
	}
	return os.Rename(tmp, s.dataFile)
}
