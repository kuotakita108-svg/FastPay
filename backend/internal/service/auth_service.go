package service

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"kuotakita/backend/internal/domain"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// AccountSeed is used only when the server has no account data yet.
// Passwords come from environment variables, never from source code.
type AccountSeed struct {
	Username string
	Password string
	Name     string
	Role     string
}

type storedUser struct {
	domain.User
	PasswordHash string    `json:"password_hash,omitempty"`
	GoogleID     string    `json:"google_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type accountFile struct {
	Users []storedUser `json:"users"`
}

type AuthService struct {
	secret   string
	dataFile string
	mu       sync.RWMutex
	users    map[string]storedUser
}

// NewAuthService is kept for tests and local development. Production should use
// NewPersistentAuthService so registration survives restarts and is shared by all devices.
func NewAuthService(secret string) *AuthService {
	return newAuthService(secret, "", nil)
}

func NewPersistentAuthService(secret, dataFile string, seeds []AccountSeed) *AuthService {
	return newAuthService(secret, dataFile, seeds)
}

func newAuthService(secret, dataFile string, seeds []AccountSeed) *AuthService {
	s := &AuthService{secret: secret, dataFile: dataFile, users: make(map[string]storedUser)}
	if dataFile != "" {
		if err := s.load(); err != nil {
			panic(fmt.Errorf("gagal memuat data akun: %w", err))
		}
	}
	if len(s.users) == 0 {
		for _, seed := range seeds {
			if strings.TrimSpace(seed.Username) == "" || seed.Password == "" {
				continue
			}
			if err := s.addSeed(seed); err != nil {
				panic(fmt.Errorf("gagal membuat akun awal: %w", err))
			}
		}
		if err := s.save(); err != nil {
			panic(fmt.Errorf("gagal menyimpan akun awal: %w", err))
		}
	}
	return s
}

func (s *AuthService) Login(identity, password string) (domain.AuthResult, error) {
	identity = normalize(identity)
	s.mu.RLock()
	var account storedUser
	for _, item := range s.users {
		if item.Username == identity || normalize(item.Email) == identity || item.Phone == identity {
			account = item
			break
		}
	}
	s.mu.RUnlock()
	if account.ID == "" && s.dataFile == "" && identity == "octa" {
		if demo, ok := demoAccount(password); ok {
			return s.result(demo), nil
		}
	}
	if account.ID == "" || account.PasswordHash == "" || bcrypt.CompareHashAndPassword([]byte(account.PasswordHash), []byte(password)) != nil {
		return domain.AuthResult{}, errors.New("username atau password salah")
	}
	return s.result(account.User), nil
}

func (s *AuthService) Register(in domain.RegisterInput) (domain.AuthResult, error) {
	user, err := s.createAccount(in, "user")
	if err != nil {
		return domain.AuthResult{}, err
	}
	return s.result(user), nil
}

func (s *AuthService) CreateAgent(token string, in domain.RegisterInput) (domain.User, error) {
	_, role, err := s.session(token)
	if err != nil {
		return domain.User{}, err
	}
	if role != "marketing" && role != "admin" && role != "master" {
		return domain.User{}, errors.New("hanya marketing atau admin yang dapat membuat akun agent")
	}
	return s.createAccount(in, "agent")
}

func (s *AuthService) createAccount(in domain.RegisterInput, role string) (domain.User, error) {
	in.Name = strings.TrimSpace(in.Name)
	in.Username = normalize(in.Username)
	in.Phone = strings.TrimSpace(in.Phone)
	in.Email = normalize(in.Email)
	if len(in.Name) < 3 || len(in.Username) < 3 || len(in.Phone) < 10 || len(in.Password) < 6 || (in.Email != "" && !strings.Contains(in.Email, "@")) {
		return domain.User{}, errors.New("lengkapi data dengan benar; password minimal 6 karakter")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.users[in.Username]; exists {
		return domain.User{}, errors.New("username sudah digunakan")
	}
	for _, item := range s.users {
		if in.Email != "" && item.Email == in.Email {
			return domain.User{}, errors.New("email sudah digunakan")
		}
		if item.Phone == in.Phone {
			return domain.User{}, errors.New("nomor HP sudah digunakan")
		}
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return domain.User{}, errors.New("gagal mengamankan kata sandi")
	}
	user := domain.User{ID: newUserID(), Username: in.Username, Name: in.Name, Role: role, Balance: 0, Phone: in.Phone, Email: in.Email}
	s.users[user.Username] = storedUser{User: user, PasswordHash: string(hash), CreatedAt: time.Now().UTC()}
	if err := s.saveLocked(); err != nil {
		delete(s.users, user.Username)
		return domain.User{}, errors.New("akun belum dapat disimpan ke server")
	}
	return user, nil
}

// GoogleLogin persists the verified Google identity, then creates a normal KuotaKita session.
func (s *AuthService) GoogleLogin(googleID, name, email string) (domain.AuthResult, error) {
	googleID, email, name = strings.TrimSpace(googleID), normalize(email), strings.TrimSpace(name)
	if googleID == "" || !strings.Contains(email, "@") {
		return domain.AuthResult{}, errors.New("profil Google tidak valid")
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	for key, item := range s.users {
		if item.GoogleID == googleID || item.Email == email {
			item.GoogleID = googleID
			if item.Name == "" {
				item.Name = name
			}
			s.users[key] = item
			if err := s.saveLocked(); err != nil {
				return domain.AuthResult{}, errors.New("akun Google belum dapat disimpan")
			}
			return s.result(item.User), nil
		}
	}
	if name == "" {
		name = strings.Split(email, "@")[0]
	}
	username := uniqueUsername(strings.Split(email, "@")[0], s.users)
	user := domain.User{ID: newUserID(), Username: username, Name: name, Role: "user", Balance: 0, Email: email}
	s.users[username] = storedUser{User: user, GoogleID: googleID, CreatedAt: time.Now().UTC()}
	if err := s.saveLocked(); err != nil {
		delete(s.users, username)
		return domain.AuthResult{}, errors.New("akun Google belum dapat disimpan")
	}
	return s.result(user), nil
}

func (s *AuthService) result(user domain.User) domain.AuthResult {
	payload := fmt.Sprintf("%s|%s|%d", user.ID, user.Role, time.Now().Add(24*time.Hour).Unix())
	mac := hmac.New(sha256.New, []byte(s.secret))
	mac.Write([]byte(payload))
	token := base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return domain.AuthResult{Token: token, User: user}
}

func (s *AuthService) session(token string) (string, string, error) {
	parts := strings.Split(strings.TrimPrefix(token, "Bearer "), ".")
	if len(parts) != 2 {
		return "", "", errors.New("sesi tidak valid")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", "", errors.New("sesi tidak valid")
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", "", errors.New("sesi tidak valid")
	}
	mac := hmac.New(sha256.New, []byte(s.secret))
	mac.Write(payload)
	if !hmac.Equal(signature, mac.Sum(nil)) {
		return "", "", errors.New("sesi tidak valid")
	}
	fields := strings.Split(string(payload), "|")
	if len(fields) != 3 {
		return "", "", errors.New("sesi tidak valid")
	}
	expiry, _ := strconv.ParseInt(fields[2], 10, 64)
	if time.Now().Unix() > expiry {
		return "", "", errors.New("sesi berakhir")
	}
	return fields[0], fields[1], nil
}

func (s *AuthService) UserID(token string) (string, error) {
	id, _, err := s.session(token)
	return id, err
}

// CurrentUser resolves the signed-in user from a session token. Handlers use
// this instead of trusting a user id sent by the browser.
func (s *AuthService) CurrentUser(token string) (domain.User, error) {
	id, _, err := s.session(token)
	if err != nil {
		return domain.User{}, err
	}
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, item := range s.users {
		if item.ID == id {
			return item.User, nil
		}
	}
	return domain.User{}, errors.New("akun tidak ditemukan")
}

func (s *AuthService) addSeed(seed AccountSeed) error {
	username := normalize(seed.Username)
	if username == "" || seed.Password == "" {
		return nil
	}
	if _, exists := s.users[username]; exists {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(seed.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	s.users[username] = storedUser{User: domain.User{ID: newUserID(), Username: username, Name: seed.Name, Role: seed.Role, Balance: 0}, PasswordHash: string(hash), CreatedAt: time.Now().UTC()}
	return nil
}

func (s *AuthService) load() error {
	if err := os.MkdirAll(filepath.Dir(s.dataFile), 0700); err != nil {
		return err
	}
	data, err := os.ReadFile(s.dataFile)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	if err != nil {
		return err
	}
	var file accountFile
	if err := json.Unmarshal(data, &file); err != nil {
		return err
	}
	for _, user := range file.Users {
		if user.Username != "" {
			s.users[user.Username] = user
		}
	}
	return nil
}

func (s *AuthService) save() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.saveLocked()
}
func (s *AuthService) saveLocked() error {
	if s.dataFile == "" {
		return nil
	}
	users := make([]storedUser, 0, len(s.users))
	for _, user := range s.users {
		users = append(users, user)
	}
	data, err := json.MarshalIndent(accountFile{Users: users}, "", "  ")
	if err != nil {
		return err
	}
	temp := s.dataFile + ".tmp"
	if err := os.WriteFile(temp, data, 0600); err != nil {
		return err
	}
	return os.Rename(temp, s.dataFile)
}

func normalize(value string) string { return strings.ToLower(strings.TrimSpace(value)) }
func newUserID() string {
	bytes := make([]byte, 8)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("USR-%d", time.Now().UnixNano())
	}
	return "USR-" + strings.ToUpper(base64.RawURLEncoding.EncodeToString(bytes))
}
func uniqueUsername(value string, users map[string]storedUser) string {
	base := strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '.' {
			return r
		}
		return '_'
	}, normalize(value))
	if base == "" {
		base = "googleuser"
	}
	result := base
	for index := 2; users[result].ID != ""; index++ {
		result = base + strconv.Itoa(index)
	}
	return result
}

func demoAccount(password string) (domain.User, bool) {
	accounts := map[string]domain.User{
		"octa11": {ID: "USR-001", Username: "octa", Name: "Octa User", Role: "user", Balance: 275000, Phone: "081234567890", Email: "user@kuotakita.id"},
		"octa22": {ID: "MST-001", Username: "octa", Name: "Octa Master", Role: "master", Balance: 25000000, Phone: "081234567890", Email: "master@kuotakita.id"},
		"octa33": {ID: "ADM-001", Username: "octa", Name: "Octa Admin", Role: "admin", Balance: 8500000, Phone: "081234567890", Email: "admin@kuotakita.id"},
	}
	user, ok := accounts[password]
	return user, ok
}
