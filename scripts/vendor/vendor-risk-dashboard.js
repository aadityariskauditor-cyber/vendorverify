(() => {
  let radarChart;
  const debug = window.VendorVerifyDebug;

  function normalizeFilingScore(filingScore) {
    const numericScore = Number(filingScore);
    if (Number.isFinite(numericScore)) {
      return numericScore;
    }

    const filingScoreMap = {
      regular: 90,
      medium: 65,
      irregular: 35,
    };

    return filingScoreMap[String(filingScore || '').trim().toLowerCase()] ?? 60;
  }

  function getPillarValues(payload) {
    const riskScore = Number(payload?.riskScore || 0);
    const complianceSignals = Math.max(10, Math.min(100, normalizeFilingScore(payload?.filingScore)));
    const operationalPresence = Math.max(10, Math.min(100, Number(payload?.operationalPresenceScore || (100 - riskScore + 20))));
    const litigationSignals = Math.max(10, Math.min(100, 100 - Number(payload?.litigationSignals || 30)));

    return {
      riskScore,
      complianceSignals,
      operationalPresence,
      litigationSignals,
    };
  }

  function updateCard(id, value, suffix = '/ 100') {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = `${value} ${suffix}`;
    }
  }

  function renderRadar(values) {
    const canvas = document.getElementById('vendorRiskRadarChart');
    if (!canvas || typeof window.Chart === 'undefined') return;

    if (radarChart) radarChart.destroy();

    radarChart = new window.Chart(canvas, {
      type: 'radar',
      data: {
        labels: ['Vendor Risk Score', 'Compliance Signals', 'Operational Presence', 'Litigation Signals'],
        datasets: [{
          label: 'Risk pillars',
          data: [values.riskScore, values.complianceSignals, values.operationalPresence, values.litigationSignals],
          backgroundColor: 'rgba(95, 124, 255, 0.25)',
          borderColor: '#5f7cff',
          pointBackgroundColor: '#25d0be',
          pointBorderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: 20, color: '#dce6ff' },
            grid: { color: 'rgba(220, 230, 255, 0.2)' },
            pointLabels: { color: '#dce6ff' },
          },
        },
        plugins: {
          legend: {
            labels: { color: '#dce6ff' },
          },
        },
      },
    });
  }

  function render(payload) {
    const dashboard = document.getElementById('vendorRiskDashboard');
    if (!dashboard) return;

    const values = getPillarValues(payload);
    dashboard.classList.remove('is-hidden');

    updateCard('dashboardRiskScore', values.riskScore);
    updateCard('dashboardComplianceSignals', values.complianceSignals);
    updateCard('dashboardOperationalPresence', values.operationalPresence);
    updateCard('dashboardLitigationSignals', values.litigationSignals);

    renderRadar(values);
    debug?.log?.('Risk dashboard rendered', values);
  }

  window.VendorVerifyRiskDashboard = {
    render,
  };
})();
