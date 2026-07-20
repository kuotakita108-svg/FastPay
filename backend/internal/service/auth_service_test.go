package service

import "testing"

func TestLoginRoles(t *testing.T) {
	service := NewAuthService("test-secret")
	cases := map[string]string{"octa11": "user", "octa22": "master", "octa33": "admin"}
	for password, role := range cases {
		result, err := service.Login("octa", password)
		if err != nil {
			t.Fatalf("login %s gagal: %v", role, err)
		}
		if result.User.Role != role {
			t.Fatalf("role %s, ingin %s", result.User.Role, role)
		}
		if result.Token == "" {
			t.Fatal("token kosong")
		}
	}
}
func TestLoginRejected(t *testing.T) {
	service := NewAuthService("test-secret")
	if _, err := service.Login("octa", "salah"); err == nil {
		t.Fatal("password salah seharusnya ditolak")
	}
}
