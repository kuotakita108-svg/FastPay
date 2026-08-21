package domain

type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type RegisterInput struct {
	Name        string `json:"name"`
	Username    string `json:"username"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	AccountType string `json:"account_type,omitempty"`
	StoreName   string `json:"store_name,omitempty"`
	Province    string `json:"province,omitempty"`
	City        string `json:"city,omitempty"`
	District    string `json:"district,omitempty"`
}
type ProfileInput struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}
type AgentFollowUpInput struct {
	Status string `json:"status"`
	Note   string `json:"note"`
}
type User struct {
	ID              string `json:"id"`
	Username        string `json:"username"`
	H2HDirect       bool   `json:"h2h_direct,omitempty"`
	Name            string `json:"name"`
	Role            string `json:"role"`
	Balance         int64  `json:"balance"`
	Phone           string `json:"phone"`
	Email           string `json:"email"`
	StoreName       string `json:"store_name,omitempty"`
	Province        string `json:"province,omitempty"`
	City            string `json:"city,omitempty"`
	District        string `json:"district,omitempty"`
	AccessStatus    string `json:"access_status,omitempty"`
	AccessReason    string `json:"access_reason,omitempty"`
	AccessUpdatedAt string `json:"access_updated_at,omitempty"`
}
type AuthResult struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type AccountSummary struct {
	User
	LoginProvider string `json:"login_provider"`
	CreatedAt     string `json:"created_at,omitempty"`
}

// AgentSummary is role-aware: Marketing receives only operational identity and
// activity fields, while Operator may additionally receive Balance.
type AgentSummary struct {
	ID                string `json:"id"`
	Username          string `json:"username"`
	Name              string `json:"name"`
	Role              string `json:"role"`
	Phone             string `json:"phone"`
	Email             string `json:"email"`
	StoreName         string `json:"store_name,omitempty"`
	Province          string `json:"province,omitempty"`
	City              string `json:"city,omitempty"`
	District          string `json:"district,omitempty"`
	MarketingID       string `json:"marketing_id,omitempty"`
	MarketingName     string `json:"marketing_name,omitempty"`
	CreatedAt         string `json:"created_at,omitempty"`
	LastTransactionAt string `json:"last_transaction_at,omitempty"`
	InactiveDays      int    `json:"inactive_days"`
	ActivityStatus    string `json:"activity_status"`
	PartnershipStatus string `json:"partnership_status,omitempty"`
	FollowUpStatus    string `json:"follow_up_status,omitempty"`
	FollowUpNote      string `json:"follow_up_note,omitempty"`
	FollowUpUpdatedAt string `json:"follow_up_updated_at,omitempty"`
	Balance           *int64 `json:"balance,omitempty"`
}
