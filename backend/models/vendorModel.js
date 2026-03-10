const pool = require('../config/db');

function normalizeVendor(row) {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    country: row.country,
    serviceCategory: row.service_category,
    riskScore: row.risk_score,
    status: row.status,
    notes: row.notes || [],
    documents: row.documents || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getAllVendors() {
  const { rows } = await pool.query('SELECT * FROM vendors ORDER BY created_at DESC;');
  return rows.map(normalizeVendor);
}

async function createVendor(payload, userId) {
  const query = `
    INSERT INTO vendors (
      company_name, contact_person, email, phone, country, service_category,
      risk_score, status, documents, created_by
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    payload.companyName,
    payload.contactPerson,
    payload.email,
    payload.phone || null,
    payload.country || null,
    payload.serviceCategory || null,
    Number(payload.riskScore || 0),
    payload.status || 'Pending',
    payload.documents || [],
    userId || null,
  ];

  const { rows } = await pool.query(query, values);
  return normalizeVendor(rows[0]);
}

async function updateVendor(id, payload) {
  const query = `
    UPDATE vendors
    SET company_name = $1,
        contact_person = $2,
        email = $3,
        phone = $4,
        country = $5,
        service_category = $6,
        risk_score = $7,
        status = $8,
        documents = $9,
        updated_at = NOW()
    WHERE id = $10
    RETURNING *;
  `;

  const values = [
    payload.companyName,
    payload.contactPerson,
    payload.email,
    payload.phone || null,
    payload.country || null,
    payload.serviceCategory || null,
    Number(payload.riskScore || 0),
    payload.status || 'Pending',
    payload.documents || [],
    Number(id),
  ];

  const { rows } = await pool.query(query, values);
  return rows[0] ? normalizeVendor(rows[0]) : null;
}

async function deleteVendor(id) {
  const { rowCount } = await pool.query('DELETE FROM vendors WHERE id = $1;', [Number(id)]);
  return rowCount > 0;
}

async function setVendorStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE vendors SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *;`,
    [status, Number(id)]
  );
  return rows[0] ? normalizeVendor(rows[0]) : null;
}

module.exports = {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  setVendorStatus,
};
