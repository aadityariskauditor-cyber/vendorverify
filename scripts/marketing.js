const testimonialsGrid = document.getElementById('testimonialsGrid');
const testimonialEmptyState = document.getElementById('testimonialEmptyState');
const leadCaptureForm = document.getElementById('freeRiskCheckForm');

function createTestimonialCard(item) {
  return `
    <article class="content-card testimonial-card">
      <p>“${item.testimonial_text}”</p>
      <h3>${item.name}</h3>
      <span>${item.designation} · ${item.company_type}</span>
    </article>
  `;
}

async function loadTestimonials() {
  if (!testimonialsGrid || typeof ApiClient === 'undefined') {
    return;
  }

  try {
    const response = await ApiClient.getTestimonials('approved');
    const testimonials = response?.testimonials || [];

    testimonialsGrid.innerHTML = testimonials.map(createTestimonialCard).join('');

    if (testimonialEmptyState) {
      testimonialEmptyState.classList.toggle('is-hidden', testimonials.length > 0);
    }
  } catch (error) {
    if (testimonialEmptyState) {
      testimonialEmptyState.textContent = 'Unable to load testimonials right now.';
      testimonialEmptyState.classList.remove('is-hidden');
    }
  }
}

async function submitLeadCapture(event) {
  event.preventDefault();

  if (typeof ApiClient === 'undefined' || !leadCaptureForm) {
    return;
  }

  const formData = new FormData(leadCaptureForm);
  const payload = {
    vendorName: String(formData.get('vendorName') || '').trim(),
    gstin: String(formData.get('gstin') || '').trim(),
    transactionValue: String(formData.get('transactionValue') || '').trim(),
    email: String(formData.get('email') || '').trim(),
  };

  const submitButton = leadCaptureForm.querySelector('button[type="submit"]');

  try {
    window.VendorVerifyUI?.setButtonLoading(submitButton, true);
    const response = await ApiClient.submitLeadCapture(payload);

    const successMessage = response?.message || 'Your vendor verification request has been received. Our analysts will respond within 4 hours.';
    window.VendorVerifyUI?.showAlert(successMessage, 'success');

    const resultCard = document.getElementById('riskCheckResult');
    if (resultCard) {
      resultCard.classList.remove('is-hidden');
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    leadCaptureForm.reset();
    window.VendorVerifyDebug?.log?.('Lead form submitted.');
  } catch (error) {
    window.VendorVerifyUI?.showAlert(error.message || 'Unable to submit request right now.', 'danger');
    window.VendorVerifyDebug?.error?.('Lead form submission failed.', error);
  } finally {
    window.VendorVerifyUI?.setButtonLoading(submitButton, false);
  }
}

if (leadCaptureForm) {
  leadCaptureForm.addEventListener('submit', submitLeadCapture);
}

loadTestimonials();

// Future payment integration placeholder: after lead qualification, add Razorpay/PayPal checkout trigger here.
