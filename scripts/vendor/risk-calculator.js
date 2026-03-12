(() => {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  onReady(() => {
    const amountInput = document.getElementById('advanceAmount');
    const ageSelect = document.getElementById('vendorAgeCategory');
    const calculateButton = document.getElementById('calculateRiskBtn');
    const meterFill = document.getElementById('riskMeterFill');
    const resultContainer = document.getElementById('riskCalculatorResult');
    const debug = window.VendorVerifyDebug;

    const riskMultipliers = {
      moreThan3: 0.04,
      between1And3: 0.07,
      lessThan1: 0.12,
    };

    function formatInr(value) {
      return `₹${Number(value || 0).toLocaleString('en-IN')}`;
    }

    function ageLabel(value) {
      if (value === 'moreThan3') return '>3 years';
      if (value === 'lessThan1') return '<1 year';
      return '1–3 years';
    }

    function calculateExposure() {
      const amount = Math.max(0, Number(amountInput?.value || 0));
      const vendorAge = ageSelect?.value || 'between1And3';
      const multiplier = riskMultipliers[vendorAge] ?? riskMultipliers.between1And3;
      const riskExposure = Math.round(amount * multiplier);
      const verificationCost = 4999;
      const meterPercent = Math.max(10, Math.min(100, Math.round(multiplier * 1000)));

      if (meterFill) {
        meterFill.style.width = `${meterPercent}%`;
      }

      if (resultContainer) {
        resultContainer.innerHTML = `
          <p><strong>Advance Amount:</strong> ${formatInr(amount)}</p>
          <p><strong>Estimated Fraud Exposure:</strong> ${formatInr(riskExposure)}</p>
          <p><strong>Vendor Verification Cost:</strong> ${formatInr(verificationCost)}</p>
        `;
      }

      window.dispatchEvent(new CustomEvent('vendorverify:riskCalculator', {
        detail: { amount, vendorAge, riskExposure },
      }));

      debug?.log?.('Risk calculator executed', {
        amount,
        vendorAge: ageLabel(vendorAge),
        riskExposure,
      });
    }

    calculateButton?.addEventListener('click', calculateExposure);

    window.VendorVerifyRiskCalculator = {
      calculateExposure,
    };
  });
})();
