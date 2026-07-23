package service

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"pulsaprime/backend/internal/domain"
	"fmt"
	"strconv"
	"strings"
	"time"
)

type AuthService struct{ secret string }

func NewAuthService(secret string) *AuthService { return &AuthService{secret: secret} }
func (s *AuthService) Login(username, password string) (domain.AuthResult, error) {
	username = strings.ToLower(strings.TrimSpace(username))
	accounts := map[string]domain.User{"octa11": {ID: "USR-001", Username: "octa", Name: "Octa User", Role: "user", Balance: 275000, Phone: "081234567890", Email: "user@pulsaprime.id"}, "octa22": {ID: "MST-001", Username: "octa", Name: "Octa Master", Role: "master", Balance: 25000000, Phone: "081234567890", Email: "master@pulsaprime.id"}, "octa33": {ID: "ADM-001", Username: "octa", Name: "Octa Admin", Role: "admin", Balance: 8500000, Phone: "081234567890", Email: "admin@pulsaprime.id"}}
	user, ok := accounts[password]
	if !ok || username != "octa" {
		return domain.AuthResult{}, errors.New("username atau password salah")
	}
	return s.result(user), nil
}
func (s *AuthService) Register(in domain.RegisterInput) (domain.AuthResult, error) {
	in.Name = strings.TrimSpace(in.Name)
	in.Username = strings.ToLower(strings.TrimSpace(in.Username))
	in.Phone = strings.TrimSpace(in.Phone)
	if len(in.Name) < 3 || len(in.Username) < 3 || len(in.Phone) < 10 || !strings.Contains(in.Email, "@") || len(in.Password) < 6 {
		return domain.AuthResult{}, errors.New("lengkapi data dengan benar; password minimal 6 karakter")
	}
	user := domain.User{ID: fmt.Sprintf("USR-%d", time.Now().Unix()), Username: in.Username, Name: in.Name, Role: "user", Balance: 0, Phone: in.Phone, Email: strings.ToLower(strings.TrimSpace(in.Email))}
	return s.result(user), nil
}
func (s *AuthService) result(user domain.User) domain.AuthResult {
	payload := fmt.Sprintf("%s|%s|%d", user.ID, user.Role, time.Now().Add(24*time.Hour).Unix())
	mac := hmac.New(sha256.New, []byte(s.secret))
	mac.Write([]byte(payload))
	token := base64.RawURLEncoding.EncodeToString([]byte(payload)) + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return domain.AuthResult{Token: token, User: user}
}

func (s *AuthService) UserID(token string) (string, error) {
	parts := strings.Split(strings.TrimPrefix(token, "Bearer "), ".")
	if len(parts) != 2 {
		return "", errors.New("sesi tidak valid")
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return "", errors.New("sesi tidak valid")
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return "", errors.New("sesi tidak valid")
	}
	mac := hmac.New(sha256.New, []byte(s.secret))
	mac.Write(payload)
	if !hmac.Equal(signature, mac.Sum(nil)) {
		return "", errors.New("sesi tidak valid")
	}
	fields := strings.Split(string(payload), "|")
	if len(fields) != 3 {
		return "", errors.New("sesi tidak valid")
	}
	expiry, _ := strconv.ParseInt(fields[2], 10, 64)
	if time.Now().Unix() > expiry {
		return "", errors.New("sesi berakhir")
	}
	return fields[0], nil
}
