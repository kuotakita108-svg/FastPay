package config

import "os"

type Config struct{ AppName, Environment, Port, FrontendURL, DatabaseDriver, DatabaseURL, JWTSecret, LogLevel, StaticDir string }

func Load() Config {
	loadDotEnv(".env")
	return Config{AppName: env("APP_NAME", "FastPay"), Environment: env("APP_ENV", "development"), Port: env("PORT", env("APP_PORT", "8080")), FrontendURL: env("FRONTEND_URL", "http://localhost:5173"), DatabaseDriver: env("DATABASE_DRIVER", "memory"), DatabaseURL: os.Getenv("DATABASE_URL"), JWTSecret: env("JWT_SECRET", "development-secret"), LogLevel: env("LOG_LEVEL", "debug"), StaticDir: os.Getenv("STATIC_DIR")}
}
func env(k, v string) string {
	if x := os.Getenv(k); x != "" {
		return x
	}
	return v
}
