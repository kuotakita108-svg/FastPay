package service

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"os"
	"path/filepath"
	"testing"

	"kuotakita/backend/internal/domain"
)

func TestLegacyPasswordLoginUpgradesHash(t *testing.T) {
	dataFile := filepath.Join(t.TempDir(), "accounts.json")
	salt := []byte("legacy-kuotakita")
	sum := sha256.Sum256(append(salt, []byte("rahasia-lama")...))
	legacyHash := hex.EncodeToString(salt) + ":" + hex.EncodeToString(sum[:])
	payload := accountFile{Users: []storedUser{{User: domain.User{ID: "usr_legacy", Username: "agent-lama", Name: "Agent Lama", Role: "agent"}, PasswordHash: legacyHash}}}
	raw, _ := json.Marshal(payload)
	if err := os.WriteFile(dataFile, raw, 0600); err != nil {
		t.Fatal(err)
	}
	service := NewPersistentAuthService("test-secret", dataFile, nil)
	if _, err := service.Login("agent-lama", "rahasia-lama"); err != nil {
		t.Fatalf("login hash lama gagal: %v", err)
	}
	var saved accountFile
	updated, _ := os.ReadFile(dataFile)
	_ = json.Unmarshal(updated, &saved)
	if len(saved.Users) != 1 || len(saved.Users[0].PasswordHash) < 2 || saved.Users[0].PasswordHash[:2] != "$2" {
		t.Fatal("hash lama tidak dinaikkan ke bcrypt")
	}
}

func TestLoginRoles(t *testing.T) {
	service := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "user-test", Password: "user-secret", Name: "User", Role: "user"},
		{Username: "master-test", Password: "master-secret", Name: "Master", Role: "master"},
		{Username: "admin-test", Password: "admin-secret", Name: "Admin", Role: "admin"},
	})
	cases := []struct{ username, password, role string }{
		{"user-test", "user-secret", "user"},
		{"master-test", "master-secret", "master"},
		{"admin-test", "admin-secret", "admin"},
	}
	for _, test := range cases {
		result, err := service.Login(test.username, test.password)
		if err != nil {
			t.Fatalf("login %s gagal: %v", test.role, err)
		}
		if result.User.Role != test.role {
			t.Fatalf("role %s, ingin %s", result.User.Role, test.role)
		}
		if result.Token == "" {
			t.Fatal("token kosong")
		}
	}
}
func TestLoginRejected(t *testing.T) {
	service := NewAuthService("test-secret")
	if _, err := service.Login("akun-tidak-ada", "salah"); err == nil {
		t.Fatal("password salah seharusnya ditolak")
	}
}

func TestH2HTesterPasswordFollowsEnvironmentSeed(t *testing.T) {
	dataFile := filepath.Join(t.TempDir(), "accounts.json")
	initial := NewPersistentAuthService("test-secret", dataFile, []AccountSeed{
		{Username: "owner-tester", Password: "password-lama", Name: "Owner Test H2H", Role: "user", SyncPassword: true},
	})
	if _, err := initial.Login("owner-tester", "password-lama"); err != nil {
		t.Fatalf("login awal gagal: %v", err)
	}

	restarted := NewPersistentAuthService("test-secret", dataFile, []AccountSeed{
		{Username: "owner-tester", Password: "password-baru", Name: "Owner Test H2H", Role: "user", SyncPassword: true},
	})
	if _, err := restarted.Login("owner-tester", "password-baru"); err != nil {
		t.Fatalf("password dari environment baru tidak tersinkron: %v", err)
	}
	if _, err := restarted.Login("owner-tester", "password-lama"); err == nil {
		t.Fatal("password lama seharusnya sudah ditolak")
	}
}

func TestConfiguredMasterFollowsPasswordAndRole(t *testing.T) {
	dataFile := filepath.Join(t.TempDir(), "accounts.json")
	initial := NewPersistentAuthService("test-secret", dataFile, []AccountSeed{
		{Username: "admin", Password: "password-lama", Name: "Akun Lama", Role: "user"},
	})
	if _, err := initial.Login("admin", "password-lama"); err != nil {
		t.Fatalf("login awal gagal: %v", err)
	}

	restarted := NewPersistentAuthService("test-secret", dataFile, []AccountSeed{
		{Username: "admin", Password: "password-baru", Name: "Master KuotaKita", Role: "master", SyncPassword: true, SyncRole: true},
	})
	result, err := restarted.Login("admin", "password-baru")
	if err != nil {
		t.Fatalf("login master tersinkron gagal: %v", err)
	}
	if result.User.Role != "master" || result.User.Name != "Master KuotaKita" {
		t.Fatalf("identitas master tidak tersinkron: role=%s name=%s", result.User.Role, result.User.Name)
	}
}

func TestAgentCanOnlyCreateUserDownline(t *testing.T) {
	service := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "agent-test", Password: "agent-secret", Name: "Agent Test", Role: "agent"},
	})
	login, err := service.Login("agent-test", "agent-secret")
	if err != nil {
		t.Fatalf("login agent gagal: %v", err)
	}
	user, err := service.CreateDownline("Bearer "+login.Token, domain.RegisterInput{
		Name: "Member Test", Email: "member@example.com", Password: "member-secret", AccountType: "user",
	})
	if err != nil {
		t.Fatalf("membuat member gagal: %v", err)
	}
	if user.Role != "user" {
		t.Fatalf("role downline = %q, ingin user", user.Role)
	}
	if _, err := service.CreateDownline("Bearer "+login.Token, domain.RegisterInput{
		Name: "Agent Turunan", Email: "turunan@example.com", Password: "agent-secret", AccountType: "agent",
	}); err == nil {
		t.Fatal("Agent seharusnya tidak dapat membuat Agent lain")
	}
	rows, err := service.ManagedDownlines("Bearer " + login.Token)
	if err != nil || len(rows) != 1 || rows[0].Role != "user" {
		t.Fatalf("daftar member agent tidak sesuai: rows=%v err=%v", rows, err)
	}
}
