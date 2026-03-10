const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const vendorDocumentsRouter = require('./routes/vendor-documents');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', vendorDocumentsRouter);

app.listen(port, () => {
  console.log(`VendorVerify backend listening on port ${port}`);
});
