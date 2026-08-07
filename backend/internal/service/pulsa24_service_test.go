package service

import "testing"

func TestNormalizePulsa24NumericStatus(t *testing.T) {
	tests := map[string]string{"1": "success", "2": "pending", "3": "failed"}
	for input, want := range tests {
		if got := normalizeP24Status(input); got != want {
			t.Fatalf("status %s dinormalisasi menjadi %s, ingin %s", input, got, want)
		}
	}
}
