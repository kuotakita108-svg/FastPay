package service

import "pulsaprime/backend/internal/domain"

type productReader interface{ FindProducts() []domain.Product }
type ProductService struct{ repo productReader }

func NewProductService(r productReader) *ProductService { return &ProductService{repo: r} }
func (s *ProductService) List() []domain.Product {
	return append(s.repo.FindProducts(), extendedProducts()...)
}
