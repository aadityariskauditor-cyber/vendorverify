const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../services/storage-service');
const { saveVendorDocument } = require('../db/vendor-documents-repository');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const documentFieldMap = {
  gstCertificate: 'GST_CERTIFICATE',
  companyRegistration: 'COMPANY_REGISTRATION',
  complianceCertificates: 'COMPLIANCE_CERTIFICATE'
};

router.post(
  '/vendors/:vendorId/documents',
  upload.fields([
    { name: 'gstCertificate', maxCount: 1 },
    { name: 'companyRegistration', maxCount: 1 },
    { name: 'complianceCertificates', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { vendorId } = req.params;
      const filesByField = req.files || {};

      const uploadTasks = Object.entries(filesByField).flatMap(([fieldName, files]) => {
        const documentType = documentFieldMap[fieldName];
        if (!documentType) {
          return [];
        }

        return files.map(async (file) => {
          const fileUrl = await uploadFile(file, `vendor-documents/${vendorId}`);

          return saveVendorDocument({
            vendorId,
            documentType,
            fileName: file.originalname,
            fileUrl,
            mimeType: file.mimetype,
            fileSize: file.size
          });
        });
      });

      const savedDocuments = await Promise.all(uploadTasks);

      res.status(201).json({
        vendorId,
        documents: savedDocuments
      });
    } catch (error) {
      res.status(500).json({
        message: 'Unable to upload vendor documents.',
        error: error.message
      });
    }
  }
);

module.exports = router;
