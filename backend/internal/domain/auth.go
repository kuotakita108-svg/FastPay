package domain

type LoginInput struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type RegisterInput struct {
	Name     string `json:"name"`
	Username string `json:"username"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type ProfileInput struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
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
	AccessStatus    string `json:"access_status,omitempty"`
	AccessReason    string `json:"access_reason,omitempty"`
	AccessUpdatedAt string `json:"access_updated_at,omitempty"`
}
type AuthResult struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
