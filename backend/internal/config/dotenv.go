package config

import (
	"bufio"
	"os"
	"strings"
)

// loadDotEnv reads local development values without adding an external package.
// Existing operating-system environment variables always have priority.
func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		if !found || os.Getenv(strings.TrimSpace(key)) != "" {
			continue
		}
		_ = os.Setenv(strings.TrimSpace(key), strings.Trim(strings.TrimSpace(value), `"'`))
	}
}
