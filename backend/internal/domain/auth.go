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
type User struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Role     string `json:"role"`
	Balance  int64  `json:"balance"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
}
type AuthResult struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
