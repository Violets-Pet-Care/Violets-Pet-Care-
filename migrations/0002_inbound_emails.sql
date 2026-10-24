-- Create storage for inbound messages received by Resend.
CREATE TABLE IF NOT EXISTS inbound_emails (
  id TEXT PRIMARY KEY,
  resend_email_id TEXT NOT NULL UNIQUE,
  received_at TEXT NOT NULL,
  sender TEXT NOT NULL DEFAULT '',
  recipients TEXT NOT NULL DEFAULT '[]',
  subject TEXT NOT NULL DEFAULT '(No subject)',
  text_body TEXT NOT NULL DEFAULT '',
  html_body TEXT NOT NULL DEFAULT '',
  is_read INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_inbound_emails_received_at ON inbound_emails(received_at DESC);
