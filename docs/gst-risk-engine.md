# GST Vendor Risk Pre-Check Engine

## Overview

VendorVerify's GST Vendor Risk Pre-Check Engine is a lead-generation and consulting-conversion feature.

It allows a user to enter a GSTIN and receive an instant preliminary intelligence snapshot. This is **not** a final due diligence report and does not replace analyst review.

## How the pre-check works

1. User enters GSTIN on the homepage.
2. Frontend sanitizes and validates GSTIN format (15-character pattern).
3. Frontend calls `POST /api/gst-risk-check`.
4. Backend validates GSTIN again and applies request rate limiting.
5. Backend returns mock intelligence and score:
   - companyName
   - companyAge
   - gstStatus
   - filingScore
   - directorsCount
   - litigationSignals
   - riskScore
   - riskCategory
6. Frontend renders result card and a doughnut chart.

## Scoring model

Each factor contributes 20 points:

- GST Active = +20
- Company Age > 3 years = +20
- Regular Filing = +20
- Stable Directors = +20
- No Litigation = +20

Total score = 100.

Risk categories:

- 0–40: High Risk
- 40–70: Moderate Risk
- 70–100: Low Risk

## Analyst review process

The instant result is intentionally preliminary.

VendorVerify analysts perform deeper checks before final recommendation, including:

- operational presence verification
- litigation checks
- financial indicators
- factory verification

## Future integrations

Backend includes placeholders for:

- GST verification API
- MCA company lookup API
- litigation database

These will replace or augment mock intelligence while preserving analyst-led decisioning.
