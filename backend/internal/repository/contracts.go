package repository

import "kuotakita/backend/internal/domain"

type TransactionRepository interface {
	FindAll() []domain.Transaction
	Create(domain.CreateTransactionInput) domain.Transaction
}
type CustomerRepository interface{ FindAll() []domain.Customer }
