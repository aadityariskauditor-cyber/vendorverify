# VendorVerify Debugging Guide

This guide explains the new debugging tools in plain language.

## 1) One switch controls everything

All debugging is controlled from one place:

- File: `scripts/utils/debug.js`
- Switch: `const DEBUG_MODE = true`

### Enable debugging
Set:

```js
const DEBUG_MODE = true
```

### Disable debugging
Set:

```js
const DEBUG_MODE = false
```

When debugging is disabled, normal production behavior stays unchanged.

## 2) How to read debug messages

When enabled, messages appear in the browser console.

Examples:

- `[VendorVerify Debug | 14:23:01] Image loaded: /images/vendorverify-hero.jpg`
- `[VendorVerify Debug | 14:23:05] Page Loaded → /pages/pricing.html`
- `[VendorVerify ERROR | 14:23:10] API request failed: /api/vendors`

## 3) Debug panel (for non-technical users)

A small panel appears at the bottom-right when debugging is enabled.

It shows:

- Current page
- Last API call
- Image status
- Script status

If something says `Missing` or `Failed`, that area needs attention.

## 4) Find image path issues

The system checks key images automatically:

- `/images/vendorverify-hero.jpg`
- `/images/vendor-risk-analysis.jpg`
- `/images/founder.jpg`
- `/images/Qr-code.jpeg`
- `/images/verification-illustration.jpg`

If any image has a path problem, you will see:

- `Image failed to load. Check file path.`

## 5) Find routing issues

Every page load logs the route in console, like:

- `Page Loaded → /pages/blog/payment.html`

If a route is missing, system health check will report it under `Routes`.

## 6) Detect API failures

API calls in `scripts/api/api-client.js` now log:

- `API request started`
- `API response received`
- `API request failed`

This helps quickly identify backend or connection issues.

## 7) Run full system health check

From `admin-dashboard.html`, click:

- **Run System Health Check**

It checks:

1. Image paths
2. Script loading
3. Page routes
4. API endpoint availability
5. Payment page route
6. Vendor upload functionality

Results print in console and update the debug panel.
