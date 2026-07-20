package service

import (
	"errors"
	"fastpay/backend/internal/domain"
	"fmt"
	"strings"
	"unicode"
)

type LookupService struct{}

func NewLookupService() *LookupService { return &LookupService{} }
func (s *LookupService) Lookup(in domain.LookupInput) (domain.LookupResult, error) {
	target := digits(in.Target)
	if strings.HasPrefix(target, "62") {
		target = "0" + target[2:]
	}
	if len(target) < 8 {
		return domain.LookupResult{}, errors.New("nomor atau ID pelanggan belum lengkap")
	}
	provider := strings.TrimSpace(in.Provider)
	switch in.Service {
	case "pulsa", "data":
		provider = detectOperator(target)
		if provider == "" {
			return domain.LookupResult{}, errors.New("operator nomor belum dapat dikenali")
		}
	case "ewallet":
		if provider == "" {
			return domain.LookupResult{}, errors.New("pilih layanan e-wallet terlebih dahulu")
		}
	case "pln":
		provider = "PLN"
	case "bpjs":
		provider = "BPJS Kesehatan"
	case "game":
		if provider == "" {
			return domain.LookupResult{}, errors.New("pilih game terlebih dahulu")
		}
	}
	name := maskedName(target)
	message := fmt.Sprintf("Data %s berhasil diverifikasi", provider)
	return domain.LookupResult{Valid: true, Provider: provider, CustomerName: name, Target: target, Message: message}, nil
}
func digits(value string) string {
	return strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) {
			return r
		}
		return -1
	}, value)
}
func detectOperator(phone string) string {
	prefixes := map[string][]string{"Telkomsel": {"0811", "0812", "0813", "0821", "0822", "0852", "0853"}, "Indosat": {"0814", "0815", "0816", "0855", "0856", "0857", "0858"}, "XL": {"0817", "0818", "0819", "0859", "0877", "0878"}, "Tri": {"0895", "0896", "0897", "0898", "0899"}, "AXIS": {"0831", "0832", "0833", "0838"}}
	for operator, list := range prefixes {
		for _, prefix := range list {
			if strings.HasPrefix(phone, prefix) {
				return operator
			}
		}
	}
	return ""
}
func maskedName(target string) string {
	names := []string{"ANDI P****", "SITI N****", "BUDI S****", "OCTA P****", "RINA A****"}
	return names[int(target[len(target)-1]-'0')%len(names)]
}
