package domain

type Product struct {
	ID       string `json:"id"`
	Operator string `json:"operator"`
	Name     string `json:"name"`
	Category string `json:"category"`
	Nominal  int64  `json:"nominal"`
	Price    int64  `json:"price"`
	Stock    int    `json:"stock"`
}
