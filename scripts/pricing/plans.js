const pricingPlans = [
  {
    id: 'basic',
    name: 'Basic Vendor Verification',
    price: 4999,
    billingLabel: '',
    description: 'Ideal for foundational checks and onboarding confidence.',
    features: {
      verificationLimits: 'Core verification scope',
      priorityVerification: false,
      apiAccess: false,
    },
  },
  {
    id: 'enhanced',
    name: 'Enhanced Vendor Risk Evaluation',
    price: 11999,
    billingLabel: '',
    description: 'Expanded risk checks for deeper supplier confidence.',
    features: {
      verificationLimits: 'Expanded verification scope',
      priorityVerification: true,
      apiAccess: false,
    },
  },
  {
    id: 'strategic',
    name: 'Strategic Vendor Due Diligence',
    price: 24999,
    billingLabel: '',
    description: 'Comprehensive due diligence for critical vendor decisions.',
    features: {
      verificationLimits: 'Comprehensive verification scope',
      priorityVerification: true,
      apiAccess: true,
    },
  },
];

const comparisonRows = [
  {
    key: 'verificationLimits',
    label: 'Verification limits',
    format: (value) => value,
  },
  {
    key: 'priorityVerification',
    label: 'Priority verification',
    format: (value) => (value ? '✓ Included' : '—'),
  },
  {
    key: 'apiAccess',
    label: 'API access',
    format: (value) => (value ? '✓ Included' : '—'),
  },
];

const planSelector = document.getElementById('planSelector');
const comparisonTableBody = document.querySelector('#pricingComparisonTable tbody');
const selectionSummary = document.getElementById('selectionSummary');

if (planSelector && comparisonTableBody && selectionSummary) {
  let selectedPlanId = pricingPlans[1].id;

  const formatPrice = (plan) => {
    if (plan.price === null) {
      return 'Custom';
    }

    return `₹${plan.price.toLocaleString('en-IN')}`;
  };

  const renderSelector = () => {
    planSelector.innerHTML = pricingPlans
      .map((plan) => {
        const isActive = plan.id === selectedPlanId;

        return `
          <button class="plan-option${isActive ? ' active' : ''}" type="button" data-plan-id="${plan.id}" aria-pressed="${isActive}">
            <h3>${plan.name}</h3>
            <p class="price-value">${formatPrice(plan)}<span>${plan.billingLabel}</span></p>
            <p>${plan.description}</p>
          </button>
        `;
      })
      .join('');
  };

  const renderComparisonTable = () => {
    comparisonTableBody.innerHTML = comparisonRows
      .map((row) => {
        const cells = pricingPlans
          .map((plan) => {
            const value = plan.features[row.key];
            const rendered = row.format(value);
            const isAvailable = typeof value === 'boolean' && value;

            return `<td class="comparison-cell${isAvailable ? ' is-available' : ''}">${rendered}</td>`;
          })
          .join('');

        return `<tr><td class="feature-cell">${row.label}</td>${cells}</tr>`;
      })
      .join('');
  };

  const renderSummary = () => {
    const plan = pricingPlans.find((item) => item.id === selectedPlanId);

    if (!plan) {
      return;
    }

    selectionSummary.innerHTML = `
      <h2 class="summary-plan-name">${plan.name}</h2>
      <p class="price-value">${formatPrice(plan)}<span>${plan.billingLabel}</span></p>
      <p>${plan.description}</p>
      <ul class="summary-list">
        <li><strong>Verification limits:</strong> ${plan.features.verificationLimits}</li>
        <li><strong>Priority verification:</strong> ${plan.features.priorityVerification ? 'Included' : 'Not included'}</li>
        <li><strong>API access:</strong> ${plan.features.apiAccess ? 'Included' : 'Not included'}</li>
      </ul>
    `;
  };

  const render = () => {
    renderSelector();
    renderComparisonTable();
    renderSummary();
  };

  planSelector.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('button[data-plan-id]');

    if (!(button instanceof HTMLButtonElement)) {
      return;
    }

    selectedPlanId = button.dataset.planId ?? selectedPlanId;
    render();
  });

  render();
}
