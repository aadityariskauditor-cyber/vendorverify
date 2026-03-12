require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const auditRoutes = require('./routes/auditRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const gstRoutes = require('./routes/gst');
const { authenticateToken } = require('./middleware/authMiddleware');
const initializeDatabase = require('./config/initDb');

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_COOKIE = 'vendorverify_sid';
const sessionStore = new Map();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, decodeURIComponent(rest.join('='))];
  }).filter(([key]) => key));

  let sessionId = cookies[SESSION_COOKIE];

  if (!sessionId || !sessionStore.has(sessionId)) {
    sessionId = crypto.randomBytes(24).toString('hex');
    sessionStore.set(sessionId, {});
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Secure`);
  }

  req.session = sessionStore.get(sessionId);
  next();
});

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/pages/auth/login.html');
  }
  next();
}

async function sendContactMail({ name, company, email, phone, message }) {
  const payload = {
    from: process.env.CONTACT_FROM || 'no-reply@vendorverify.in',
    to: process.env.CONTACT_TO || 'contact@vendorverify.in',
    subject: `New VendorVerify contact request from ${name}`,
    text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
  };

  // Nodemailer-compatible payload reserved for SMTP integration.
  // eslint-disable-next-line no-console
  console.log('Contact email queued', payload);
}

app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/vendor/dashboard.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'vendor', 'dashboard.html'));
});

app.get('/vendor/submit-documents.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'vendor', 'submit-documents.html'));
});

app.get('/vendor/status.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'pages', 'vendor', 'status.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/contact', async (req, res) => {
  const { name, company, email, phone, message } = req.body || {};

  if (!name || !company || !email || !phone || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  if (!emailRegex.test(String(email).trim())) {
    return res.status(400).json({ message: 'Please provide a valid email.' });
  }

  if (!phoneRegex.test(String(phone).replace(/\D/g, ''))) {
    return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
  }

  try {
    await sendContactMail({ name, company, email, phone, message });
    return res.json({ success: true, message: 'Thank you. Our team will respond within 24 hours.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit contact request right now.' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/vendors', authenticateToken, vendorRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api', gstRoutes);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`VendorVerify backend listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
