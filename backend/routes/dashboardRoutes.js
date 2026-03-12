const express = require('express');
const { listDashboardAudits, listDashboardReports } = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/audits', authenticateToken, listDashboardAudits);
router.get('/reports', authenticateToken, listDashboardReports);

module.exports = router;
