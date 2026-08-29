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
		{"pending application permits limit increase", map[string]any{"status": "Menunggu verifikasi marketing", "creditStatus": "Menunggu keputusan"}, false},
		{"approved active credit permits limit increase", map[string]any{"status": "Disetujui", "paymentStatus": "Belum lunas"}, false},
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

func TestApprovedApplicationRemainsVisibleToOperator(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "marketing-visible", Password: "marketing-secret", Name: "Marketing Visible", Role: "marketing"},
		{Username: "operator-visible", Password: "operator-secret", Name: "Operator Visible", Role: "operator"},
	})
	marketing, _ := auth.Login("marketing-visible", "marketing-secret")
	_, err := auth.CreateAgent("Bearer "+marketing.Token, domain.RegisterInput{Name: "Agent Visible", Username: "agent-visible", StoreName: "Toko Visible", Phone: "081234567899", Password: "agent-secret"})
	if err != nil {
		t.Fatal(err)
	}
	agent, _ := auth.Login("agent-visible", "agent-secret")
	operator, _ := auth.Login("operator-visible", "operator-secret")
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	created, err := credit.Save("Bearer "+agent.Token, map[string]any{
		"id": "KSA-VISIBLE-1", "form": map[string]any{"agentName": "Agent Visible", "amount": 500000},
	})
	if err != nil {
		t.Fatal(err)
	}
	created["status"] = "Disetujui"
	if _, err = credit.Save("Bearer "+operator.Token, created); err != nil {
		t.Fatal(err)
	}
	rows, err := credit.List("Bearer " + operator.Token)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || stringValue(rows[0]["id"]) != "KSA-VISIBLE-1" || stringValue(rows[0]["status"]) != "Disetujui" {
		t.Fatalf("approved application disappeared from operator list: %#v", rows)
	}
}

func TestOperatorSummaryUpdatePreservesStoredDocumentImages(t *testing.T) {
	auth := newAuthService("test-secret", "", nil, []AccountSeed{
		{Username: "operator-doc", Password: "operator-secret", Name: "Operator Doc", Role: "operator"},
		{Username: "agent-doc", Password: "agent-secret", Name: "Agent Doc", Role: "agent"},
	})
	agent, _ := auth.Login("agent-doc", "agent-secret")
	operator, _ := auth.Login("operator-doc", "operator-secret")
	credit := NewCreditService(filepath.Join(t.TempDir(), "credit.json"), auth)
	const image = "data:image/jpeg;base64,cGVyc2lzdGVudC1kb2N1bWVudA=="
	_, err := credit.Save("Bearer "+agent.Token, map[string]any{
		"id":   "KSA-DOCUMENT-1",
		"form": map[string]any{"amount": 500000},
		"documents": map[string]any{
			"ktp": map[string]any{"name": "ktp.jpg", "image": image},
		},
		"agentConsent": map[string]any{"signature": "data:image/png;base64,c2lnbmF0dXJl"},
	})
	if err != nil {
		t.Fatal(err)
	}

	summaries, err := credit.ListSummary("Bearer " + operator.Token)
	if err != nil || len(summaries) != 1 {
		t.Fatalf("summary list = %#v, err = %v", summaries, err)
	}
	summaryDocument := summaries[0]["documents"].(map[string]any)["ktp"].(map[string]any)
	if _, exists := summaryDocument["image"]; exists {
		t.Fatal("summary unexpectedly includes embedded image")
	}
	summaries[0]["status"] = "Disetujui"
	if _, err = credit.Save("Bearer "+operator.Token, summaries[0]); err != nil {
		t.Fatal(err)
	}

	document, err := credit.GetDocument("Bearer "+operator.Token, "KSA-DOCUMENT-1", "ktp")
	if err != nil {
		t.Fatal(err)
	}
	if document["image"] != image {
		t.Fatalf("stored image was lost after compact update: %#v", document)
	}
	application, err := credit.Get("Bearer "+operator.Token, "KSA-DOCUMENT-1")
	if err != nil {
		t.Fatal(err)
	}
	consent := application["agentConsent"].(map[string]any)
	if consent["signature"] != "data:image/png;base64,c2lnbmF0dXJl" {
		t.Fatalf("stored signature was lost after compact update: %#v", consent)
	}
}

func TestOperatorRecordsRetailPaymentAndRenewsRevolvingCapital(t *testing.T) {
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
	increase, err := credit.Save("Bearer "+agent.Token, map[string]any{"id": "KSA-PAY-2", "form": map[string]any{"amount": 500000}})
	if err != nil {
		t.Fatal(err)
	}
	increase["status"] = "Disetujui"
	if _, err = credit.Save("Bearer "+operator.Token, increase); err != nil {
		t.Fatal(err)
	}
	payment := map[string]any{
		"amount": 600000, "transferredAt": "2026-08-26T10:30", "destinationBank": "BCA",
		"destinationAccountNumber": "1234567890", "destinationAccountName": "KuotaKita", "senderName": "Agent Bayar",
		"requestId": "payment-fifo-600",
	}
	renewed, err := credit.RecordPayment("Bearer "+operator.Token, "KSA-PAY-1", payment)
	if err != nil {
		t.Fatal(err)
	}
	if intValue(renewed["capitalOutstanding"]) != 600000 || renewed["paymentStatus"] != "Aktif" || renewed["capitalStatus"] != "Aktif" {
		t.Fatalf("renewed payment result = %#v", renewed)
	}
	rows, err := credit.List("Bearer " + operator.Token)
	if err != nil {
		t.Fatal(err)
	}
	var activeOutstanding int64
	var settled int
	for _, row := range rows {
		activeOutstanding += intValue(row["capitalOutstanding"])
		if stringValue(row["status"]) == "Lunas" {
			settled++
		}
	}
	// Rp500.000 closes the oldest facility, Rp100.000 reduces the second
	// facility to Rp400.000, and the full Rp600.000 opens a new cycle. Total
	// active capital therefore remains Rp1.000.000 until partnership ends.
	if activeOutstanding != 1000000 || settled != 1 {
		t.Fatalf("FIFO revolving allocation: outstanding=%d settled=%d rows=%#v", activeOutstanding, settled, rows)
	}
	current, _ := auth.CurrentUser("Bearer " + agent.Token)
	if current.Balance != 1600000 {
		t.Fatalf("full cycle payment did not refill wallet: %d", current.Balance)
	}
	// Retrying the same request must return the saved result without adding
	// money a second time.
	if _, err = credit.RecordPayment("Bearer "+operator.Token, "KSA-PAY-1", payment); err != nil {
		t.Fatal(err)
	}
	current, _ = auth.CurrentUser("Bearer " + agent.Token)
	if current.Balance != 1600000 {
		t.Fatalf("duplicate payment refilled wallet twice: %d", current.Balance)
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
