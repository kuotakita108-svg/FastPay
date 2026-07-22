package repository

import "pulsaprime/backend/internal/domain"

type TransactionRepository interface {
	FindAll() []domain.Transaction
	Create(domain.CreateTransactionInput) domain.Transaction
}
type CustomerRepository interface{ FindAll() []domain.Customer }
