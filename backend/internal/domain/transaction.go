package domain

import "time"

type Transaction struct {
	ID        string    `json:"id"`
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	Method    string    `json:"method"`
	Amount    int64     `json:"amount"`
	Status    string    `json:"status"`
	Target    string    `json:"target,omitempty"`
	Provider  string    `json:"provider,omitempty"`
	Title     string    `json:"title,omitempty"`
	Product   string    `json:"product,omitempty"`
	OrderNumber string  `json:"order_number,omitempty"`
	SN        string    `json:"sn,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
type CreateTransactionInput struct {
	Customer string `json:"customer"`
	Email    string `json:"email"`
	Method   string `json:"method"`
	Amount   int64  `json:"amount"`
	Target string `json:"target"`
	Provider string `json:"provider"`
	Title string `json:"title"`
	Product string `json:"product"`
}
