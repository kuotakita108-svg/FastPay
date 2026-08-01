package service

import (
	_ "embed"
	"encoding/json"
	"kuotakita/backend/internal/domain"
	"sync"
)

//go:embed h2h_catalog.json
var h2hCatalogJSON []byte

var (
	h2hOnce     sync.Once
	h2hProducts []domain.Product
)

type productReader interface{ FindProducts() []domain.Product }
type ProductService struct{ repo productReader }

func NewProductService(r productReader) *ProductService { return &ProductService{repo: r} }
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
