package service

import (
	"errors"
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
		{"ended partnership can apply again", map[string]any{"status": "Disetujui", "partnershipStatus": "PARTNERSHIP_ENDED"}, false},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := blocksNewCredit(test.row); got != test.want {
				t.Fatalf("blocksNewCredit() = %v, want %v", got, test.want)
			}
		})
	}
}

func TestMarketingCanMonitorOwnCapitalApplicationsButCannotWrite(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{{Username: "marketing-test", Password: "marketing-secret", Name: "Marketing Test", Role: "marketing"}})
	marketing, err := auth.Login("marketing-test", "marketing-secret")
	if err != nil {
		t.Fatal(err)
	}
	_, err = auth.CreateAgent("Bearer "+marketing.Token, domain.RegisterInput{Name: "Agent Terpilih", Username: "agent-terpilih", StoreName: "Toko Terpilih", Phone: "081234567890", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	_, err = credit.Save("Bearer "+marketing.Token, map[string]any{"id": "KSA-TEST-1", "form": map[string]any{"amount": 500000}})
	if !errors.Is(err, ErrForbidden) {
		t.Fatalf("Marketing Save error = %v, want ErrForbidden", err)
	}
	agent, err := auth.Login("agent-terpilih", "agent-secret")
	if err != nil {
		t.Fatal(err)
	}
	_, err = credit.Save("Bearer "+agent.Token, map[string]any{"id": "KSA-TEST-AGENT", "form": map[string]any{"amount": 500000, "nik": "1234567890123456"}, "documents": map[string]any{"ktp": map[string]any{"image": "data:image/jpeg;base64,secret"}}})
	if err != nil {
		t.Fatal(err)
	}
	rows, err := credit.List("Bearer " + marketing.Token)
	if err != nil {
		t.Fatalf("Marketing List error = %v", err)
	}
	if len(rows) != 1 || rows[0]["id"] != "KSA-TEST-AGENT" {
		t.Fatalf("Marketing own application rows = %#v", rows)
	}
	form, ok := rows[0]["form"].(map[string]any)
	if !ok || form["amount"] == nil {
		t.Fatal("Marketing response did not include operational application summary")
	}
	if _, exposed := form["nik"]; exposed {
		t.Fatal("Marketing response exposed identity number")
	}
	if _, available := rows[0]["documents"]; !available {
		t.Fatal("Marketing response did not include its agent field documents")
	}
}

func TestOperatorApprovalDisbursesMainBalanceExactlyOnce(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "marketing-test", Password: "marketing-secret", Name: "Marketing Test", Role: "marketing"},
		{Username: "operator-test", Password: "operator-secret", Name: "Operator Test", Role: "operator"},
	})
	marketing, _ := auth.Login("marketing-test", "marketing-secret")
	_, err := auth.CreateAgent("Bearer "+marketing.Token, domain.RegisterInput{Name: "Agent Modal", Username: "agent-modal", StoreName: "Toko Modal", Phone: "081234567890", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	agent, _ := auth.Login("agent-modal", "agent-secret")
	operator, _ := auth.Login("operator-test", "operator-secret")
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	created, err := credit.Save("Bearer "+agent.Token, map[string]any{"id": "KSA-DIRECT-1", "status": "Disetujui", "form": map[string]any{"amount": 500000}})
	if err != nil {
		t.Fatal(err)
	}
	if created["status"] != "Menunggu keputusan operator" {
		t.Fatalf("new status = %v", created["status"])
	}
	created["status"] = "Disetujui"
	approved, err := credit.Save("Bearer "+operator.Token, created)
	if err != nil {
		t.Fatal(err)
	}
	if approved["capitalOutstanding"] != float64(500000) {
		t.Fatalf("capital outstanding = %#v", approved["capitalOutstanding"])
	}
	current, _ := auth.CurrentUser("Bearer " + agent.Token)
	if current.Balance != 500000 {
		t.Fatalf("balance after approval = %d", current.Balance)
	}
	if _, err = credit.Save("Bearer "+operator.Token, approved); err != nil {
		t.Fatal(err)
	}
	current, _ = auth.CurrentUser("Bearer " + agent.Token)
	if current.Balance != 500000 {
		t.Fatalf("duplicate approval changed balance to %d", current.Balance)
	}
}

func TestOperatorRecordsRetailPaymentAndSettlesOutstanding(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "marketing-pay", Password: "marketing-secret", Name: "Marketing Pay", Role: "marketing"},
		{Username: "operator-pay", Password: "operator-secret", Name: "Operator Pay", Role: "operator"},
	})
	marketing, _ := auth.Login("marketing-pay", "marketing-secret")
	_, err := auth.CreateAgent("Bearer "+marketing.Token, domain.RegisterInput{Name: "Agent Bayar", Username: "agent-bayar", StoreName: "Toko Bayar", Phone: "081234567891", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	agent, _ := auth.Login("agent-bayar", "agent-secret")
	operator, _ := auth.Login("operator-pay", "operator-secret")
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	created, err := credit.Save("Bearer "+agent.Token, map[string]any{"id": "KSA-PAY-1", "form": map[string]any{"amount": 500000}})
	if err != nil {
		t.Fatal(err)
	}
	created["status"] = "Disetujui"
	if _, err = credit.Save("Bearer "+operator.Token, created); err != nil {
		t.Fatal(err)
	}
	payment := map[string]any{
		"amount": 200000, "transferredAt": "2026-08-26T10:30", "destinationBank": "BCA",
		"destinationAccountNumber": "1234567890", "destinationAccountName": "KuotaKita", "senderName": "Agent Bayar",
	}
	partial, err := credit.RecordPayment("Bearer "+operator.Token, "KSA-PAY-1", payment)
	if err != nil {
		t.Fatal(err)
	}
	if intValue(partial["capitalOutstanding"]) != 300000 || partial["paymentStatus"] != "Dibayar sebagian" {
		t.Fatalf("partial payment result = %#v", partial)
	}
	payment["amount"] = 300000
	settled, err := credit.RecordPayment("Bearer "+operator.Token, "KSA-PAY-1", payment)
	if err != nil {
		t.Fatal(err)
	}
	if intValue(settled["capitalOutstanding"]) != 0 || settled["paymentStatus"] != "Lunas" || settled["capitalStatus"] != "Lunas" {
		t.Fatalf("settled payment result = %#v", settled)
	}
}

func TestMarketingAgentScopeHidesFinanceAndRejectsCrossOwnership(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "marketing-one", Password: "marketing-secret", Name: "Marketing One", Role: "marketing"},
		{Username: "marketing-two", Password: "marketing-secret", Name: "Marketing Two", Role: "marketing"},
	})
	one, _ := auth.Login("marketing-one", "marketing-secret")
	two, _ := auth.Login("marketing-two", "marketing-secret")
	agentOne, err := auth.CreateAgent("Bearer "+one.Token, domain.RegisterInput{Name: "Agent One", Username: "agent-one", StoreName: "Toko One", Phone: "081111111111", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	agentTwo, err := auth.CreateAgent("Bearer "+two.Token, domain.RegisterInput{Name: "Agent Two", Username: "agent-two", StoreName: "Toko Two", Phone: "082222222222", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	rows, err := auth.ManagedAgents("Bearer " + one.Token)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ID != agentOne.ID {
		t.Fatalf("marketing received agents outside ownership: %#v", rows)
	}
	if rows[0].Balance != nil {
		t.Fatal("marketing response exposed agent balance")
	}
	_, err = auth.UpdateAgentFollowUp("Bearer "+one.Token, agentTwo.ID, domain.AgentFollowUpInput{Status: "CONTACTED"})
	if !errors.Is(err, ErrForbidden) {
		t.Fatalf("cross-marketing follow-up error = %v, want ErrForbidden", err)
	}
}
