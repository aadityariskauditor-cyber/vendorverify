# VendorVerify

Official website for VendorVerify.in.

## Recommended Project Structure

vendorverify/
├── index.html
├── pages/
│   ├── about.html
│   ├── contact.html
│   ├── pricing.html
│   ├── features.html
│   └── auth/
│       ├── login.html
│       └── signup.html
├── styles/
│   ├── main.css
│   ├── reset.css
│   ├── variables.css
│   ├── layout/
│   │   ├── grid.css
│   │   └── responsive.css
│   ├── components/
│   │   ├── navbar.css
│   │   ├── footer.css
│   │   ├── buttons.css
│   │   └── cards.css
│   └── pages/
│       ├── home.css
│       ├── about.css
│       └── pricing.css
├── scripts/
│   ├── main.js
│   ├── utils/
│   │   ├── dom.js
│   │   ├── api.js
│   │   └── validators.js
│   ├── components/
│   │   ├── navbar.js
│   │   └── footer.js
│   └── pages/
│       ├── home.js
│       ├── contact.js
│       └── pricing.js
├── assets/
│   ├── images/
│   ├── fonts/
│   ├── illustrations/
│   └── favicons/
├── components/
│   ├── navbar.html
│   ├── footer.html
│   ├── cta-banner.html
│   └── testimonial-card.html
├── data/
│   ├── testimonials.json
│   ├── faqs.json
│   └── plans.json
├── backend/
├── tests/
└── docs/

## Backend vendor document upload

A minimal Express backend is available in `backend/` with multer-based multi-part uploads.

### Features
- `POST /api/vendors/:vendorId/documents`
- Accepts `gstCertificate`, `companyRegistration`, and `complianceCertificates` files
- Uploads files to Cloudinary and saves document metadata (including file URL) in `vendor_documents`

### Run backend
```bash
cd backend
npm install
cp .env.example .env
npm run start
```

### Database migration
Run the SQL script in `backend/migrations/001_create_vendor_documents.sql` on your Postgres database.
