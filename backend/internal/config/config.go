package config

import (
	"os"
	"strconv"
)

type Config struct {
	AppName, Environment, Port, FrontendURL, DatabaseDriver, DatabaseURL, JWTSecret, LogLevel, StaticDir string
	GoogleClientID, GoogleClientSecret, GoogleRedirectURL                                                string
	DataDir                                                                                              string
	MasterUsername, MasterPassword                                                                       string
	AgentUsername, AgentPassword                                                                         string
	MarketingUsername, MarketingPassword                                                                 string
	AnalisUsername, AnalisPassword                                                                       string
	H2HTestUsername, H2HTestPassword                                                                     string
	AgentInitialBalance                                                                                  int64
	P24BaseURL, P24APIKey, P24PIN                                                                        string
	P24RequestTimeoutSeconds                                                                             int
}

func Load() Config {
	loadDotEnv(".env")
	return Config{
		AppName:            env("APP_NAME", "KuotaKita"),
		Environment:        env("APP_ENV", "development"),
		Port:               env("PORT", env("APP_PORT", "8080")),
		FrontendURL:        env("FRONTEND_URL", "http://localhost:5173"),
		DatabaseDriver:     env("DATABASE_DRIVER", "memory"),
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		JWTSecret:          env("JWT_SECRET", "development-secret"),
		LogLevel:           env("LOG_LEVEL", "debug"),
		StaticDir:          os.Getenv("STATIC_DIR"),
		GoogleClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"),
		DataDir:            env("DATA_DIR", "/app/data"),
		MasterUsername:     os.Getenv("MASTER_USERNAME"),
		MasterPassword:     os.Getenv("MASTER_PASSWORD"),
		AgentUsername:      os.Getenv("AGENT_USERNAME"),
		AgentPassword:      os.Getenv("AGENT_PASSWORD"),
		MarketingUsername:  os.Getenv("MARKETING_USERNAME"),
		MarketingPassword:  os.Getenv("MARKETING_PASSWORD"),
		AnalisUsername:     os.Getenv("ANALIS_USERNAME"),
		AnalisPassword:     os.Getenv("ANALIS_PASSWORD"),
		H2HTestUsername:    os.Getenv("P24_TEST_USERNAME"),
		H2HTestPassword:    os.Getenv("P24_TEST_PASSWORD"),
		// Akun agen baru tidak boleh menerima saldo contoh. Saldo hanya berubah
		// setelah top up atau kredit disetujui oleh Operator.
		AgentInitialBalance:      envInt64("AGENT_INITIAL_BALANCE", 0),
		P24BaseURL:               env("P24_BASE_URL", "https://api.pulsa24jam.net"),
		P24APIKey:                os.Getenv("P24_API_KEY"),
		P24PIN:                   os.Getenv("P24_PIN"),
		P24RequestTimeoutSeconds: int(envInt64("P24_REQUEST_TIMEOUT_SECONDS", 45)),
	}
}

func envInt64(k string, fallback int64) int64 {
	value, err := strconv.ParseInt(os.Getenv(k), 10, 64)
	if err != nil || value < 0 {
		return fallback
	}
	return value
}
func env(k, v string) string {
	if x := os.Getenv(k); x != "" {
		return x
	}
	return v
}
