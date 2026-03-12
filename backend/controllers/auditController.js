const pool = require('../config/db');

function generateCaseId() {
  const now = new Date();
  const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(
    now.getUTCDate()
  ).padStart(2, '0')}`;
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `VV-${datePart}-${randomPart}`;
}

async function submitAudit(req, res) {
  const { vendor_name: vendorName, vendor_email: vendorEmail, vendor_country: vendorCountry } = req.body;

  if (!vendorName) {
    return res.status(400).json({ message: 'vendor_name is required.' });
  }

  const caseId = generateCaseId();
  const requestedBy = req.user?.id || null;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const insertAuditQuery = `
      INSERT INTO audits (case_id, requested_by, vendor_name, vendor_email, vendor_country, request_data, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, case_id, vendor_name, vendor_email, vendor_country, status, created_at;
    `;

    const { rows } = await client.query(insertAuditQuery, [
      caseId,
      requestedBy,
      vendorName,
      vendorEmail || null,
      vendorCountry || null,
      req.body,
      'Submitted',
    ]);

    const audit = rows[0];

    await client.query(
      `
        INSERT INTO audit_logs (audit_id, event_type, event_details, created_by)
        VALUES ($1, $2, $3, $4);
      `,
      [audit.id, 'audit_created', { case_id: caseId, status: 'Submitted' }, requestedBy]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Audit request submitted successfully.',
      audit,
    });
  } catch (error) {
    await client.query('ROLLBACK');

    if (error.code === '23505') {
      return res.status(409).json({ message: 'Unable to generate unique case ID. Please retry.' });
    }

    return res.status(500).json({ message: 'Failed to submit audit request.' });
  } finally {
    client.release();
  }
}

module.exports = {
  submitAudit,
};
