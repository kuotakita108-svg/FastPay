package handler

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"io"
	"kuotakita/backend/internal/config"
	"kuotakita/backend/internal/domain"
	"kuotakita/backend/internal/http/response"
	"kuotakita/backend/internal/service"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const googleStateCookie = "kuotakita_google_state"

type AuthHandler struct {
	service *service.AuthService
	cfg     config.Config
	client  *http.Client
}

func NewAuthHandler(s *service.AuthService, cfg config.Config) *AuthHandler {
	return &AuthHandler{service: s, cfg: cfg, client: &http.Client{Timeout: 10 * time.Second}}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var in domain.LoginInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data login tidak valid")
		return
	}
	result, err := h.service.Login(in.Username, in.Password)
	if err != nil {
		response.Error(w, 401, err.Error())
		return
	}
	response.JSON(w, 200, result)
}

// Me returns the current account directly from the server.  The browser must
// never treat a previously cached balance as authoritative.
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	user, err := h.service.CurrentUser(r.Header.Get("Authorization"))
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, user)
}

func (h *AuthHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	var in domain.ProfileInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, http.StatusBadRequest, "data profil tidak valid")
		return
	}
	user, err := h.service.UpdateProfile(r.Header.Get("Authorization"), in)
	if err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, user)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var in domain.RegisterInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, 400, "data pendaftaran tidak valid")
		return
	}
	result, err := h.service.Register(in)
	if err != nil {
		response.Error(w, 422, err.Error())
		return
	}
	response.JSON(w, 201, result)
}

func (h *AuthHandler) CreateAgent(w http.ResponseWriter, r *http.Request) {
	var in domain.RegisterInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, http.StatusBadRequest, "data agent tidak valid")
		return
	}
	user, err := h.service.CreateAgent(r.Header.Get("Authorization"), in)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) ManagedAgents(w http.ResponseWriter, r *http.Request) {
	users, err := h.service.ManagedAgents(r.Header.Get("Authorization"))
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, users)
}

func (h *AuthHandler) CreateMarketing(w http.ResponseWriter, r *http.Request) {
	var in domain.RegisterInput
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, http.StatusBadRequest, "data marketing tidak valid")
		return
	}
	user, err := h.service.CreateMarketing(r.Header.Get("Authorization"), in)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) SetAgentAccess(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Suspended bool   `json:"suspended"`
		Reason    string `json:"reason"`
	}
	if json.NewDecoder(r.Body).Decode(&in) != nil {
		response.Error(w, http.StatusBadRequest, "data akses agent tidak valid")
		return
	}
	user, err := h.service.SetAgentAccess(r.Header.Get("Authorization"), r.PathValue("id"), in.Suspended, in.Reason)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, user)
}

func (h *AuthHandler) Google(w http.ResponseWriter, r *http.Request) {
	if !h.googleReady() {
		response.Error(w, http.StatusServiceUnavailable, "Login Google belum diaktifkan pengelola. Lengkapi GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, dan GOOGLE_REDIRECT_URL di server.")
		return
	}
	state, err := randomState()
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "gagal menyiapkan login Google")
		return
	}
	h.setStateCookie(w, r, state)
	authorize := &url.URL{Scheme: "https", Host: "accounts.google.com", Path: "/o/oauth2/v2/auth"}
	query := authorize.Query()
	query.Set("client_id", h.cfg.GoogleClientID)
	query.Set("redirect_uri", h.cfg.GoogleRedirectURL)
	query.Set("response_type", "code")
	query.Set("scope", "openid email profile")
	query.Set("state", state)
	query.Set("prompt", "select_account")
	authorize.RawQuery = query.Encode()
	http.Redirect(w, r, authorize.String(), http.StatusFound)
}

func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	if !h.googleReady() {
		h.oauthError(w, "Login Google belum diaktifkan pada server.")
		return
	}
	if r.URL.Query().Get("error") != "" {
		h.oauthError(w, "Login Google dibatalkan.")
		return
	}
	stateCookie, err := r.Cookie(googleStateCookie)
	if err != nil || r.URL.Query().Get("state") == "" || stateCookie.Value != r.URL.Query().Get("state") {
		h.oauthError(w, "Sesi login Google tidak valid. Silakan coba lagi.")
		return
	}
	h.clearStateCookie(w, r)
	code := r.URL.Query().Get("code")
	if code == "" {
		h.oauthError(w, "Kode login Google tidak ditemukan.")
		return
	}
	profile, err := h.googleProfile(code)
	if err != nil {
		h.oauthError(w, "Login Google gagal diverifikasi. Silakan coba lagi.")
		return
	}
	result, err := h.service.GoogleLogin(profile.Sub, profile.Name, profile.Email)
	if err != nil {
		h.oauthError(w, err.Error())
		return
	}
	h.oauthSuccess(w, result)
}

func (h *AuthHandler) googleReady() bool {
	return h.cfg.GoogleClientID != "" && h.cfg.GoogleClientSecret != "" && h.cfg.GoogleRedirectURL != ""
}

type googleToken struct {
	AccessToken string `json:"access_token"`
}
type googleProfile struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
}

func (h *AuthHandler) googleProfile(code string) (googleProfile, error) {
	form := url.Values{
		"code":          {code},
		"client_id":     {h.cfg.GoogleClientID},
		"client_secret": {h.cfg.GoogleClientSecret},
		"redirect_uri":  {h.cfg.GoogleRedirectURL},
		"grant_type":    {"authorization_code"},
	}
	res, err := h.client.PostForm("https://oauth2.googleapis.com/token", form)
	if err != nil {
		return googleProfile{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return googleProfile{}, io.ErrUnexpectedEOF
	}
	var token googleToken
	if err := json.NewDecoder(res.Body).Decode(&token); err != nil || token.AccessToken == "" {
		return googleProfile{}, io.ErrUnexpectedEOF
	}
	request, err := http.NewRequest(http.MethodGet, "https://openidconnect.googleapis.com/v1/userinfo", nil)
	if err != nil {
		return googleProfile{}, err
	}
	request.Header.Set("Authorization", "Bearer "+token.AccessToken)
	profileResponse, err := h.client.Do(request)
	if err != nil {
		return googleProfile{}, err
	}
	defer profileResponse.Body.Close()
	if profileResponse.StatusCode != http.StatusOK {
		return googleProfile{}, io.ErrUnexpectedEOF
	}
	var profile googleProfile
	if err := json.NewDecoder(profileResponse.Body).Decode(&profile); err != nil || !profile.EmailVerified {
		return googleProfile{}, io.ErrUnexpectedEOF
	}
	return profile, nil
}

func (h *AuthHandler) setStateCookie(w http.ResponseWriter, r *http.Request, state string) {
	http.SetCookie(w, &http.Cookie{Name: googleStateCookie, Value: state, Path: "/api/v1/auth/google", MaxAge: 600, HttpOnly: true, Secure: requestIsHTTPS(r), SameSite: http.SameSiteLaxMode})
}
func (h *AuthHandler) clearStateCookie(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{Name: googleStateCookie, Value: "", Path: "/api/v1/auth/google", MaxAge: -1, HttpOnly: true, Secure: requestIsHTTPS(r), SameSite: http.SameSiteLaxMode})
}
func requestIsHTTPS(r *http.Request) bool {
	return r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
}
func randomState() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func (h *AuthHandler) oauthSuccess(w http.ResponseWriter, result domain.AuthResult) {
	payload, _ := json.Marshal(result)
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	// encoding/json escapes HTML-significant characters, so the JSON can be safely
	// embedded as a JavaScript object while retaining Unicode names correctly.
	_, _ = w.Write([]byte("<!doctype html><title>Masuk ke KuotaKita</title><script>sessionStorage.setItem('kuotakita_session',JSON.stringify(" + string(payload) + "));location.replace('/app');</script>"))
}
func (h *AuthHandler) oauthError(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write([]byte("<!doctype html><title>Login Google</title><script>alert(" + string(mustJSON(message)) + ");location.replace('/login');</script>"))
}
func mustJSON(value string) []byte {
	encoded, _ := json.Marshal(value)
	return encoded
}
