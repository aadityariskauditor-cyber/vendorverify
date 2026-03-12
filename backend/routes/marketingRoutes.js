const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const router = express.Router();

const TESTIMONIALS_FILE = path.join(__dirname, '..', '..', 'data', 'testimonials.json');
const LEADS_FILE = path.join(__dirname, '..', 'data', 'lead-requests.json');

async function readJson(filePath, fallback = []) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return fallback;
    }

    throw error;
  }
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2));
}

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await readJson(TESTIMONIALS_FILE);
    const status = req.query.status;

    if (!status) {
      return res.json({ testimonials });
    }

    return res.json({
      testimonials: testimonials.filter((item) => item.status === status),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load testimonials.' });
  }
});

router.patch('/testimonials/:id/approve', async (req, res) => {
  try {
    const testimonials = await readJson(TESTIMONIALS_FILE);
    const id = Number(req.params.id);
    const item = testimonials.find((entry) => entry.id === id);

    if (!item) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    item.status = 'approved';
    await writeJson(TESTIMONIALS_FILE, testimonials);

    return res.json({ message: 'Testimonial approved successfully.', testimonial: item });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to approve testimonial.' });
  }
});

router.delete('/testimonials/:id', async (req, res) => {
  try {
    const testimonials = await readJson(TESTIMONIALS_FILE);
    const id = Number(req.params.id);
    const remaining = testimonials.filter((entry) => entry.id !== id);

    if (remaining.length === testimonials.length) {
      return res.status(404).json({ message: 'Testimonial not found.' });
    }

    await writeJson(TESTIMONIALS_FILE, remaining);

    return res.json({ message: 'Testimonial deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete testimonial.' });
  }
});

router.post('/lead-capture', async (req, res) => {
  const { vendorName, gstin, transactionValue, email } = req.body || {};

  if (!vendorName || !gstin || !transactionValue || !email) {
    return res.status(400).json({ message: 'All lead capture fields are required.' });
  }

  try {
    const leads = await readJson(LEADS_FILE);
    const request = {
      id: Date.now(),
      vendorName,
      gstin,
      transactionValue,
      email,
      createdAt: new Date().toISOString(),
      // Future payment integration placeholder: attach Razorpay/PayPal payment intent id here.
      paymentIntentId: null,
    };

    leads.push(request);
    await writeJson(LEADS_FILE, leads);

    return res.status(201).json({
      message: 'Your vendor verification request has been received. Our analysts will respond within 4 hours.',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to submit lead request.' });
  }
});

module.exports = router;
