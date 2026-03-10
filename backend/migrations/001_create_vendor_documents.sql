CREATE TABLE IF NOT EXISTS vendor_documents (
  id BIGSERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(150),
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_documents_vendor_id
  ON vendor_documents (vendor_id);
