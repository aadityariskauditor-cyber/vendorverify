const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const ALLOWED_STATUSES = new Set(['Submitted', 'In Progress', 'Completed']);
const REPORT_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'reports');

if (!fs.existsSync(REPORT_UPLOAD_DIR)) {
  fs.mkdirSync(REPORT_UPLOAD_DIR, { recursive: true });
}

function ensureConsultantAccess(req, res) {
  if (!req.user || !['admin', 'consultant'].includes(req.user.role)) {
    res.status(403).json({ message: 'Consultant or admin access required.' });
    return false;
  }

  return true;
}

async function listConsultantAudits(req, res) {
  if (!ensureConsultantAccess(req, res)) {
    return;
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT
          a.id,
          a.case_id,
          a.vendor_name,
          a.vendor_email,
          a.vendor_country,
          a.transaction_value,
          a.status,
          COALESCE(a.request_data->>'payment_status', 'Pending') AS payment_status,
          COALESCE(r.report_url, '') AS report_url,
          a.created_at,
          a.updated_at
        FROM audits a
        LEFT JOIN LATERAL (
          SELECT report_url
          FROM reports
          WHERE audit_id = a.id
          ORDER BY uploaded_at DESC
          LIMIT 1
        ) r ON TRUE
        ORDER BY a.updated_at DESC;
      `
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load consultant dashboard audits.' });
  }
}

async function updateAuditStatus(req, res) {
  if (!ensureConsultantAccess(req, res)) {
    return;
  }

  const auditId = Number(req.params.auditId);
  const requestedStatus = String(req.body.status || '').trim();

  if (!Number.isInteger(auditId) || auditId <= 0) {
    return res.status(400).json({ message: 'A valid auditId is required.' });
  }

  if (!ALLOWED_STATUSES.has(requestedStatus)) {
    return res.status(400).json({
      message: `status must be one of: ${Array.from(ALLOWED_STATUSES).join(', ')}`,
    });
  }

  try {
    const { rows } = await pool.query(
      `
        UPDATE audits
        SET status = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, case_id, status, updated_at;
      `,
      [auditId, requestedStatus]
    );

    if (!rows[0]) {
      return res.status(404).json({ message: 'Audit not found.' });
    }

    return res.json({ message: 'Audit status updated.', audit: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update audit status.' });
  }
}

async function uploadReport(req, res) {
  if (!ensureConsultantAccess(req, res)) {
    return;
  }

  const auditId = Number(req.body.audit_id);

  if (!Number.isInteger(auditId) || auditId <= 0) {
    return res.status(400).json({ message: 'audit_id must be a valid integer.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'pdf_file is required.' });
  }

  const reportUrl = `/uploads/reports/${req.file.filename}`;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingAudit = await client.query(
      `SELECT id, case_id FROM audits WHERE id = $1 LIMIT 1;`,
      [auditId]
    );

    if (!existingAudit.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Audit not found for provided audit_id.' });
    }

    const reportInsert = await client.query(
      `
        INSERT INTO reports (audit_id, report_url, findings_summary, uploaded_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id, audit_id, report_url, uploaded_at;
      `,
      [auditId, reportUrl, null, req.user.id || null]
    );

    const updatedAudit = await client.query(
      `
        UPDATE audits
        SET status = 'Completed', updated_at = NOW()
        WHERE id = $1
        RETURNING id, case_id, status, updated_at;
      `,
      [auditId]
    );

    await client.query(
      `
        INSERT INTO audit_logs (audit_id, event_type, event_details, created_by)
        VALUES ($1, $2, $3, $4);
      `,
      [
        auditId,
        'report_uploaded',
        {
          report_url: reportUrl,
          uploaded_file: req.file.originalname,
          status: 'Completed',
        },
        req.user.id || null,
      ]
    );

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Report uploaded successfully.',
      report: reportInsert.rows[0],
      audit: updatedAudit.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Failed to upload report.' });
  } finally {
    client.release();
  }
}

async function listAuditLogs(req, res) {
  if (!ensureConsultantAccess(req, res)) {
    return;
  }

  const auditId = Number(req.params.auditId);

  if (!Number.isInteger(auditId) || auditId <= 0) {
    return res.status(400).json({ message: 'A valid auditId is required.' });
  }

  try {
    const { rows } = await pool.query(
      `
        SELECT id, audit_id, event_type, event_details, created_by, created_at
        FROM audit_logs
        WHERE audit_id = $1
        ORDER BY created_at DESC;
      `,
      [auditId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load audit logs.' });
  }
}

module.exports = {
  REPORT_UPLOAD_DIR,
  listConsultantAudits,
  updateAuditStatus,
  uploadReport,
  listAuditLogs,
};
