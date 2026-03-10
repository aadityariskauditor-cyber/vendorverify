const requestForm = document.getElementById('verificationRequestForm');
const documentsInput = document.getElementById('companyDocuments');
const selectedFiles = document.getElementById('selectedFiles');
const submissionMessage = document.getElementById('submissionMessage');

if (documentsInput && selectedFiles) {
  documentsInput.addEventListener('change', () => {
    const files = Array.from(documentsInput.files || []);

    if (!files.length) {
      selectedFiles.innerHTML = '';
      return;
    }

    selectedFiles.innerHTML = files
      .map((file) => `<span class="file-chip">${file.name}</span>`)
      .join('');
  });
}

if (requestForm) {
  requestForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(requestForm);
    const uploadedFiles = Array.from(documentsInput?.files || []).map((file) => file.name);

    const request = {
      id: `VR-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      contactEmail: formData.get('contactEmail'),
      serviceCategory: formData.get('serviceCategory'),
      documents: uploadedFiles,
      submittedOn: new Date().toISOString(),
      status: 'Pending Review'
    };

    const existingRequests = JSON.parse(localStorage.getItem('vendorRequests') || '[]');
    existingRequests.unshift(request);
    localStorage.setItem('vendorRequests', JSON.stringify(existingRequests));

    if (submissionMessage) {
      submissionMessage.textContent = 'Verification request submitted successfully. Redirecting to status page...';
      submissionMessage.classList.add('success');
    }

    requestForm.reset();
    if (selectedFiles) {
      selectedFiles.innerHTML = '';
    }

    setTimeout(() => {
      window.location.href = 'status.html';
    }, 1200);
  });
}
