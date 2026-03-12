const express = require('express');
const fs = require('fs');
const path = require('path');
const {
  REPORT_UPLOAD_DIR,
  listConsultantAudits,
  updateAuditStatus,
  uploadReport,
  listAuditLogs,
} = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

function sanitizeFileName(fileName) {
  const ext = path.extname(fileName || '').toLowerCase() || '.pdf';
  const baseName = path
    .basename(fileName || 'report', ext)
    .replace(/[^a-z0-9-_]+/gi, '-')
    .toLowerCase();

  return `${Date.now()}-${baseName}${ext}`;
}

function parseMultipartForm(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);

  if (!contentType.includes('multipart/form-data') || !boundaryMatch) {
    return res.status(400).json({ message: 'Content-Type must be multipart/form-data with boundary.' });
  }

  const boundary = `--${boundaryMatch[1]}`;
  const chunks = [];

  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    try {
      const buffer = Buffer.concat(chunks);
      const parts = buffer.toString('latin1').split(boundary).slice(1, -1);
      const fields = {};
      let parsedFile = null;

      for (const part of parts) {
        const cleanedPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
        const separatorIndex = cleanedPart.indexOf('\r\n\r\n');

        if (separatorIndex === -1) {
          continue;
        }

        const rawHeaders = cleanedPart.slice(0, separatorIndex);
        const content = cleanedPart.slice(separatorIndex + 4);
        const disposition = rawHeaders.match(/name="([^"]+)"/);

        if (!disposition) {
          continue;
        }

        const fieldName = disposition[1];
        const fileNameMatch = rawHeaders.match(/filename="([^"]*)"/);

        if (!fileNameMatch) {
          fields[fieldName] = content.replace(/\r\n$/, '');
          continue;
        }

        const originalName = fileNameMatch[1] || 'report.pdf';
        if (fieldName !== 'pdf_file') {
          continue;
        }

        if (path.extname(originalName).toLowerCase() !== '.pdf') {
          return res.status(400).json({ message: 'Only PDF files are allowed for pdf_file uploads.' });
        }

        parsedFile = {
          originalname: originalName,
          mimetype: 'application/pdf',
          buffer: Buffer.from(content, 'latin1').subarray(0, -2),
        };
      }

      if (parsedFile) {
        const safeName = sanitizeFileName(parsedFile.originalname);
        const targetPath = path.join(REPORT_UPLOAD_DIR, safeName);
        fs.writeFileSync(targetPath, parsedFile.buffer);

        req.file = {
          filename: safeName,
          originalname: parsedFile.originalname,
          mimetype: parsedFile.mimetype,
          path: targetPath,
        };
      }

      req.body = {
        ...req.body,
        ...fields,
      };

      return next();
    } catch (error) {
      return res.status(400).json({ message: 'Unable to parse report upload payload.' });
    }
  });

  return undefined;
}

router.get('/consultant/audits', authenticateToken, listConsultantAudits);
router.patch('/audits/:auditId/status', authenticateToken, updateAuditStatus);
router.get('/audits/:auditId/logs', authenticateToken, listAuditLogs);
router.post('/upload', authenticateToken, parseMultipartForm, uploadReport);

module.exports = router;
