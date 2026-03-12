(() => {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  onReady(() => {
    const advanceAmountInput = document.getElementById('fraudAdvanceAmount');
    const vendorAgeInput = document.getElementById('fraudVendorAge');
    const gstAgeInput = document.getElementById('gstRegistrationAge');
    const operationalPresenceInput = document.getElementById('operationalPresence');
    const calculateButton = document.getElementById('calculateFraudProbabilityBtn');
    const probabilityMeter = document.getElementById('probabilityMeterFill');
    const resultContainer = document.getElementById('fraudProbabilityResult');
    const debug = window.VendorVerifyDebug;

    const weights = {
      vendorAge: { moreThan3: 5, between1And3: 10, lessThan1: 20 },
      gstAge: { moreThan3: 5, between1And3: 10, lessThan1: 20, newGst: 20 },
      operationalPresence: { factoryVerified: 5, addressUnverified: 10, residentialLocation: 20 },
    };

    function computeRiskLevel(probability) {
      if (probability <= 35) return 'LOW';
      if (probability <= 65) return 'MODERATE';
      return 'HIGH';
    }

    function calculateFraudProbability() {
      const amount = Math.max(0, Number(advanceAmountInput?.value || 0));
      const vendorAge = vendorAgeInput?.value || 'between1And3';
      const gstAge = gstAgeInput?.value || 'between1And3';
      const operationalPresence = operationalPresenceInput?.value || 'addressUnverified';

      const score =
        (weights.vendorAge[vendorAge] ?? 10)
        + (weights.gstAge[gstAge] ?? 10)
        + (weights.operationalPresence[operationalPresence] ?? 10);

      const amountFactor = amount >= 1000000 ? 15 : amount >= 500000 ? 10 : amount >= 100000 ? 5 : 0;
      const probability = Math.min(100, score + amountFactor);
      const riskLevel = computeRiskLevel(probability);

      if (probabilityMeter) {
        probabilityMeter.style.width = `${probability}%`;
      }

      if (resultContainer) {
        resultContainer.innerHTML = `
          <p><strong>Fraud Probability:</strong> ${probability}%</p>
          <p><strong>Risk Level:</strong> ${riskLevel}</p>
        `;
      }

      const detail = { amount, vendorAge, gstAge, operationalPresence, score, probability, riskLevel };
      window.dispatchEvent(new CustomEvent('vendorverify:fraudProbability', { detail }));
      debug?.log?.('Fraud probability calculated', detail);
    }

    calculateButton?.addEventListener('click', calculateFraudProbability);

    window.VendorVerifyFraudProbability = {
      calculateFraudProbability,
    };
  });
})();
