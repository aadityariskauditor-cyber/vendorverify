const pool = require('../config/db');

async function getAuditsForClient(clientId) {
  const { rows } = await pool.query(
    `
      SELECT
        a.case_id,
        a.vendor_name,
        a.transaction_value,
        a.status,
        COALESCE(r.report_url, '') AS report_url
      FROM audits a
      LEFT JOIN LATERAL (
        SELECT report_url
        FROM reports
        WHERE audit_id = a.id
        ORDER BY uploaded_at DESC
        LIMIT 1
      ) r ON TRUE
      WHERE a.requested_by = $1
        AND a.status IN ('Submitted', 'In Progress')
      ORDER BY a.created_at DESC;
    `,
    [clientId]
  );

  return rows;
}

async function getReportsForClient(clientId) {
  const { rows } = await pool.query(
    `
      SELECT
        a.case_id,
        a.vendor_name,
        a.transaction_value,
        a.status,
        COALESCE(r.report_url, '') AS report_url
      FROM audits a
      LEFT JOIN LATERAL (
        SELECT report_url
        FROM reports
        WHERE audit_id = a.id
        ORDER BY uploaded_at DESC
        LIMIT 1
      ) r ON TRUE
      WHERE a.requested_by = $1
        AND a.status = 'Completed'
      ORDER BY a.updated_at DESC;
    `,
    [clientId]
  );

  return rows;
}

module.exports = {
  getAuditsForClient,
  getReportsForClient,
};
