const requestForm = document.getElementById('verificationRequestForm');
const selectedFiles = document.getElementById('selectedFiles');
const submissionMessage = document.getElementById('submissionMessage');
const submitButton = requestForm?.querySelector('button[type="submit"]');

const documentInputs = [
  { input: document.getElementById('gstCertificate'), label: 'GST Certificate' },
  { input: document.getElementById('companyRegistration'), label: 'Company Registration' },
  { input: document.getElementById('complianceCertificates'), label: 'Compliance Certificates' }
];

function renderSelectedFiles() {
  if (!selectedFiles) return;

  const chips = documentInputs
    .flatMap(({ input, label }) => {
      const files = Array.from(input?.files || []);
      return files.map((file) => `<span class="file-chip">${label}: ${file.name}</span>`);
    });

  selectedFiles.innerHTML = chips.length
    ? chips.join('')
    : '<div class="empty-state"><p>No documents uploaded yet.</p></div>';
}

documentInputs.forEach(({ input, label }) => {
  input?.addEventListener('change', () => {
    renderSelectedFiles();
    window.VendorVerifyDebug?.log?.(`Vendor documents uploaded: ${label}`);
  });
});

if (requestForm) {
  renderSelectedFiles();

  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    window.VendorVerifyUI?.setButtonLoading?.(submitButton, true);

    const formData = new FormData(requestForm);
    const uploadedFiles = documentInputs.flatMap(({ input }) => Array.from(input?.files || []).map((file) => file.name));

    const payload = {
      companyName: formData.get('companyName'),
      contactPerson: formData.get('contactName'),
      email: formData.get('contactEmail'),
      serviceCategory: formData.get('serviceCategory'),
      documents: uploadedFiles,
      status: 'Pending',
      riskScore: 0,
      phone: '',
      country: ''
    };

    try {
      await ApiClient.createVendor(payload);

      if (submissionMessage) {
        submissionMessage.textContent = 'Verification request submitted successfully. Redirecting to status page...';
        submissionMessage.className = 'submission-message success';
      }
      window.VendorVerifyUI?.showAlert?.('Verification request submitted.', 'success');
      window.VendorVerifyDebug?.log?.('Vendor verification request submitted.');

      requestForm.reset();
      renderSelectedFiles();

      setTimeout(() => {
        window.location.href = 'status.html';
      }, 1200);
    } catch (error) {
      if (submissionMessage) {
        submissionMessage.textContent = error.message;
        submissionMessage.className = 'submission-message';
      }
      window.VendorVerifyUI?.showAlert?.(error.message, 'error');
      window.VendorVerifyDebug?.error?.('Vendor document upload failed.', error);
    } finally {
      window.VendorVerifyUI?.setButtonLoading?.(submitButton, false);
    }
  });
}
