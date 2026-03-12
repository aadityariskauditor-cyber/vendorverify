const express = require('express');
const { submitAudit } = require('../controllers/auditController');

const router = express.Router();

router.post('/', submitAudit);

module.exports = router;
