package service

import "testing"

func TestBlocksNewCredit(t *testing.T) {
	tests := []struct {
		name string
		row map[string]any
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
