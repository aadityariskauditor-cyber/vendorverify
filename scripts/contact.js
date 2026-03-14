(() => {
  const form = document.getElementById('contactForm');
  const state = document.getElementById('contactMessageState');

  if (!form) return;

  form.addEventListener('submit', () => {
    const submitButton = form.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerText = 'Submitting...';
    }

    if (state) {
      state.textContent = 'Submitting...';
    }
  });
})();
