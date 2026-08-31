package service

import "testing"

func TestNormalizePulsa24NumericStatus(t *testing.T) {
	tests := map[string]string{"1": "pending", "2": "success", "3": "failed"}
	for input, want := range tests {
		if got := normalizeP24Status(input); got != want {
			t.Fatalf("status %s dinormalisasi menjadi %s, ingin %s", input, got, want)
		}
	}
}

func TestPulsa24InquiryMessageParsing(t *testing.T) {
	message := "Cek tagihan berhasil. ID Pelanggan: 123, Nama: BUDI, Tagihan: 150.000, Admin: 2.500, Total: 152.500"
	if got := labeledAmountP24(message, "total", "tagihan"); got != 152500 {
		t.Fatalf("total inquiry=%d, ingin 152500", got)
	}
	if got := labeledTextP24(message, "nama"); got != "BUDI" {
		t.Fatalf("nama inquiry=%q, ingin BUDI", got)
	}
}

func TestPulsa24RefIDFitsH2HRLimits(t *testing.T) {
	service := &Pulsa24Service{}
	for index := 0; index < 20; index++ {
		refID := service.NewRefID()
		if len(refID) > 27 {
			t.Fatalf("refid %q panjangnya %d byte", refID, len(refID))
		}
	}
}

func TestRecordUniqueReturnsOriginalCheckoutOrder(t *testing.T) {
	service := &Pulsa24Service{orders: map[string]Pulsa24Order{}}
	first := Pulsa24Order{RefID: "REF-1", UserID: "USER-1", ClientRequestID: "CHECKOUT-1"}
	if _, created, err := service.RecordUnique(first); err != nil || !created {
		t.Fatalf("order pertama gagal disimpan: created=%v err=%v", created, err)
	}
	duplicate := Pulsa24Order{RefID: "REF-2", UserID: "USER-1", ClientRequestID: "CHECKOUT-1"}
	existing, created, err := service.RecordUnique(duplicate)
	if err != nil || created {
		t.Fatalf("order duplikat tidak ditahan: created=%v err=%v", created, err)
	}
	if existing.RefID != first.RefID || len(service.orders) != 1 {
		t.Fatalf("order asli tidak dipertahankan: existing=%s total=%d", existing.RefID, len(service.orders))
	}
}
