package domain

type LookupInput struct {
	Service  string `json:"service"`
	Target   string `json:"target"`
	Provider string `json:"provider"`
}
type LookupResult struct {
	Valid        bool   `json:"valid"`
	Provider     string `json:"provider"`
	CustomerName string `json:"customer_name"`
	Target       string `json:"target"`
	Message      string `json:"message"`
}
