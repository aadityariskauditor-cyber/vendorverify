/* ================================================================
   VendorVerify.in — Main JavaScript
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   NAV SCROLL EFFECT + ACTIVE LINK
   ---------------------------------------------------------------- */
const navbar  = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  // Sticky nav background
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 44);
  }
  // Scroll-to-top button
  if (scrollTopBtn) {
    scrollTopBtn.classList.toggle('show', window.scrollY > 420);
  }
  // Fade-up observer fallback (for older browsers)
  revealOnScroll();
});

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ----------------------------------------------------------------
   ACTIVE NAV LINK (based on current page)
   ---------------------------------------------------------------- */
function setActiveNavLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href === path ||
      (path === '' && href === 'index.html') ||
      (path === 'index.html' && href === 'index.html')
    ) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
setActiveNavLink();

/* ----------------------------------------------------------------
   MOBILE MENU TOGGLE
   ---------------------------------------------------------------- */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

function openMenu() {
  if (!mobileNav || !hamburger) return;
  mobileNav.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  if (!mobileNav || !hamburger) return;
  mobileNav.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMenu);
if (mobileClose) mobileClose.addEventListener('click', closeMenu);
if (mobileNav) {
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* ----------------------------------------------------------------
   SMOOTH ANCHOR SCROLL (offset for fixed nav)
   ---------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

/* ----------------------------------------------------------------
   INTERSECTION OBSERVER — FADE UP ANIMATIONS
   ---------------------------------------------------------------- */
const observerOptions = {
  threshold: 0.12,
  rootMargin: '0px 0px -56px 0px'
};

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, observerOptions);

function initObserver() {
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

// Fallback for older browsers
function revealOnScroll() {
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 56) {
      el.classList.add('visible');
    }
  });
}

if ('IntersectionObserver' in window) {
  initObserver();
} else {
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
}

/* ----------------------------------------------------------------
   FORM HANDLERS
   ---------------------------------------------------------------- */

// Generic form handler
function handleForm(formId, successId, validator) {
  const form = document.getElementById(formId);
  const successMsg = document.getElementById(successId);
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validator && !validator(form)) return;

    // Visual success state
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending…';
    }

    // Simulate async (replace with actual fetch in production)
    setTimeout(() => {
      if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      form.reset();
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    }, 900);
  });
}

// Free Risk Check form
handleForm('riskForm', 'riskSuccess', (form) => {
  const email = form.querySelector('[name="email"]');
  if (email && !email.value.includes('@')) {
    email.focus();
    email.style.borderColor = '#ef4444';
    setTimeout(() => email.style.borderColor = '', 2000);
    return false;
  }
  return true;
});

// Contact form
handleForm('contactForm', 'contactSuccess');

/* ----------------------------------------------------------------
   PRICING CARD — highlight on hover
   ---------------------------------------------------------------- */
document.querySelectorAll('.pricing-card:not(.featured)').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.borderColor = 'var(--gold)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.borderColor = '';
  });
});

/* ----------------------------------------------------------------
   HERO SCROLL HINT — hide after first scroll
   ---------------------------------------------------------------- */
const scrollHint = document.querySelector('.hero-scroll');
if (scrollHint) {
  window.addEventListener('scroll', function hideHint() {
    if (window.scrollY > 100) {
      scrollHint.style.opacity = '0';
      scrollHint.style.transition = 'opacity 0.6s ease';
      window.removeEventListener('scroll', hideHint);
    }
  }, { passive: true });
}

/* ----------------------------------------------------------------
   FORM INPUT VALIDATION FEEDBACK
   ---------------------------------------------------------------- */
document.querySelectorAll('.form-control').forEach(input => {
  input.addEventListener('blur', function () {
    if (this.hasAttribute('required') && !this.value.trim()) {
      this.style.borderColor = '#ef4444';
    } else {
      this.style.borderColor = '';
    }
  });
  input.addEventListener('input', function () {
    this.style.borderColor = '';
  });
});

/* ----------------------------------------------------------------
   COUNTER ANIMATION (for about page stats)
   ---------------------------------------------------------------- */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// Trigger counters when they enter view
const counterEls = document.querySelectorAll('[data-count]');
if (counterEls.length) {
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  counterEls.forEach(el => counterObserver.observe(el));
}

/* ----------------------------------------------------------------
   CURRENT YEAR (for footer)
   ---------------------------------------------------------------- */
document.querySelectorAll('.year').forEach(el => {
  el.textContent = new Date().getFullYear();
document.addEventListener("DOMContentLoaded", function () {

const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");
const mobileClose = document.getElementById("mobileClose");

if (hamburger && mobileNav) {
hamburger.addEventListener("click", function () {
mobileNav.classList.toggle("active");
document.body.style.overflow = mobileNav.classList.contains("active") ? "hidden" : "";
});
}

if (mobileClose && mobileNav) {
mobileClose.addEventListener("click", function () {
mobileNav.classList.remove("active");
document.body.style.overflow = "";
});
}

/* close menu when tapping outside */
document.addEventListener("click", function(e){

if(
mobileNav.classList.contains("active") &&
!mobileNav.contains(e.target) &&
!hamburger.contains(e.target)
){
mobileNav.classList.remove("active");
document.body.style.overflow = "";
}

});

