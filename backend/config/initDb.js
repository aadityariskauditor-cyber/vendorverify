const pool = require('./db');

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(30) NOT NULL DEFAULT 'client',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audits (
      id BIGSERIAL PRIMARY KEY,
      case_id VARCHAR(32) UNIQUE NOT NULL,
      requested_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      vendor_name VARCHAR(255) NOT NULL,
      vendor_email VARCHAR(255),
      vendor_country VARCHAR(120),
      transaction_value NUMERIC(14,2) NOT NULL DEFAULT 0,
      request_data JSONB NOT NULL DEFAULT '{}'::JSONB,
      status VARCHAR(30) NOT NULL DEFAULT 'Submitted',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT audits_status_check CHECK (status IN ('Submitted', 'In Progress', 'Completed'))
    );
  `);

  await pool.query(`
    ALTER TABLE audits
    ADD COLUMN IF NOT EXISTS transaction_value NUMERIC(14,2) NOT NULL DEFAULT 0;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'audits_status_check'
      ) THEN
        ALTER TABLE audits
        ADD CONSTRAINT audits_status_check CHECK (status IN ('Submitted', 'In Progress', 'Completed'));
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGSERIAL PRIMARY KEY,
      audit_id BIGINT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('audit_created', 'audit_started', 'report_uploaded')),
      event_details JSONB NOT NULL DEFAULT '{}'::JSONB,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id BIGSERIAL PRIMARY KEY,
      audit_id BIGINT NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
      report_url TEXT,
      findings_summary TEXT,
      uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      uploaded_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id BIGSERIAL PRIMARY KEY,
      audit_id BIGINT REFERENCES audits(id) ON DELETE SET NULL,
      client_name VARCHAR(120) NOT NULL,
      company_name VARCHAR(255),
      testimonial TEXT NOT NULL,
      rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(255) NOT NULL,
      contact_person VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      country VARCHAR(100),
      service_category VARCHAR(120),
      risk_score INTEGER DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'Pending',
      notes TEXT[] DEFAULT ARRAY[]::TEXT[],
      documents TEXT[] DEFAULT ARRAY[]::TEXT[],
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = initializeDatabase;
