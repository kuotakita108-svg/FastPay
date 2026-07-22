package memory

import (
	"pulsaprime/backend/internal/domain"
	"fmt"
	"sync"
	"time"
)

type Store struct {
	mu           sync.RWMutex
	transactions []domain.Transaction
	customers    []domain.Customer
}

func New() *Store {
	now := time.Now()
	return &Store{transactions: []domain.Transaction{{ID: "FP-1048", Customer: "Nadia Putri", Email: "nadia@example.com", Method: "QRIS", Amount: 1250000, Status: "Berhasil", CreatedAt: now.Add(-18 * time.Minute)}, {ID: "FP-1047", Customer: "Rizky Pratama", Email: "rizky@example.com", Method: "Virtual Account", Amount: 875000, Status: "Berhasil", CreatedAt: now.Add(-43 * time.Minute)}, {ID: "FP-1046", Customer: "Dimas Saputra", Email: "dimas@example.com", Method: "E-Wallet", Amount: 420000, Status: "Diproses", CreatedAt: now.Add(-75 * time.Minute)}, {ID: "FP-1045", Customer: "Siti Rahma", Email: "siti@example.com", Method: "Kartu Kredit", Amount: 2100000, Status: "Berhasil", CreatedAt: now.Add(-2 * time.Hour)}, {ID: "FP-1044", Customer: "Budi Santoso", Email: "budi@example.com", Method: "QRIS", Amount: 350000, Status: "Gagal", CreatedAt: now.Add(-3 * time.Hour)}}, customers: []domain.Customer{{ID: "CUS-1001", Name: "Nadia Putri", Email: "nadia@example.com", Transactions: 18, TotalSpent: 12850000, JoinedAt: now.AddDate(0, -5, 0)}, {ID: "CUS-1002", Name: "Rizky Pratama", Email: "rizky@example.com", Transactions: 12, TotalSpent: 8300000, JoinedAt: now.AddDate(0, -4, 0)}, {ID: "CUS-1003", Name: "Dimas Saputra", Email: "dimas@example.com", Transactions: 9, TotalSpent: 4750000, JoinedAt: now.AddDate(0, -2, 0)}, {ID: "CUS-1004", Name: "Siti Rahma", Email: "siti@example.com", Transactions: 25, TotalSpent: 19300000, JoinedAt: now.AddDate(0, -8, 0)}}}
}
func (s *Store) FindAll() []domain.Transaction {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]domain.Transaction(nil), s.transactions...)
}
func (s *Store) Create(in domain.CreateTransactionInput) domain.Transaction {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := domain.Transaction{ID: fmt.Sprintf("FP-%04d", 1049+len(s.transactions)), Customer: in.Customer, Email: in.Email, Method: in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	s.transactions = append([]domain.Transaction{t}, s.transactions...)
	return t
}
func (s *Store) FindCustomers() []domain.Customer {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]domain.Customer(nil), s.customers...)
}
