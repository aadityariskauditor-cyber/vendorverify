(() => {
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
    gstAge: { moreThan3: 5, between1And3: 10, lessThan1: 20 },
    operationalPresence: { factoryVerified: 5, addressUnverified: 10, residentialLocation: 20 },
  };

  function mapProbability(score) {
    if (score <= 20) return { level: 'LOW', probability: 8 };
    if (score <= 40) return { level: 'MODERATE', probability: 16 };
    return { level: 'HIGH', probability: 24 };
  }

  function calculateFraudProbability() {
    const amount = Number(advanceAmountInput?.value || 0);
    const vendorAge = vendorAgeInput?.value || 'between1And3';
    const gstAge = gstAgeInput?.value || 'between1And3';
    const operationalPresence = operationalPresenceInput?.value || 'addressUnverified';

    const baseScore = (weights.vendorAge[vendorAge] || 0)
      + (weights.gstAge[gstAge] || 0)
      + (weights.operationalPresence[operationalPresence] || 0);

    const amountFactor = amount > 1000000 ? 8 : amount > 500000 ? 5 : amount > 100000 ? 3 : 0;
    const score = Math.min(60, baseScore + amountFactor);
    const { level, probability } = mapProbability(score);

    if (probabilityMeter) {
      probabilityMeter.style.width = `${Math.min(100, probability)}%`;
    }

    if (resultContainer) {
      resultContainer.innerHTML = `
        <p><strong>Fraud Probability:</strong> ${probability}%</p>
        <p><strong>Risk Level:</strong> ${level}</p>
        <p><strong>Model Score:</strong> ${score} / 60</p>
      `;
    }

    debug?.log?.('Fraud probability calculated', {
      amount,
      vendorAge,
      gstAge,
      operationalPresence,
      score,
      probability,
      level,
    });
  }

  calculateButton?.addEventListener('click', calculateFraudProbability);

  window.VendorVerifyFraudProbability = {
    calculateFraudProbability,
  };
})();
