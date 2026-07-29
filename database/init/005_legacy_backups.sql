-- Cadangan satu kali sebelum data lama server berpindah penuh ke PostgreSQL.
CREATE TABLE IF NOT EXISTS legacy_state_backups (
  id BIGSERIAL PRIMARY KEY,
  source_file TEXT NOT NULL,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
