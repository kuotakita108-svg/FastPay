package domain

type Product struct {
	ID       string `json:"id"`
	SKU      string `json:"sku,omitempty"`
	Service  string `json:"service,omitempty"`
	Operator string `json:"operator"`
	Name     string `json:"name"`
	Group    string `json:"group,omitempty"`
	Category string `json:"category"`
	Nominal  int64  `json:"nominal"`
	Price    int64  `json:"price"`
	Stock    int    `json:"stock"`
	Status   string `json:"status,omitempty"`
}
