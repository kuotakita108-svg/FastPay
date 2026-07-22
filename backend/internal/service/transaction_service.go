package service

import (
	"errors"
	"pulsaprime/backend/internal/domain"
	"pulsaprime/backend/internal/repository"
	"strings"
)

type TransactionService struct {
	repo repository.TransactionRepository
}

func NewTransactionService(r repository.TransactionRepository) *TransactionService {
	return &TransactionService{repo: r}
}
func (s *TransactionService) List() []domain.Transaction { return s.repo.FindAll() }
func (s *TransactionService) Create(in domain.CreateTransactionInput) (domain.Transaction, error) {
	in.Customer = strings.TrimSpace(in.Customer)
	in.Email = strings.TrimSpace(in.Email)
	in.Method = strings.TrimSpace(in.Method)
	if in.Customer == "" || in.Email == "" || in.Method == "" || in.Amount < 1000 {
		return domain.Transaction{}, errors.New("nama, email, metode, dan nominal minimal Rp1.000 wajib diisi")
	}
	return s.repo.Create(in), nil
}
