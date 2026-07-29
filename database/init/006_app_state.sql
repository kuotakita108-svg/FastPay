-- Penyimpanan operasional atomik. Menjaga seluruh field aplikasi tetap utuh
-- ketika fitur berkembang, tanpa mengandalkan browser pengguna.
CREATE TABLE IF NOT EXISTS app_state (
  namespace TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
