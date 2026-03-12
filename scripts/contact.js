(() => {
  const form = document.getElementById('contactForm');
  const state = document.getElementById('contactMessageState');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      state.textContent = 'Submitting...';
      await window.ApiClient.submitContact(payload);
      state.textContent = 'Thank you. Our team will respond within 24 hours.';
      form.reset();
    } catch (error) {
      state.textContent = error.message || 'Unable to submit your request right now.';
    }
  });
})();
