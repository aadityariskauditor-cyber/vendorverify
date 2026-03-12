(() => {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  onReady(() => {
    const gstInput = document.getElementById('gstInput');
    const runButton = document.getElementById('runGSTCheck');
    const resultContainer = document.getElementById('gstRiskResult');

    const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/;

    function sanitizeGstin(value) {
      return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    function getRiskCategory(score) {
      if (score >= 70) return 'Low Risk';
      if (score >= 40) return 'Moderate Risk';
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

      const riskScore = Number(payload?.riskScore || 0);
      const riskCategory = payload?.riskCategory || getRiskCategory(riskScore);
      resultContainer.innerHTML = `
        <article class="content-card gst-result-card">
          <h3>Vendor Intelligence Snapshot</h3>
          <p><strong>Company Name:</strong> ${payload?.companyName || 'N/A'}</p>
          <p><strong>Company Age:</strong> ${payload?.companyAge ?? 'N/A'} years</p>
          <p><strong>GST Status:</strong> ${payload?.gstStatus || 'N/A'}</p>
          <p><strong>Filing Score:</strong> ${payload?.filingScore ?? 'N/A'}</p>
          <p><strong>Directors:</strong> ${payload?.directorsCount ?? 'N/A'}</p>
          <p><strong>Litigation Signals:</strong> ${payload?.litigationSignals ?? 'N/A'}</p>
          <p><strong>Vendor Risk Score:</strong> ${riskScore} / 100 (${riskCategory})</p>
          <div class="gst-risk-chart-wrap">
            <canvas id="gstRiskChart" aria-label="Vendor risk score chart" role="img"></canvas>
          </div>
        </article>
      `;

      window.VendorVerifyRiskChart?.render?.(riskScore);
      window.VendorVerifyRiskDashboard?.render?.({ ...payload, riskScore });
    }

    async function runGstRiskCheck() {
      const debug = window.VendorVerifyDebug;
      debug?.log?.('GST risk check started');

      const gstin = sanitizeGstin(gstInput?.value);
      if (!GSTIN_REGEX.test(gstin)) {
        renderError('Invalid GST number format.', 'Please enter a valid 15-character GSTIN.');
        return;
      }

      if (!window.ApiClient?.gstRiskCheck) {
        renderError('GST engine is unavailable right now.');
        return;
      }

      runButton?.setAttribute('disabled', 'true');

      try {
        const payload = await window.ApiClient.gstRiskCheck({ gstin });
        renderResult(payload);
        window.dispatchEvent(new CustomEvent('vendorverify:gstRisk', { detail: payload }));
      } catch (error) {
        renderError(error?.message || 'Unable to complete GST risk check right now.');
      } finally {
        runButton?.removeAttribute('disabled');
      }
    }

    if (runButton && gstInput && resultContainer) {
      runButton.addEventListener('click', runGstRiskCheck);
    }

    window.VendorVerifyGstRiskCheck = {
      runGstRiskCheck,
    };
  });
})();
