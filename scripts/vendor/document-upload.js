const requestForm = document.getElementById('verificationRequestForm');
const selectedFiles = document.getElementById('selectedFiles');
const submissionMessage = document.getElementById('submissionMessage');

if (documentsInput && selectedFiles) {
  documentsInput.addEventListener('change', () => {
    const files = Array.from(documentsInput.files || []);
    selectedFiles.innerHTML = files.map((file) => `<span class="file-chip">${file.name}</span>`).join('');
  });

  selectedFiles.innerHTML = chips.join('');
};

documentInputs.forEach(({ input }) => {
  if (input) {
    input.addEventListener('change', renderSelectedFiles);
  }
});

if (requestForm) {
  requestForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(requestForm);
    const uploadedFiles = Array.from(documentsInput?.files || []).map((file) => file.name);

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
        submissionMessage.classList.add('success');
      }

      requestForm.reset();
      selectedFiles.innerHTML = '';

      setTimeout(() => {
        window.location.href = 'status.html';
      }, 1200);
    } catch (error) {
      if (submissionMessage) {
        submissionMessage.textContent = error.message;
      }
    }
  });
}
