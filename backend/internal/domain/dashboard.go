package domain

type Dashboard struct {
	Revenue           int64         `json:"revenue"`
	RevenueGrowth     float64       `json:"revenue_growth"`
	Transactions      int           `json:"transactions"`
	TransactionGrowth float64       `json:"transaction_growth"`
	Customers         int           `json:"customers"`
	CustomerGrowth    float64       `json:"customer_growth"`
	SuccessRate       float64       `json:"success_rate"`
	Chart             []ChartPoint  `json:"chart"`
	PaymentMethods    []MethodShare `json:"payment_methods"`
	Recent            []Transaction `json:"recent"`
}
type ChartPoint struct {
	Label   string `json:"label"`
	Revenue int64  `json:"revenue"`
}
type MethodShare struct {
	Name  string  `json:"name"`
	Share float64 `json:"share"`
}
