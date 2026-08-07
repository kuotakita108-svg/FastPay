package service

import "testing"

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
