(() => {
  const gstInput = document.getElementById('gstInput');
  const runButton = document.getElementById('runGSTCheck');
  const resultContainer = document.getElementById('gstRiskResult');

  const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

  function sanitizeGstin(value) {
    return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function getRiskCategory(score) {
    if (score > 70) return 'Low Risk';
    if (score > 40) return 'Moderate Risk';
    return 'High Risk';
  }

  function renderError(message, details = '') {
    if (!resultContainer) return;
    resultContainer.innerHTML = `
      <article class="content-card gst-result-card">
        <p class="text-danger"><strong>${message}</strong></p>
        ${details ? `<p>${details}</p>` : ''}
      </article>
    `;
  }

  function renderResult(payload) {
    if (!resultContainer) return;

    const riskCategory = payload.riskCategory || getRiskCategory(payload.riskScore);
    resultContainer.innerHTML = `
      <article class="content-card gst-result-card">
        <h3>Vendor Intelligence Snapshot</h3>
        <p><strong>Company Name:</strong> ${payload.companyName}</p>
        <p><strong>Company Age:</strong> ${payload.companyAge} years</p>
        <p><strong>GST Status:</strong> ${payload.gstStatus}</p>
        <p><strong>Filing Status:</strong> ${payload.filingScore}</p>
        <p><strong>Directors:</strong> ${payload.directorsCount}</p>
        <p><strong>Litigation Signals:</strong> ${payload.litigationSignals}</p>
        <p><strong>Vendor Risk Score:</strong> ${payload.riskScore} / 100 (${riskCategory})</p>
        <div class="gst-risk-chart-wrap">
          <canvas id="gstRiskChart" aria-label="Vendor risk score chart" role="img"></canvas>
        </div>
      </article>
    `;

    window.VendorVerifyRiskChart?.render?.(payload.riskScore);
    window.VendorVerifyRiskDashboard?.render?.(payload);
  }

  async function runGstRiskCheck() {
    const debug = window.VendorVerifyDebug;
    const gstin = sanitizeGstin(gstInput?.value);

    debug?.log?.('GST risk check started');

    if (!GSTIN_REGEX.test(gstin)) {
      debug?.warn?.('GST validation failed');
      renderError(
        'Invalid GST number format.',
        'GSTIN structure follows a defined 15-character format combining state code, PAN, entity number, and checksum. (Mark IT Solutions)',
      );
      return;
    }

    if (!window.ApiClient?.gstRiskCheck) {
      renderError('GST engine is unavailable right now.');
      return;
    }

    runButton?.setAttribute('disabled', 'true');

    try {
      const payload = await window.ApiClient.gstRiskCheck({ gstin });
      debug?.log?.('GST risk response received', payload);
      renderResult(payload);
      window.dispatchEvent(new CustomEvent('vendorverify:gstRisk', { detail: payload }));
    } catch (error) {
      renderError(error.message || 'Unable to complete GST risk check right now.');
    } finally {
      runButton?.removeAttribute('disabled');
    }
  }

  if (runButton && gstInput && resultContainer) {
    runButton.addEventListener('click', runGstRiskCheck);
  }
})();
