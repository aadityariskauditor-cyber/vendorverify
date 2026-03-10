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
