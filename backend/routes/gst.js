const express = require('express');
const { gstRiskCheck } = require('../controllers/gstController');

const router = express.Router();

router.post('/gst-risk-check', gstRiskCheck);

module.exports = router;
