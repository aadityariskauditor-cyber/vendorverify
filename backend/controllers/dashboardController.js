const { getAuditsForClient, getReportsForClient } = require('../models/dashboardModel');

async function listDashboardAudits(req, res) {
  try {
    const audits = await getAuditsForClient(req.user.id);
    return res.json(audits);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load active audits.' });
  }
}

async function listDashboardReports(req, res) {
  try {
    const reports = await getReportsForClient(req.user.id);
    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load completed reports.' });
  }
}

module.exports = {
  listDashboardAudits,
  listDashboardReports,
};
