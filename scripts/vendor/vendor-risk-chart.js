(() => {
  let riskChartInstance;

  function renderVendorRiskChart(score = 0) {
    const canvas = document.getElementById('gstRiskChart');

    if (!canvas || typeof window.Chart === 'undefined') {
      return;
    }

    if (riskChartInstance) {
      riskChartInstance.destroy();
    }

    riskChartInstance = new window.Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Risk Score', 'Remaining'],
        datasets: [{
          data: [score, Math.max(100 - score, 0)],
          backgroundColor: ['#5f7cff', '#dce6ff'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  window.VendorVerifyRiskChart = {
    render: renderVendorRiskChart,
  };
})();
