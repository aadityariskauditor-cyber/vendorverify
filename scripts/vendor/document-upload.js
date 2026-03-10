const requestForm = document.getElementById('verificationRequestForm');
const selectedFiles = document.getElementById('selectedFiles');
const submissionMessage = document.getElementById('submissionMessage');

const documentInputs = [
  { input: document.getElementById('gstCertificate'), label: 'GST Certificate' },
  { input: document.getElementById('companyRegistration'), label: 'Company Registration' },
  { input: document.getElementById('complianceCertificates'), label: 'Compliance Certificate' }
];

const renderSelectedFiles = () => {
  if (!selectedFiles) {
    return;
  }

  const chips = documentInputs.flatMap(({ input, label }) => {
    const files = Array.from(input?.files || []);
    return files.map((file) => `<span class="file-chip">${label}: ${file.name}</span>`);
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
    const vendorId = `V-${Date.now()}`;

    const uploadPayload = new FormData();
    uploadPayload.append('gstCertificate', documentInputs[0].input.files[0]);
    uploadPayload.append('companyRegistration', documentInputs[1].input.files[0]);

    Array.from(documentInputs[2].input.files || []).forEach((file) => {
      uploadPayload.append('complianceCertificates', file);
    });

    try {
      const response = await fetch(`http://localhost:4000/api/vendors/${vendorId}/documents`, {
        method: 'POST',
        body: uploadPayload
      });

      if (!response.ok) {
        throw new Error('Upload failed.');
      }

      const uploadResult = await response.json();
      const request = {
        id: `VR-${Math.floor(1000 + Math.random() * 9000)}`,
        vendorId,
        companyName: formData.get('companyName'),
        contactName: formData.get('contactName'),
        contactEmail: formData.get('contactEmail'),
        serviceCategory: formData.get('serviceCategory'),
        documents: uploadResult.documents,
        submittedOn: new Date().toISOString(),
        status: 'Pending Review'
      };

      const existingRequests = JSON.parse(localStorage.getItem('vendorRequests') || '[]');
      existingRequests.unshift(request);
      localStorage.setItem('vendorRequests', JSON.stringify(existingRequests));

      if (submissionMessage) {
        submissionMessage.textContent = 'Documents uploaded and verification request submitted successfully. Redirecting to status page...';
        submissionMessage.classList.add('success');
      }

      requestForm.reset();
      renderSelectedFiles();

      setTimeout(() => {
        window.location.href = 'status.html';
      }, 1200);
    } catch (error) {
      if (submissionMessage) {
        submissionMessage.textContent = error.message || 'Unable to submit verification request.';
        submissionMessage.classList.remove('success');
      }
    }
  });
}
