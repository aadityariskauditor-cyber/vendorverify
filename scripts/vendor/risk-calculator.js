(() => {
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

  function calculateExposure() {
    const amount = Number(amountInput?.value || 0);
    const ageCategory = ageSelect?.value || 'between1And3';
    const multiplier = riskMultipliers[ageCategory] ?? riskMultipliers.between1And3;
    const exposure = Math.round(amount * multiplier);
    const cost = 4999;
    const meterPercent = Math.min(100, Math.round(multiplier * 1000));

    if (meterFill) {
      meterFill.style.width = `${meterPercent}%`;
    }

    if (resultContainer) {
      resultContainer.innerHTML = `
        <p><strong>Advance Amount:</strong> ${formatInr(amount)}</p>
        <p><strong>Estimated Fraud Exposure:</strong> ${formatInr(exposure)}</p>
        <p><strong>Vendor verification cost:</strong> ${formatInr(cost)}</p>
      `;
    }

    debug?.log?.('Risk calculator executed', { amount, ageCategory, exposure, meterPercent });
  }

  calculateButton?.addEventListener('click', calculateExposure);

  window.VendorVerifyRiskCalculator = {
    calculateExposure,
  };
})();
