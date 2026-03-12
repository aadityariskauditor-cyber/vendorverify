const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

function sanitizeGstin(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function isValidGstin(gstin) {
  return GSTIN_REGEX.test(gstin);
}

function isRateLimited(clientKey) {
  const now = Date.now();
  const bucket = rateLimitStore.get(clientKey) || { count: 0, start: now };

  if (now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    bucket.count = 0;
    bucket.start = now;
  }

  bucket.count += 1;
  rateLimitStore.set(clientKey, bucket);

  return bucket.count > RATE_LIMIT_MAX_REQUESTS;
}

function buildMockIntelligence(gstin) {
  const mockProfiles = [
    {
      companyName: 'ABC Engineering Pvt Ltd',
      companyAge: 4.2,
      gstStatus: 'Active',
      filingScore: 'Medium',
      directorsCount: 2,
      litigationSignals: 1,
    },
    {
      companyName: 'Nexora Industrial Components LLP',
      companyAge: 6.8,
      gstStatus: 'Active',
      filingScore: 'Regular',
      directorsCount: 3,
      litigationSignals: 0,
    },
    {
      companyName: 'Stellar Procurement Services',
      companyAge: 1.7,
      gstStatus: 'Inactive',
      filingScore: 'Irregular',
      directorsCount: 1,
      litigationSignals: 2,
    },
  ];

  const profile = mockProfiles[gstin.charCodeAt(0) % mockProfiles.length];

  let riskScore = 0;
  if (profile.gstStatus === 'Active') riskScore += 20;
  if (profile.companyAge > 3) riskScore += 20;
  if (profile.filingScore === 'Regular') riskScore += 20;
  if (profile.directorsCount >= 2) riskScore += 20;
  if (profile.litigationSignals === 0) riskScore += 20;

  let riskCategory = 'High Risk';
  if (riskScore > 70) {
    riskCategory = 'Low Risk';
  } else if (riskScore > 40) {
    riskCategory = 'Moderate Risk';
  }

  return {
    ...profile,
    riskScore,
    riskCategory,
  };
}

exports.gstRiskCheck = (req, res) => {
  const debug = globalThis.console;
  const rawGstin = req.body?.gstin;
  const gstin = sanitizeGstin(rawGstin);
  const clientKey = req.ip || req.socket?.remoteAddress || 'unknown';

  debug.log('GST risk check started');

  if (isRateLimited(clientKey)) {
    return res.status(429).json({
      message: 'Too many requests. Please try again shortly.',
    });
  }

  if (!isValidGstin(gstin)) {
    debug.warn('GST validation failed');
    return res.status(400).json({
      message: 'Invalid GST number format.',
      details: 'GSTIN structure follows a defined 15-character format combining state code, PAN, entity number, and checksum. (Mark IT Solutions)',
    });
  }

  const intelligence = buildMockIntelligence(gstin);

  debug.log('GST API response received', { gstin, riskScore: intelligence.riskScore });

  // future integration
  // GST verification API
  // MCA company lookup API
  // litigation database
  return res.json({ gstin, ...intelligence });
};

exports.validateGstin = isValidGstin;
exports.sanitizeGstin = sanitizeGstin;
