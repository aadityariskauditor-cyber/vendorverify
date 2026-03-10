const pricingPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    billingLabel: '/month',
    description: 'Best for early-stage teams validating a growing vendor base.',
    features: {
      verificationLimits: 'Up to 100 verifications/month',
      priorityVerification: false,
      apiAccess: false,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    billingLabel: '/month',
    description: 'For teams that need faster turnaround and operational integrations.',
    features: {
      verificationLimits: 'Up to 1,000 verifications/month',
      priorityVerification: true,
      apiAccess: true,
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    billingLabel: 'custom',
    description: 'For complex procurement operations with high-volume verification.',
    features: {
      verificationLimits: 'Unlimited verifications',
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

    return `$${plan.price}`;
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
