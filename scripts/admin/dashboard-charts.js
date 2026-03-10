(function () {
  const chartCanvasIds = [
    'verificationTrendsChart',
    'monthlyApprovalsChart',
    'riskDistributionChart'
  ];

  if (typeof window.Chart === 'undefined') {
    chartCanvasIds.forEach((id) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const wrapper = canvas.closest('.chart-widget');
      if (!wrapper) return;
      const message = document.createElement('p');
      message.className = 'chart-fallback';
      message.textContent = 'Chart data is currently unavailable.';
      wrapper.appendChild(message);
    });
    return;
  }

  const baseGridColor = 'rgba(255, 255, 255, 0.08)';
  const baseTickColor = 'rgba(235, 241, 255, 0.85)';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: baseTickColor,
          font: {
            family: 'Inter, system-ui, sans-serif'
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: baseTickColor },
        grid: { color: baseGridColor }
      },
      y: {
        ticks: { color: baseTickColor },
        grid: { color: baseGridColor },
        beginAtZero: true
      }
    }
  };

  const trendsContext = document.getElementById('verificationTrendsChart');
  if (trendsContext) {
    new window.Chart(trendsContext, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Verified',
            data: [72, 85, 88, 94, 109, 121, 134],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.25)',
            tension: 0.35,
            fill: true
          },
          {
            label: 'Pending',
            data: [46, 41, 38, 35, 33, 31, 29],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: commonOptions
    });
  }

  const approvalsContext = document.getElementById('monthlyApprovalsChart');
  if (approvalsContext) {
    new window.Chart(approvalsContext, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Approvals',
            data: [58, 64, 71, 76, 84, 90],
            backgroundColor: ['#6366f1', '#4f46e5', '#4338ca', '#312e81', '#1d4ed8', '#1e40af'],
            borderRadius: 8
          }
        ]
      },
      options: {
        ...commonOptions,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  const riskContext = document.getElementById('riskDistributionChart');
  if (riskContext) {
    new window.Chart(riskContext, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [
          {
            data: [58, 28, 14],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
            borderColor: '#0f172a',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: baseTickColor,
              font: {
                family: 'Inter, system-ui, sans-serif'
              }
            }
          }
        }
      }
    });
  }
})();
