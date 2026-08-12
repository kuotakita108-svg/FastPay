package service

import (
	"kuotakita/backend/internal/domain"
	"path/filepath"
	"testing"
)

func TestBlocksNewCredit(t *testing.T) {
	tests := []struct {
		name string
		row  map[string]any
		want bool
	}{
		{"pending application", map[string]any{"status": "Menunggu verifikasi marketing", "creditStatus": "Menunggu keputusan"}, true},
		{"approved active credit", map[string]any{"status": "Disetujui", "paymentStatus": "Belum lunas"}, true},
		{"rejected application", map[string]any{"status": "Ditolak"}, false},
		{"fully paid credit", map[string]any{"status": "Disetujui", "paymentStatus": "Lunas"}, false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := blocksNewCredit(test.row); got != test.want {
				t.Fatalf("blocksNewCredit() = %v, want %v", got, test.want)
			}
		})
	}
}

func TestMarketingApplicationBelongsToSelectedAgent(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{{Username: "marketing-test", Password: "marketing-secret", Name: "Marketing Test", Role: "marketing"}})
	marketing, err := auth.Login("marketing-test", "marketing-secret")
	if err != nil {
		t.Fatal(err)
	}
	agent, err := auth.CreateAgent("Bearer "+marketing.Token, domain.RegisterInput{Name: "Agent Terpilih", Username: "agent-terpilih", StoreName: "Toko Terpilih", Phone: "081234567890", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	_, err = credit.Save("Bearer "+marketing.Token, map[string]any{
		"id": "KSA-TEST-1", "userId": agent.ID, "status": "Menunggu verifikasi marketing",
		"form":           map[string]any{"agentName": "Nama Palsu", "storeName": "Toko Palsu", "amount": 500000},
		"agentSignature": map[string]any{"name": agent.Name, "image": "data:image/png;base64,test"},
	})
	if err != nil {
		t.Fatal(err)
	}
	agentLogin, err := auth.Login("agent-terpilih", "agent-secret")
	if err != nil {
		t.Fatal(err)
	}
	rows, err := credit.List("Bearer " + agentLogin.Token)
	if err != nil || len(rows) != 1 {
		t.Fatalf("pengajuan tidak tampil pada panel agent: rows=%d err=%v", len(rows), err)
	}
	form := rows[0]["form"].(map[string]any)
	if rows[0]["userId"] != agent.ID || form["agentName"] != agent.Name || form["storeName"] != agent.StoreName {
		t.Fatalf("identitas agent tidak dikunci dari server: %#v", rows[0])
	}
}
