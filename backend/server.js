const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const authMiddleware = require('../middleware/auth');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.get('/api/protected/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected profile data.',
    user: req.user,
  });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  res.status(status).json({
    error: error.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`VendorVerify API listening on http://localhost:${port}`);
});
