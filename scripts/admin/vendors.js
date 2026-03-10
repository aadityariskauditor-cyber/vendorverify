const vendors = [
  {
    id: crypto.randomUUID(),
    companyName: 'BluePeak Logistics',
    contactPerson: 'Alex Morgan',
    email: 'alex@bluepeak.com',
    phone: '+1 555-0135',
    country: 'United States',
    status: 'Pending',
    documents: ['GST-certificate.pdf', 'business-registration.pdf', 'insurance-compliance.pdf'],
    riskScore: 64,
    verificationNotes: ['Initial documents submitted. Awaiting manual review.'],
  },
  {
    id: crypto.randomUUID(),
    companyName: 'Nova Chemical Supply',
    contactPerson: 'Sofia Bennett',
    email: 'sofia@novachem.com',
    phone: '+44 20 7946 0901',
    country: 'United Kingdom',
    status: 'Under Review',
    documents: ['GST-certificate.pdf', 'business-registration.pdf', 'iso-9001-compliance.pdf'],
    riskScore: 41,
    verificationNotes: ['KYC validated. Performing compliance cross-check.'],
  },
];

const statusClassMap = {
  Pending: 'pending',
  'Under Review': 'under-review',
  Approved: 'approved',
  Rejected: 'rejected',
};

const tableBody = document.getElementById('vendorTableBody');
const searchInput = document.getElementById('vendorSearch');
const vendorForm = document.getElementById('vendorForm');
const formTitle = document.getElementById('formTitle');
const formHint = document.getElementById('formHint');
const saveVendorBtn = document.getElementById('saveVendorBtn');
const resetVendorFormBtn = document.getElementById('resetVendorFormBtn');
const profileStatusBadge = document.getElementById('profileStatusBadge');
const vendorProfileDetails = document.getElementById('vendorProfileDetails');
const profileDocuments = document.getElementById('profileDocuments');
const profileNotes = document.getElementById('profileNotes');
const approveVendorBtn = document.getElementById('approveVendorBtn');
const rejectVendorBtn = document.getElementById('rejectVendorBtn');
const deleteVendorBtn = document.getElementById('deleteVendorBtn');
const addNoteBtn = document.getElementById('addNoteBtn');
const adminNoteInput = document.getElementById('adminNoteInput');

let selectedVendorId = vendors[0]?.id ?? null;

function getSelectedVendor() {
  return vendors.find((vendor) => vendor.id === selectedVendorId) ?? null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getStatusClass(status) {
  return statusClassMap[status] ?? 'pending';
}

function renderVendorTable() {
  if (!tableBody) {
    return;
  }

  const query = searchInput?.value.trim().toLowerCase() ?? '';

  const filteredVendors = vendors.filter((vendor) => {
    if (!query) {
      return true;
    }

    const haystack = `${vendor.companyName} ${vendor.contactPerson} ${vendor.email} ${vendor.status} ${vendor.country}`.toLowerCase();
    return haystack.includes(query);
  });

  tableBody.innerHTML = filteredVendors.map((vendor) => `
    <tr data-vendor-id="${vendor.id}" class="${vendor.id === selectedVendorId ? 'selected-row' : ''}">
      <td>${escapeHtml(vendor.companyName)}</td>
      <td>${escapeHtml(vendor.contactPerson)}</td>
      <td>${escapeHtml(vendor.email)}</td>
      <td>${escapeHtml(vendor.country)}</td>
      <td><span class="status-badge ${getStatusClass(vendor.status)}">${escapeHtml(vendor.status)}</span></td>
      <td>${escapeHtml(vendor.riskScore)}</td>
      <td>
        <div class="action-row compact">
          <button class="btn btn-secondary" type="button" data-action="view">View</button>
          <button class="btn btn-secondary" type="button" data-action="edit">Edit</button>
          <button class="btn btn-danger" type="button" data-action="delete">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderVendorProfile() {
  const vendor = getSelectedVendor();

  if (!profileStatusBadge || !vendorProfileDetails || !profileDocuments || !profileNotes) {
    return;
  }

  if (!vendor) {
    profileStatusBadge.className = 'status-badge pending';
    profileStatusBadge.textContent = 'Pending';
    vendorProfileDetails.innerHTML = '<p><strong>No vendor selected.</strong> Create or select a vendor to view profile details.</p>';
    profileDocuments.innerHTML = '<li>No documents uploaded yet.</li>';
    profileNotes.innerHTML = '<p>No verification notes yet.</p>';
    return;
  }

  profileStatusBadge.className = `status-badge ${getStatusClass(vendor.status)}`;
  profileStatusBadge.textContent = vendor.status;

  vendorProfileDetails.innerHTML = `
    <p><strong>Company Name:</strong> ${escapeHtml(vendor.companyName)}</p>
    <p><strong>Contact Person:</strong> ${escapeHtml(vendor.contactPerson)}</p>
    <p><strong>Email:</strong> ${escapeHtml(vendor.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(vendor.phone)}</p>
    <p><strong>Country:</strong> ${escapeHtml(vendor.country)}</p>
    <p><strong>Risk score:</strong> ${escapeHtml(vendor.riskScore)}</p>
  `;

  profileDocuments.innerHTML = vendor.documents.length
    ? vendor.documents.map((document) => `<li>${escapeHtml(document)}</li>`).join('')
    : '<li>No documents uploaded yet.</li>';

  profileNotes.innerHTML = vendor.verificationNotes.length
    ? vendor.verificationNotes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')
    : '<p>No verification notes yet.</p>';
}

function resetFormToCreateMode() {
  if (!vendorForm || !formTitle || !formHint || !saveVendorBtn) {
    return;
  }

  vendorForm.reset();
  const idField = document.getElementById('vendorId');

  if (idField) {
    idField.value = '';
  }

  formTitle.textContent = 'Create Vendor';
  formHint.textContent = 'Fill in details to create a new vendor record.';
  saveVendorBtn.textContent = 'Create Vendor';
}

function populateForm(vendor) {
  const idField = document.getElementById('vendorId');
  const companyName = document.getElementById('companyName');
  const contactPerson = document.getElementById('contactPerson');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');
  const country = document.getElementById('country');
  const vendorStatus = document.getElementById('vendorStatus');
  const riskScore = document.getElementById('riskScore');

  if (!idField || !companyName || !contactPerson || !email || !phone || !country || !vendorStatus || !riskScore) {
    return;
  }

  idField.value = vendor.id;
  companyName.value = vendor.companyName;
  contactPerson.value = vendor.contactPerson;
  email.value = vendor.email;
  phone.value = vendor.phone;
  country.value = vendor.country;
  vendorStatus.value = vendor.status;
  riskScore.value = String(vendor.riskScore);

  if (formTitle && formHint && saveVendorBtn) {
    formTitle.textContent = 'Edit Vendor';
    formHint.textContent = `Updating profile for ${vendor.companyName}.`;
    saveVendorBtn.textContent = 'Save Changes';
  }
}

function getUploadedDocuments() {
  const gstCertificate = document.getElementById('gstCertificate');
  const businessRegistration = document.getElementById('businessRegistration');
  const complianceCertificates = document.getElementById('complianceCertificates');

  const files = [
    ...(gstCertificate?.files ? Array.from(gstCertificate.files) : []),
    ...(businessRegistration?.files ? Array.from(businessRegistration.files) : []),
    ...(complianceCertificates?.files ? Array.from(complianceCertificates.files) : []),
  ];

  return files.map((file) => file.name);
}

if (vendorForm) {
  vendorForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(vendorForm);
    const vendorId = String(formData.get('vendorId') || '').trim();

    const payload = {
      companyName: String(formData.get('companyName') || '').trim(),
      contactPerson: String(formData.get('contactPerson') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      country: String(formData.get('country') || '').trim(),
      status: String(formData.get('vendorStatus') || 'Pending').trim(),
      riskScore: Number(formData.get('riskScore') || 0),
      documents: getUploadedDocuments(),
    };

    if (vendorId) {
      const existingVendor = vendors.find((vendor) => vendor.id === vendorId);

      if (existingVendor) {
        const mergedDocuments = payload.documents.length
          ? [...new Set([...existingVendor.documents, ...payload.documents])]
          : existingVendor.documents;

        Object.assign(existingVendor, payload, { documents: mergedDocuments });
        selectedVendorId = existingVendor.id;
      }
    } else {
      const newVendor = {
        id: crypto.randomUUID(),
        ...payload,
        verificationNotes: ['Vendor profile created by admin.'],
      };

      vendors.unshift(newVendor);
      selectedVendorId = newVendor.id;
    }

    renderVendorTable();
    renderVendorProfile();
    resetFormToCreateMode();
  });
}

tableBody?.addEventListener('click', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const row = target.closest('tr');

  if (!row) {
    return;
  }

  const vendor = vendors.find((item) => item.id === row.dataset.vendorId);

  if (!vendor) {
    return;
  }

  const action = target.dataset.action;

  if (action === 'edit') {
    selectedVendorId = vendor.id;
    populateForm(vendor);
    renderVendorTable();
    renderVendorProfile();
    return;
  }

  if (action === 'delete') {
    const index = vendors.findIndex((item) => item.id === vendor.id);

    if (index >= 0) {
      vendors.splice(index, 1);
    }

    selectedVendorId = vendors[0]?.id ?? null;
    resetFormToCreateMode();
    renderVendorTable();
    renderVendorProfile();
    return;
  }

  selectedVendorId = vendor.id;
  renderVendorTable();
  renderVendorProfile();
});

approveVendorBtn?.addEventListener('click', () => {
  const vendor = getSelectedVendor();

  if (!vendor) {
    return;
  }

  vendor.status = 'Approved';
  vendor.verificationNotes.push('Vendor approved by admin.');
  renderVendorTable();
  renderVendorProfile();
});

rejectVendorBtn?.addEventListener('click', () => {
  const vendor = getSelectedVendor();

  if (!vendor) {
    return;
  }

  vendor.status = 'Rejected';
  vendor.verificationNotes.push('Vendor rejected by admin.');
  renderVendorTable();
  renderVendorProfile();
});

deleteVendorBtn?.addEventListener('click', () => {
  const vendor = getSelectedVendor();

  if (!vendor) {
    return;
  }

  const index = vendors.findIndex((item) => item.id === vendor.id);

  if (index >= 0) {
    vendors.splice(index, 1);
  }

  selectedVendorId = vendors[0]?.id ?? null;
  resetFormToCreateMode();
  renderVendorTable();
  renderVendorProfile();
});

addNoteBtn?.addEventListener('click', () => {
  const vendor = getSelectedVendor();
  const note = adminNoteInput?.value.trim();

  if (!vendor || !note) {
    return;
  }

  vendor.verificationNotes.push(note);
  adminNoteInput.value = '';
  renderVendorProfile();
});

searchInput?.addEventListener('input', () => {
  renderVendorTable();
});

resetVendorFormBtn?.addEventListener('click', () => {
  resetFormToCreateMode();
});

renderVendorTable();
renderVendorProfile();
