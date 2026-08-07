package memory

import (
	"fmt"
	"kuotakita/backend/internal/domain"
	"sync"
	"time"
)

type Store struct {
	mu           sync.RWMutex
	transactions []domain.Transaction
	customers    []domain.Customer
}

func New() *Store {
	// Penyimpanan memory hanya dipakai saat pengembangan. Jangan isi data
	// transaksi atau pelanggan contoh agar perilakunya sama dengan produksi.
	return &Store{transactions: make([]domain.Transaction, 0), customers: make([]domain.Customer, 0)}
}
func (s *Store) FindAll() []domain.Transaction {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]domain.Transaction(nil), s.transactions...)
}
func (s *Store) Create(in domain.CreateTransactionInput) domain.Transaction {
	s.mu.Lock()
	defer s.mu.Unlock()
	t := domain.Transaction{ID: fmt.Sprintf("PP-%04d", 1049+len(s.transactions)), Customer: in.Customer, Email: in.Email, Method: in.Method, Amount: in.Amount, Status: "Berhasil", CreatedAt: time.Now()}
	s.transactions = append([]domain.Transaction{t}, s.transactions...)
	return t
}
func (s *Store) FindCustomers() []domain.Customer {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return append([]domain.Customer(nil), s.customers...)
}
