const express = require('express');
const { submitAudit } = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, submitAudit);

module.exports = router;
