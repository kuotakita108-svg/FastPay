package service

import (
	"sort"
	"strings"

	"kuotakita/backend/internal/domain"
)

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

	var revenue int64
	successCount := 0
	customers := map[string]struct{}{}
	methodCounts := map[string]int{}
	for _, item := range tx {
		if name := strings.TrimSpace(item.Customer); name != "" {
			customers[name] = struct{}{}
		}
		if method := strings.TrimSpace(item.Method); method != "" {
			methodCounts[method]++
		}
		if isSuccessful(item.Status) {
			successCount++
			revenue += item.Amount
		}
	}

	methods := make([]domain.MethodShare, 0, len(methodCounts))
	for name, count := range methodCounts {
		methods = append(methods, domain.MethodShare{Name: name, Share: float64(count) * 100 / float64(len(tx))})
	}
	sort.Slice(methods, func(i, j int) bool { return methods[i].Share > methods[j].Share })

	var successRate float64
	if len(tx) > 0 {
		successRate = float64(successCount) * 100 / float64(len(tx))
	}
	return domain.Dashboard{
		Revenue: revenue, Transactions: len(tx), Customers: len(customers), SuccessRate: successRate,
		Chart: []domain.ChartPoint{}, PaymentMethods: methods, Recent: recent,
	}
}

func isSuccessful(status string) bool {
	switch strings.ToLower(strings.TrimSpace(status)) {
	case "berhasil", "sukses", "success":
		return true
	default:
		return false
	}
}
