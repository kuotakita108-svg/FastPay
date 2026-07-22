package service

import "pulsaprime/backend/internal/domain"

type DashboardService struct{ transactions *TransactionService }

func NewDashboardService(t *TransactionService) *DashboardService {
	return &DashboardService{transactions: t}
}
func (s *DashboardService) Get() domain.Dashboard {
	tx := s.transactions.List()
	recent := tx
	if len(recent) > 5 {
		recent = recent[:5]
	}
	return domain.Dashboard{Revenue: 128450000, RevenueGrowth: 12.5, Transactions: 1248, TransactionGrowth: 8.2, Customers: 836, CustomerGrowth: 5.7, SuccessRate: 98.4, Chart: []domain.ChartPoint{{Label: "Sen", Revenue: 12500000}, {Label: "Sel", Revenue: 18200000}, {Label: "Rab", Revenue: 15800000}, {Label: "Kam", Revenue: 24100000}, {Label: "Jum", Revenue: 21700000}, {Label: "Sab", Revenue: 28300000}, {Label: "Min", Revenue: 31900000}}, PaymentMethods: []domain.MethodShare{{Name: "QRIS", Share: 42}, {Name: "Virtual Account", Share: 28}, {Name: "E-Wallet", Share: 18}, {Name: "Kartu Kredit", Share: 12}}, Recent: recent}
}
