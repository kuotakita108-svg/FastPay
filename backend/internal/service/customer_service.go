package service

import "pulsaprime/backend/internal/domain"

type customerReader interface{ FindCustomers() []domain.Customer }
type CustomerService struct{ repo customerReader }

func NewCustomerService(r customerReader) *CustomerService { return &CustomerService{repo: r} }
func (s *CustomerService) List() []domain.Customer         { return s.repo.FindCustomers() }
