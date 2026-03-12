(() => {
  const debug = window.VendorVerifyDebug;

  const HEALTH_CONFIG = {
    images: [
      '/images/vendorverify-hero.jpg',
      '/images/vendor-risk-analysis.jpg',
      '/images/founder.jpg',
      '/images/Qr-code.jpeg',
      '/images/verification-illustration.jpg',
    ],
    scripts: [
      'scripts/main.js',
      'scripts/api/api-client.js',
      'scripts/vendor/document-upload.js',
      'scripts/vendor/vendor-dashboard.js',
      'scripts/vendor/gst-risk-check.js',
      'scripts/vendor/vendor-risk-chart.js',
      'scripts/vendor/fraud-slider.js',
      'scripts/vendor/risk-calculator.js',
      'scripts/vendor/fraud-probability.js',
      'scripts/vendor/vendor-risk-dashboard.js',
      'scripts/vendor/report-preview.js',
      'scripts/vendor/share-risk-result.js',
    ],
    routes: [
      '/index.html',
      '/pages/pricing.html',
      '/pages/payment.html',
      '/pages/vendor/submit-documents.html',
      '/pages/blog/payment.html',
    ],
    api: ['/api/vendors', '/api/gst-risk-check'],
  };

  async function checkImages() {
    const missing = [];
    for (const path of HEALTH_CONFIG.images) {
      const ok = await debug?.imageCheck?.(path);
      if (!ok) missing.push(path);
    }
    return missing;
  }

  function checkScripts() {
    return HEALTH_CONFIG.scripts.filter((path) => !debug?.scriptCheck?.(path));
  }

  async function checkRoutes() {
    const missing = [];

    for (const route of HEALTH_CONFIG.routes) {
      try {
        const response = await fetch(route, { method: 'HEAD' });
        if (!response.ok) missing.push(route);
      } catch (error) {
        missing.push(route);
      }
    }

    return missing;
  }

  async function checkApi() {
    const failed = [];

    for (const endpoint of HEALTH_CONFIG.api) {
      try {
        const options = endpoint === '/api/gst-risk-check'
          ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gstin: '29ABCDE1234F1Z5' }) }
          : { method: 'GET' };
        const response = await debug?.apiCheck?.(endpoint, options);
        if (!response || !response.ok) {
          failed.push(endpoint);
        }
      } catch (error) {
        failed.push(endpoint);
      }
    }

    return failed;
  }

  function checkPaymentPage(routesMissing) {
    return routesMissing.includes('/pages/blog/payment.html')
      ? 'Missing /pages/blog/payment.html'
      : 'OK';
  }


  function checkGstRiskEngine(missingScripts, failedApi) {
    const routeOk = !failedApi.includes('/api/gst-risk-check');
    const scriptOk = !missingScripts.includes('scripts/vendor/gst-risk-check.js');
    const chartJsLoaded = typeof window.Chart !== 'undefined';

    if (routeOk && scriptOk && chartJsLoaded) {
      return 'OK';
    }

    return `Check route:${routeOk ? 'OK' : 'Missing'} script:${scriptOk ? 'OK' : 'Missing'} chartjs:${chartJsLoaded ? 'OK' : 'Missing'}`;
  }

  function checkVendorUpload() {
    const hasForm = Boolean(document.getElementById('verificationRequestForm'));
    const hasUploadScript = Boolean(window.location.pathname.includes('submit-documents') || window.ApiClient);
    return hasForm || hasUploadScript;
  }

  function checkSupplierRiskIntelligence(missingScripts) {
    const required = [
      'scripts/vendor/fraud-slider.js',
      'scripts/vendor/risk-calculator.js',
      'scripts/vendor/gst-risk-check.js',
      'scripts/vendor/fraud-probability.js',
      'scripts/vendor/vendor-risk-dashboard.js',
      'scripts/vendor/report-preview.js',
      'scripts/vendor/share-risk-result.js',
    ];

    const missing = required.filter((path) => missingScripts.includes(path));
    if (!missing.length) return 'OK';
    return `Missing ${missing.join(', ')}`;
  }

  async function runSystemHealthCheck() {
    if (!debug?.isEnabled?.()) {
      return null;
    }

    debug.log('VendorVerify System Health Check started.');

    const missingImages = await checkImages();
    const missingScripts = checkScripts();
    const missingRoutes = await checkRoutes();
    const failedApi = await checkApi();
    const paymentStatus = checkPaymentPage(missingRoutes);
    const vendorUploadOk = checkVendorUpload();
    const gstRiskEngine = checkGstRiskEngine(missingScripts, failedApi);
    const supplierRiskIntelligence = checkSupplierRiskIntelligence(missingScripts);

    const summary = {
      images: missingImages.length ? `Missing ${missingImages.join(', ')}` : 'OK',
      scripts: missingScripts.length ? `Missing ${missingScripts.join(', ')}` : 'OK',
      routes: missingRoutes.length ? `Missing ${missingRoutes.join(', ')}` : 'OK',
      api: failedApi.length ? `Failed ${failedApi.join(', ')}` : 'OK',
      paymentPage: paymentStatus,
      vendorUpload: vendorUploadOk ? 'OK' : 'Check vendor upload form/scripts',
      gstRiskEngine,
      supplierRiskIntelligence,
    };

    debug.log('VendorVerify System Health Check');
    debug.log(`Images: ${summary.images}`);
    debug.log(`Scripts: ${summary.scripts}`);
    debug.log(`Routes: ${summary.routes}`);
    debug.log(`API: ${summary.api}`);
    debug.log(`Payment Page: ${summary.paymentPage}`);
    debug.log(`Vendor Upload: ${summary.vendorUpload}`);
    debug.log(`GST Risk Engine: ${summary.gstRiskEngine}`);
    debug.log(`Supplier Risk Intelligence System: ${summary.supplierRiskIntelligence}`);
    if (summary.supplierRiskIntelligence === 'OK') {
      debug.log('Supplier Risk Intelligence System: OK');
    }

    debug.updatePanelState('imageStatus', summary.images);
    debug.updatePanelState('scriptStatus', summary.scripts);

    return summary;
  }

  window.VendorVerifySystemHealth = {
    run: runSystemHealthCheck,
  };
})();
