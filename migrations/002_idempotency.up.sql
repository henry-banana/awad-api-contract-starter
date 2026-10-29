-- TDTH-FLAG
CREATE TABLE idempotency_keys (
  key TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  response_status INTEGER NOT NULL CHECK (response_status = 201),
  location TEXT NOT NULL,
  response_body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Temporary coordination leases are separate from stored successful responses.
CREATE TABLE idempotency_in_flight (
  key TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX orders_table_id_id ON orders (table_id, id DESC);
