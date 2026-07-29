-- Database utama KuotaKita. Semua tabel memakai UUID/string ID dari aplikasi
-- agar proses migrasi dari data server lama tidak mengubah identitas pengguna.
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL DEFAULT '',
  google_id TEXT UNIQUE,
  balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
  initial_balance_granted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  amount BIGINT NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  provider TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  product TEXT NOT NULL DEFAULT '',
  order_number TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wallet_transactions_user_created_idx ON wallet_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS credit_applications (
  id TEXT PRIMARY KEY,
  agent_user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  form JSONB NOT NULL DEFAULT '{}'::jsonb,
  documents JSONB NOT NULL DEFAULT '{}'::jsonb,
  signatures JSONB NOT NULL DEFAULT '{}'::jsonb,
  installments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS credit_applications_agent_idx ON credit_applications(agent_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS credit_applications_status_idx ON credit_applications(status);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  favorites JSONB NOT NULL DEFAULT '[]'::jsonb,
  security JSONB NOT NULL DEFAULT '{}'::jsonb,
  notifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  theme TEXT NOT NULL DEFAULT 'light',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cadangan satu kali dari JSON server lama sebelum seluruh handler beralih ke PostgreSQL.
CREATE TABLE IF NOT EXISTS legacy_state_backups (
  id BIGSERIAL PRIMARY KEY,
  source_file TEXT NOT NULL,
  payload JSONB NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
