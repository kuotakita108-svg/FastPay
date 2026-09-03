package service

import (
	"encoding/json"
	"kuotakita/backend/internal/config"
	"kuotakita/backend/internal/domain"
	"net/http"
	"net/http/httptest"
	"testing"
)

type productReaderStub struct{ products []domain.Product }

func (s productReaderStub) FindProducts() []domain.Product { return s.products }

func TestClassifyH2HRService(t *testing.T) {
	tests := map[string]string{
		classifyH2HRService("PULSA", "", "Telkomsel", "Telkomsel 5.000"): "pulsa",
		classifyH2HRService("PPOB", "PDAM", "PDAM Medan", "Cek tagihan"): "pdam",
		classifyH2HRService("GAME", "", "Mobile Legends", "86 Diamond"):  "game",
		classifyH2HRService("BANK TRANSFER", "", "BCA", "Transfer BCA"):  "bank",
	}
	for got, want := range tests {
		if got != want {
			t.Fatalf("service=%q, ingin %q", got, want)
		}
	}
}

func TestPulsa24ProductsUsesV2AndKeepsLargeItems(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v2/trx" {
			t.Fatalf("path=%q, ingin /v2/trx", r.URL.Path)
		}
		var body map[string]any
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if body["commands"] != "PRODUK" {
			t.Fatalf("command=%v", body["commands"])
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "items": []any{map[string]any{"sku": "T5", "nama": "Pulsa Telkomsel 5.000", "group_name": "PULSA", "kategori_nama": "PULSA", "brand_nama": "Telkomsel", "tipe_harga": "FIXED", "harga": 5500}}})
	}))
	defer server.Close()
	provider := NewPulsa24Service(config.Config{P24BaseURL: server.URL, P24APIKey: "key", P24PIN: "pin", P24RequestTimeoutSeconds: 5}, nil)
	result, err := provider.Products("")
	if err != nil {
		t.Fatal(err)
	}
	items, ok := result.Raw["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("items=%T %#v", result.Raw["items"], result.Raw["items"])
	}
}

func TestLiveProductRequiresExactActiveSKU(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{"ok": true, "items": []any{
			map[string]any{"sku": "WDBTPN", "nama": "WITHDRAWAL BANK SMBC", "kategori_nama": "Transfer Bank", "harga": 1500},
		}})
	}))
	defer server.Close()
	provider := NewPulsa24Service(config.Config{P24BaseURL: server.URL, P24APIKey: "key", P24PIN: "pin", P24RequestTimeoutSeconds: 5}, nil)
	products := NewProductService(productReaderStub{})
	products.UseH2H(provider)
	if _, found, err := products.LiveProduct("SMB"); err != nil || found {
		t.Fatalf("substring SMB tidak boleh dianggap SKU aktif: found=%v err=%v", found, err)
	}
	if product, found, err := products.LiveProduct("wdbtpn"); err != nil || !found || product.SKU != "WDBTPN" {
		t.Fatalf("SKU aktif exact tidak ditemukan: product=%#v found=%v err=%v", product, found, err)
	}
}
