package service

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"kuotakita/backend/internal/domain"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed h2h_catalog.json
var h2hCatalogJSON []byte

var (
	h2hOnce     sync.Once
	h2hProducts []domain.Product
)

type productReader interface{ FindProducts() []domain.Product }
type ProductService struct {
	repo       productReader
	h2h        *Pulsa24Service
	mu         sync.RWMutex
	live       []domain.Product
	liveLoaded time.Time
}

func NewProductService(r productReader) *ProductService   { return &ProductService{repo: r} }
func (s *ProductService) UseH2H(provider *Pulsa24Service) { s.h2h = provider }
func (s *ProductService) List() []domain.Product {
	h2hOnce.Do(func() {
		if err := json.Unmarshal(h2hCatalogJSON, &h2hProducts); err != nil {
			panic("katalog H2H KuotaKita tidak valid: " + err.Error())
		}
	})
	result := make([]domain.Product, 0, len(h2hProducts)+64)
	result = append(result, h2hProducts...)
	seen := make(map[string]struct{}, len(result))
	for _, product := range result {
		seen[product.ID] = struct{}{}
	}
	for _, product := range append(s.repo.FindProducts(), extendedProducts()...) {
		if _, exists := seen[product.ID]; exists {
			continue
		}
		seen[product.ID] = struct{}{}
		result = append(result, product)
	}
	return result
}

func (s *ProductService) ListByService(serviceName string) []domain.Product {
	if live, err := s.liveProducts(); err == nil && len(live) > 0 {
		return filterProductsByService(live, serviceName)
	}
	// The customer-facing catalogue is H2HR only, even if provider credentials
	// are missing or the live request fails. Never expose the embedded H2H list.
	return []domain.Product{}
}

// LiveProduct returns an exact, currently advertised H2HR SKU. It is used by
// checkout as a final server-side guard against stale browser/catalog data.
func (s *ProductService) LiveProduct(sku string) (domain.Product, bool, error) {
	products, err := s.liveProducts()
	if err != nil {
		return domain.Product{}, false, err
	}
	sku = strings.TrimSpace(sku)
	for _, product := range products {
		if strings.EqualFold(product.SKU, sku) {
			return product, true, nil
		}
	}
	return domain.Product{}, false, nil
}

func filterProductsByService(all []domain.Product, serviceName string) []domain.Product {
	serviceName = strings.TrimSpace(strings.ToLower(serviceName))
	if serviceName == "" {
		return all
	}
	result := make([]domain.Product, 0, len(all)/8)
	for _, product := range all {
		if strings.EqualFold(product.Service, serviceName) {
			result = append(result, product)
		}
	}
	if serviceName == "ewallet" {
		return preferH2HWalletRoutes(result)
	}
	return result
}

// H2HR may advertise several routes for the same wallet and denomination
// (regular, H2H, promo, and PRO). For this member integration the explicit
// H2H route is authoritative. Offering every duplicate lets a customer pick a
// regular SKU such as DANA100 even though DANA100H is the routed member SKU.
func preferH2HWalletRoutes(products []domain.Product) []domain.Product {
	canonicalOperators := make(map[string]bool)
	for _, product := range products {
		if isCanonicalOpenWalletRoute(product) {
			canonicalOperators[strings.ToLower(strings.TrimSpace(product.Operator))] = true
		}
	}
	// The provider documentation uses the base wallet SKU (for example DANA)
	// with qty carrying the requested amount. When it exists, thousands of
	// denomination/promo/H2H variants for that provider are routing noise and
	// must not be offered to customers.
	canonical := make([]domain.Product, 0, len(canonicalOperators))
	for _, product := range products {
		operator := strings.ToLower(strings.TrimSpace(product.Operator))
		if canonicalOperators[operator] {
			if isCanonicalOpenWalletRoute(product) {
				canonical = append(canonical, product)
			}
			continue
		}
		canonical = append(canonical, product)
	}
	products = canonical

	h2hKeys := make(map[string]bool)
	for _, product := range products {
		if isExplicitH2HRoute(product) {
			h2hKeys[walletRouteKey(product)] = true
		}
	}
	result := make([]domain.Product, 0, len(products))
	for _, product := range products {
		if h2hKeys[walletRouteKey(product)] && !isExplicitH2HRoute(product) {
			continue
		}
		result = append(result, product)
	}
	return result
}

func isCanonicalOpenWalletRoute(product domain.Product) bool {
	if !strings.Contains(strings.ToUpper(product.Status), "OPEN") {
		return false
	}
	operator := strings.Map(func(r rune) rune {
		if (r >= 'A' && r <= 'Z') || (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') {
			return r
		}
		return -1
	}, product.Operator)
	return strings.EqualFold(strings.TrimSpace(product.SKU), operator)
}

func walletRouteKey(product domain.Product) string {
	return strings.ToLower(strings.TrimSpace(product.Operator)) + ":" + strconv.FormatInt(product.Nominal, 10)
}

func isExplicitH2HRoute(product domain.Product) bool {
	return strings.Contains(strings.ToUpper(product.Name), " H2H")
}

func (s *ProductService) liveProducts() ([]domain.Product, error) {
	if s.h2h == nil || !s.h2h.Enabled() {
		return nil, fmt.Errorf("H2HR tidak aktif")
	}
	s.mu.RLock()
	if len(s.live) > 0 && time.Since(s.liveLoaded) < 5*time.Minute {
		result := append([]domain.Product(nil), s.live...)
		s.mu.RUnlock()
		return result, nil
	}
	s.mu.RUnlock()
	response, err := s.h2h.Products("")
	if err != nil {
		return nil, err
	}
	items, ok := response.Raw["items"].([]any)
	if !ok {
		return nil, fmt.Errorf("daftar PRODUK H2HR tidak ditemukan")
	}
	products := make([]domain.Product, 0, len(items))
	seen := make(map[string]struct{}, len(items))
	for _, value := range items {
		row, ok := value.(map[string]any)
		if !ok {
			continue
		}
		sku := strings.TrimSpace(stringVal(row, "sku"))
		if sku == "" {
			continue
		}
		key := strings.ToUpper(sku)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		name := firstText(stringVal(row, "nama"), stringVal(row, "name"), sku)
		group := firstText(stringVal(row, "group_name"), stringVal(row, "group"))
		category := firstText(stringVal(row, "kategori_nama"), stringVal(row, "category"), group)
		brand := firstText(stringVal(row, "brand_nama"), stringVal(row, "brand"), category)
		priceType := strings.ToUpper(firstText(stringVal(row, "tipe_harga"), "FIXED"))
		price := firstIntValP24(row, "harga", "price", "fee_tambahan")
		nominal := price
		if strings.Contains(priceType, "OPEN") {
			// A number of wallet routes are marked OPEN_AMOUNT even though the
			// product name fixes the denomination (for example DANA 10.000).
			// Preserve that denomination so the UI cannot send DANA10 with qty
			// 100000. Truly free-amount products keep nominal zero.
			nominal = namedNominalP24(name)
			if fee := firstIntValP24(row, "fee_tambahan", "fee"); fee > 0 {
				price = fee
			}
		}
		service := classifyH2HRService(category, group, brand, name)
		operator := canonicalH2HROperator(service, brand, name)
		products = append(products, domain.Product{ID: "h2hr-" + strings.ToLower(sku), SKU: sku, Service: service, Operator: operator, Name: name, Group: group, Category: category, Nominal: nominal, Price: price, Stock: 999, Status: priceType})
	}
	if len(products) == 0 {
		return nil, fmt.Errorf("katalog H2HR kosong")
	}
	s.mu.Lock()
	s.live, s.liveLoaded = append([]domain.Product(nil), products...), time.Now()
	s.mu.Unlock()
	return products, nil
}

var leadingProviderCodeH2HR = regexp.MustCompile(`^\s*\d+\s+`)

func canonicalH2HROperator(service, brand, name string) string {
	value := strings.ToUpper(strings.TrimSpace(name))
	if service == "insurance" {
		for _, candidate := range []struct{ match, label string }{
			{"PRUDENTIAL", "Prudential"}, {"TOKIO MARINE", "Tokio Marine"},
			{"JIWASRAYA", "Jiwasraya"}, {"IFG LIFE", "IFG Life"}, {"ASURANSI CAR", "CAR"},
		} {
			if strings.Contains(value, candidate.match) {
				return candidate.label
			}
		}
	}
	if (service == "emoney" || service == "ewallet") && strings.Contains(value, "SHOPEE") {
		return "ShopeePay"
	}
	brand = strings.TrimSpace(brand)
	// Several Pulsa24Jam H2HR categories intentionally return a generic brand.
	// The actual provider is carried by nama (for example "014 BCA" or
	// "001 PDAM ACEH BARAT"). Exposing the generic brand collapses hundreds of
	// real providers into one card and prevents the correct logo from matching.
	generic := map[string]bool{
		"bank": true, "pdam": true, "multifinance": true, "gas": true,
	}
	if generic[strings.ToLower(brand)] {
		provider := strings.TrimSpace(leadingProviderCodeH2HR.ReplaceAllString(name, ""))
		provider = strings.TrimSpace(strings.TrimSuffix(provider, " CEK TAGIHAN"))
		if service == "bank" {
			provider = strings.TrimSpace(strings.TrimPrefix(provider, "BANK "))
		}
		if provider != "" {
			return provider
		}
	}
	if strings.EqualFold(brand, "XL/Axis") {
		if strings.Contains(value, "AXIS") && !strings.Contains(value, "XL/") {
			return "Axis"
		}
		if strings.Contains(value, "XL") {
			return "XL"
		}
	}
	return brand
}

var dottedNominalP24 = regexp.MustCompile(`(?:^|\D)(\d{1,3}(?:[.,]\d{3})+)(?:\D|$)`)

func namedNominalP24(name string) int64 {
	upperName := strings.ToUpper(name)
	if strings.Contains(upperName, "OPEN AMOUNT") || strings.Contains(upperName, "BEBAS NOMINAL") {
		return 0
	}
	match := dottedNominalP24.FindStringSubmatch(name)
	if len(match) != 2 {
		return 0
	}
	value := strings.NewReplacer(".", "", ",", "").Replace(match[1])
	nominal, _ := strconv.ParseInt(value, 10, 64)
	return nominal
}

func classifyH2HRService(category, group, brand, name string) string {
	categoryValue := strings.ToLower(strings.TrimSpace(category))
	brandValue := strings.ToLower(strings.TrimSpace(brand))
	// Trust Pulsa24Jam's explicit category before keywords in a product name.
	// Otherwise GAMESMAX data packages and TV packages named "DIAMOND" are
	// incorrectly exposed as game vouchers.
	if strings.Contains(categoryValue, "paket data") {
		return "data"
	}
	if strings.Contains(categoryValue, "tv") && strings.Contains(categoryValue, "streaming") {
		for _, tvBrand := range []string{"k-vision", "kvision", "nex parabola", "transvision", "mnc vision"} {
			if strings.Contains(brandValue, tvBrand) {
				return "tv"
			}
		}
	}
	value := strings.ToLower(strings.Join([]string{category, group, brand, name}, " "))
	rules := []struct {
		service string
		words   []string
	}{
		{"bpjs", []string{"bpjs"}}, {"pdam", []string{"pdam", "air minum"}}, {"pln", []string{"pln", "listrik"}},
		{"gas", []string{"pgn", "tagihan gas"}}, {"multifinance", []string{"multifinance", "leasing", "cicilan"}},
		{"creditcard", []string{"kartu kredit"}}, {"insurance", []string{"asuransi", "insurance"}}, {"school", []string{"pendidikan", "sekolah", "universitas"}},
		{"tax", []string{"pajak", "pbb", "penerimaan negara"}}, {"zakat", []string{"zakat", "donasi"}}, {"parking", []string{"parking", "parkir"}},
		{"toll", []string{"e-toll", "tol"}}, {"emoney", []string{"e-money", "emoney", "uang elektronik"}}, {"bank", []string{"bank transfer", "transfer bank", "rtol"}},
		{"ewallet", []string{"e-wallet", "ewallet", "dompet digital"}}, {"game", []string{"game", "diamond"}}, {"streaming", []string{"streaming"}},
		{"voucher", []string{"voucher"}}, {"esim", []string{"esim"}}, {"data", []string{"paket data", "internet data", "kuota"}},
		{"pulsa", []string{"pulsa", "masa aktif"}}, {"telkom", []string{"telkom", "indihome"}}, {"tv", []string{"televisi", "tv berlangganan"}},
		{"internet", []string{"internet"}}, {"pascabayar", []string{"pascabayar", "postpaid"}},
	}
	for _, rule := range rules {
		for _, word := range rule.words {
			if strings.Contains(value, word) {
				return rule.service
			}
		}
	}
	return "voucher"
}
