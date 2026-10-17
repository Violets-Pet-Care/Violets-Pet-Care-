CREATE TABLE IF NOT EXISTS visit_requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending','approved_awaiting_payment','paid','declined','cancelled')),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_date TEXT NOT NULL,
  service_time TEXT NOT NULL,
  address TEXT,
  pet_details TEXT NOT NULL,
  notes TEXT,
  quote_json TEXT NOT NULL,
  quote_cents INTEGER NOT NULL,
  approved_cents INTEGER,
  payment_url TEXT,
  square_payment_link_id TEXT
);
CREATE INDEX IF NOT EXISTS idx_visit_requests_status_created ON visit_requests(status, created_at);
