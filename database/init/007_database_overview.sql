-- Tampilan ringkas yang aman untuk pgAdmin: tanpa password dan data rahasia.
CREATE OR REPLACE VIEW v_app_state_overview AS
SELECT
  namespace,
  CASE namespace
    WHEN 'accounts' THEN jsonb_array_length(COALESCE(payload->'users', '[]'::jsonb))
    WHEN 'credit-applications' THEN jsonb_array_length(COALESCE(payload->'applications', '[]'::jsonb))
    WHEN 'user-preferences' THEN (SELECT count(*) FROM jsonb_object_keys(COALESCE(payload->'users', '{}'::jsonb)))
    WHEN 'wallet-transactions' THEN (SELECT count(*) FROM jsonb_object_keys(COALESCE(payload->'items', '{}'::jsonb)))
    ELSE 0
  END AS total_data,
  updated_at
FROM app_state
ORDER BY namespace;
