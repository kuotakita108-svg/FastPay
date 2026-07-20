package domain

import "time"

type Customer struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	Transactions int       `json:"transactions"`
	TotalSpent   int64     `json:"total_spent"`
	JoinedAt     time.Time `json:"joined_at"`
}
