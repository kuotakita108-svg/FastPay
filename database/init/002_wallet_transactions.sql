-- Riwayat pembelian, isi saldo, dan pembayaran yang dilakukan pengguna.
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

CREATE INDEX IF NOT EXISTS wallet_transactions_user_created_idx
  ON wallet_transactions(user_id, created_at DESC);
