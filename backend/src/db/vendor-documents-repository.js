const { hasDatabase, query } = require('../config/database');

const inMemoryDocuments = [];

const saveVendorDocument = async (documentPayload) => {
  const { vendorId, documentType, fileName, fileUrl, mimeType, fileSize } = documentPayload;

  if (!hasDatabase) {
    const fallbackRecord = {
      id: `DOC-${Date.now()}`,
      vendor_id: vendorId,
      document_type: documentType,
      file_name: fileName,
      file_url: fileUrl,
      mime_type: mimeType,
      file_size: fileSize,
      created_at: new Date().toISOString()
    };

    inMemoryDocuments.push(fallbackRecord);
    return fallbackRecord;
  }

  const result = await query(
    `INSERT INTO vendor_documents (
      vendor_id,
      document_type,
      file_name,
      file_url,
      mime_type,
      file_size
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, vendor_id, document_type, file_name, file_url, mime_type, file_size, created_at`,
    [vendorId, documentType, fileName, fileUrl, mimeType, fileSize]
  );

  return result.rows[0];
};

module.exports = {
  saveVendorDocument
};
