package service

import (
	"kuotakita/backend/internal/domain"
	"testing"
)

func TestLookupOperator(t *testing.T) {
	result, err := NewLookupService().Lookup(domain.LookupInput{Service: "pulsa", Target: "081234567890"})
	if err != nil {
		t.Fatal(err)
	}
	if result.Provider != "Telkomsel" {
		t.Fatalf("operator=%s", result.Provider)
	}
	if result.CustomerName != "" {
		t.Fatalf("nama penerima tidak boleh dibuat-buat: %q", result.CustomerName)
	}
}
func TestLookupWalletNeedsProvider(t *testing.T) {
	_, err := NewLookupService().Lookup(domain.LookupInput{Service: "ewallet", Target: "081234567890"})
	if err == nil {
		t.Fatal("e-wallet tanpa provider harus ditolak")
	}
}
