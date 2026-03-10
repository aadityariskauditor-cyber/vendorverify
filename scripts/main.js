const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
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
  });

  animatedSections.forEach((section) => observer.observe(section));
} else {
  animatedSections.forEach((section) => section.classList.add('visible'));
}
