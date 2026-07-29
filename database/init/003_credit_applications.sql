-- Pengajuan kredit saldo agent beserta dokumen, tanda tangan, dan cicilan.
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

CREATE INDEX IF NOT EXISTS credit_applications_agent_idx
  ON credit_applications(agent_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS credit_applications_status_idx
  ON credit_applications(status);
