package domain

import "time"

type Transaction struct {
	ID        string    `json:"id"`
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	Method    string    `json:"method"`
	Amount    int64     `json:"amount"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
type CreateTransactionInput struct {
	Customer string `json:"customer"`
	Email    string `json:"email"`
	Method   string `json:"method"`
	Amount   int64  `json:"amount"`
}
