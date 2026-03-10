const siteInfo = {
  founderName: 'Aditya',
  phone: '+91 9637439000',
  emailPrimary: 'aditya@vendorverify.in',
  emailSecondary: 'aaditya.riskauditor@gmail.com',
  serviceDeliveryTime: '3-5 business days',
  riskScoreRange: '0-100',
};

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach((question) => {
  question.addEventListener('click', () => {
    const item = question.closest('.faq-item');

    if (!item) {
      return;
    }

    const isOpen = item.classList.toggle('open');
    question.setAttribute('aria-expanded', String(isOpen));
  });
});

const featureTabs = document.querySelectorAll('.feature-tab');
const featurePanels = document.querySelectorAll('.tab-panel');

featureTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const selectedTab = tab.dataset.tab;

    featureTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', String(isActive));
    });

    featurePanels.forEach((panel) => {
      const isMatch = panel.dataset.tabPanel === selectedTab;
      panel.classList.toggle('active', isMatch);
      panel.hidden = !isMatch;
    });
  });
});

const animatedSections = document.querySelectorAll('[data-animate]');

animatedSections.forEach((section, index) => {
  section.style.transitionDelay = `${Math.min(index * 80, 360)}ms`;
});

if ('IntersectionObserver' in window && animatedSections.length) {
  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerInstance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -8% 0px',
  });

  animatedSections.forEach((section) => observer.observe(section));
} else {
  animatedSections.forEach((section) => section.classList.add('visible'));
}

const samePageLinks = document.querySelectorAll('a[href^="#"]');

samePageLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');

    if (!targetId || targetId === '#') {
      return;
    }

    const target = document.querySelector(targetId);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const adminSidebar = document.getElementById('adminSidebar');
const adminMenuToggle = document.getElementById('adminMenuToggle');

if (adminSidebar && adminMenuToggle) {
  adminMenuToggle.addEventListener('click', () => {
    const isOpen = adminSidebar.classList.toggle('open');
    adminMenuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const filterInput = document.querySelector('[data-table-filter]');

if (filterInput) {
  filterInput.addEventListener('input', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const selector = target.dataset.tableFilter;

    if (!selector) {
      return;
    }

    const table = document.querySelector(selector);

    if (!(table instanceof HTMLTableElement)) {
      return;
    }

    const query = target.value.toLowerCase().trim();
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const content = row.textContent?.toLowerCase() ?? '';
      row.style.display = content.includes(query) ? '' : 'none';
    });
  });
}

const vendorActionButtons = document.querySelectorAll('[data-vendor-action]');

vendorActionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-vendor-action');
    const row = button.closest('tr');

    if (!row) {
      return;
    }

    const statusBadge = row.querySelector('[data-status-badge]');

    if (!statusBadge) {
      return;
    }

    statusBadge.classList.remove('approved', 'pending', 'rejected');

    if (action === 'approve') {
      statusBadge.classList.add('approved');
      statusBadge.textContent = 'Approved';
      return;
    }

    if (action === 'reject') {
      statusBadge.classList.add('rejected');
      statusBadge.textContent = 'Rejected';
    }
  });
});

const verificationButtons = document.querySelectorAll('[data-verification-action]');
const verificationStatus = document.querySelector('[data-verification-status]');

verificationButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (!verificationStatus) {
      return;
    }

    const action = button.getAttribute('data-verification-action');

    verificationStatus.classList.remove('approved', 'pending', 'rejected');

    if (action === 'approve') {
      verificationStatus.classList.add('approved');
      verificationStatus.textContent = 'Approved';
      return;
    }

    if (action === 'reject') {
      verificationStatus.classList.add('rejected');
      verificationStatus.textContent = 'Rejected';
    }
  });
});



function applySiteInfo() {
  document.querySelectorAll('[data-site-info]').forEach((element) => {
    const key = element.getAttribute('data-site-info');

    if (!key || !(key in siteInfo)) {
      return;
    }

    element.textContent = siteInfo[key];
  });

  document.querySelectorAll('[data-site-info-link]').forEach((link) => {
    const key = link.getAttribute('data-site-info-link');

    if (!key || !(key in siteInfo)) {
      return;
    }

    const value = siteInfo[key];

    if (key.toLowerCase().includes('email')) {
      link.setAttribute('href', `mailto:${value}`);
      return;
    }

    if (key === 'phone') {
      const normalizedPhone = value.replace(/\s+/g, '');
      link.setAttribute('href', `tel:${normalizedPhone}`);
    }
  });
}

function getCurrentPath() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function highlightActiveLinks() {
  const currentPath = getCurrentPath();
  document.querySelectorAll('.nav-links a, .admin-nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    const linkPath = href.split('/').pop();
    const isActive = linkPath === currentPath;
    if (isActive) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function ensureFeedbackContainer() {
  let container = document.querySelector('.ui-feedback');
  if (!container) {
    container = document.createElement('div');
    container.className = 'ui-feedback';
    document.body.append(container);
  }
  return container;
}

function showAlert(message, type = 'info') {
  if (!message) return;
  const container = ensureFeedbackContainer();
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.append(alert);
  window.setTimeout(() => {
    alert.remove();
  }, 3600);
}

function setButtonLoading(button, isLoading) {
  if (!(button instanceof HTMLButtonElement || button instanceof HTMLAnchorElement)) return;
  button.classList.toggle('is-loading', Boolean(isLoading));
  if (button instanceof HTMLButtonElement) {
    button.disabled = Boolean(isLoading);
  }
}

function applyPricingContent() {
  const pricingConfig = window.vendorVerifyPricing;

  if (!pricingConfig?.plans?.length) {
    return;
  }

  const plansById = new Map(pricingConfig.plans.map((plan) => [plan.id, plan]));
  const formatInr = (value) => `₹${value.toLocaleString('en-IN')}`;

  document.querySelectorAll('[data-plan-name]').forEach((element) => {
    const planId = element.getAttribute('data-plan-name');
    const plan = planId ? plansById.get(planId) : null;

    if (plan) {
      element.textContent = plan.name;
    }
  });

  document.querySelectorAll('[data-plan-price]').forEach((element) => {
    const planId = element.getAttribute('data-plan-price');
    const plan = planId ? plansById.get(planId) : null;

    if (!plan) {
      return;
    }

    const billingSpan = element.querySelector('span:not(.price-secondary)');
    const usdSpan = element.querySelector('.price-secondary');

    if (billingSpan) {
      element.innerHTML = `${formatInr(plan.priceInr)}${billingSpan.outerHTML}`;
      return;
    }

    if (usdSpan) {
      element.innerHTML = `${formatInr(plan.priceInr)} ${usdSpan.outerHTML}`;
      return;
    }

    element.textContent = formatInr(plan.priceInr);
  });

  document.querySelectorAll('[data-plan-usd]').forEach((element) => {
    const planId = element.getAttribute('data-plan-usd');
    const plan = planId ? plansById.get(planId) : null;

    if (plan?.usdApprox) {
      element.textContent = `(≈ $${plan.usdApprox})`;
    }
  });

  const addOnList = document.getElementById('addonList');

  if (addOnList && Array.isArray(pricingConfig.addOns)) {
    addOnList.innerHTML = pricingConfig.addOns
      .map((item) => `<li>${item.label} – ${item.inr}</li>`)
      .join('');
  }
}


const riskCheckTriggers = document.querySelectorAll('[data-open-risk-check="true"]');
const freeRiskCheckForm = document.getElementById('freeRiskCheckForm');
const riskCheckResult = document.getElementById('riskCheckResult');
const riskVendorNameField = document.getElementById('risk-vendor-name');

function openRiskCheckForm() {
  if (!freeRiskCheckForm) {
    return;
  }

  freeRiskCheckForm.classList.remove('is-hidden');
  riskVendorNameField?.focus();
}

riskCheckTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    window.setTimeout(openRiskCheckForm, 200);
  });
});

if (freeRiskCheckForm && riskCheckResult) {
  freeRiskCheckForm.addEventListener('submit', (event) => {
    event.preventDefault();
    riskCheckResult.classList.remove('is-hidden');
    showAlert('Preliminary vendor risk signal is ready.', 'success');
    riskCheckResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

highlightActiveLinks();
applySiteInfo();
applyPricingContent();
window.VendorVerifyUI = { showAlert, setButtonLoading, siteInfo };
