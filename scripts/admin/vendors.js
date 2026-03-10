let vendors = [];
let selectedVendorId = null;

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

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('approved')) return 'approved';
  if (value.includes('reject')) return 'rejected';
  return 'pending';
}

function getSelectedVendor() {
  return vendors.find((vendor) => String(vendor.id) === String(selectedVendorId)) || null;
}

function renderVendorTable() {
  if (!tableBody) return;
  const query = String(searchInput?.value || '').toLowerCase().trim();
  const filtered = vendors.filter((vendor) => {
    const text = [vendor.companyName, vendor.contactPerson, vendor.email, vendor.status].join(' ').toLowerCase();
    return text.includes(query);
  });

  tableBody.innerHTML = filtered.length
    ? filtered.map((vendor) => `
      <tr data-vendor-id="${vendor.id}" class="${selectedVendorId === vendor.id ? 'is-selected' : ''}">
        <td>${escapeHtml(vendor.companyName)}</td>
        <td>${escapeHtml(vendor.contactPerson)}</td>
        <td>${escapeHtml(vendor.email)}</td>
        <td>${escapeHtml(vendor.country || '-')}</td>
        <td><span class="status-badge ${getStatusClass(vendor.status)}">${escapeHtml(vendor.status)}</span></td>
        <td>${escapeHtml(vendor.riskScore)}</td>
        <td><button class="btn btn-secondary" type="button" data-action="edit">Edit</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="7"><div class="empty-state"><p>No vendors yet. Start by adding your first vendor.</p><button type="button" class="btn btn-outline" id="emptyCreateVendorBtn">Create Vendor</button></div></td></tr>';
}

function renderVendorProfile() {
  const vendor = getSelectedVendor();
  if (!vendor || !profileStatusBadge || !vendorProfileDetails || !profileDocuments || !profileNotes) return;

  profileStatusBadge.className = `status-badge ${getStatusClass(vendor.status)}`;
  profileStatusBadge.textContent = vendor.status;
  vendorProfileDetails.innerHTML = `
    <p><strong>Company Name:</strong> ${escapeHtml(vendor.companyName)}</p>
    <p><strong>Contact Person:</strong> ${escapeHtml(vendor.contactPerson)}</p>
    <p><strong>Email:</strong> ${escapeHtml(vendor.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(vendor.phone || '-')}</p>
    <p><strong>Country:</strong> ${escapeHtml(vendor.country || '-')}</p>
    <p><strong>Risk Score:</strong> ${escapeHtml(vendor.riskScore)}</p>
  `;
  profileDocuments.innerHTML = (vendor.documents || []).length
    ? vendor.documents.map((file) => `<li>${escapeHtml(file)}</li>`).join('')
    : '<li><div class="empty-state"><p>No documents uploaded yet.</p></div></li>'; 
  profileNotes.innerHTML = (vendor.notes || []).length
    ? vendor.notes.map((note) => `<p>${escapeHtml(note)}</p>`).join('')
    : '<div class="empty-state"><p>No verification notes yet. Add a note to capture your review.</p></div>'; 
}

function populateForm(vendor) {
  document.getElementById('vendorId').value = vendor.id;
  document.getElementById('companyName').value = vendor.companyName;
  document.getElementById('contactPerson').value = vendor.contactPerson;
  document.getElementById('email').value = vendor.email;
  document.getElementById('phone').value = vendor.phone || '';
  document.getElementById('country').value = vendor.country || '';
  document.getElementById('vendorStatus').value = vendor.status || 'Pending';
  document.getElementById('riskScore').value = vendor.riskScore || 0;

  formTitle.textContent = 'Edit Vendor';
  formHint.textContent = `Updating profile for ${vendor.companyName}.`;
  saveVendorBtn.textContent = 'Save Changes';
}

function resetFormToCreateMode() {
  vendorForm?.reset();
  document.getElementById('vendorId').value = '';
  formTitle.textContent = 'Create Vendor';
  formHint.textContent = 'Fill in details to create a new vendor record.';
  saveVendorBtn.textContent = 'Create Vendor';
}

async function loadVendors() {
  try {
    vendors = await ApiClient.getVendors();
    selectedVendorId = vendors[0]?.id || null;
    renderVendorTable();
    renderVendorProfile();
  } catch (error) {
    window.VendorVerifyUI?.showAlert?.(error.message, "error");
  }
}

vendorForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(vendorForm);
  const vendorId = formData.get('vendorId');
  const payload = {
    companyName: String(formData.get('companyName') || '').trim(),
    contactPerson: String(formData.get('contactPerson') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    country: String(formData.get('country') || '').trim(),
    status: String(formData.get('vendorStatus') || 'Pending').trim(),
    riskScore: Number(formData.get('riskScore') || 0),
    documents: []
  };

  try {
    if (vendorId) {
      await ApiClient.updateVendor(vendorId, payload);
    } else {
      await ApiClient.createVendor(payload);
    }

    await loadVendors();
    resetFormToCreateMode();
  } catch (error) {
    window.VendorVerifyUI?.showAlert?.(error.message, "error");
  }
});

tableBody?.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const row = event.target.closest('tr');
  if (!row) return;
  const vendor = vendors.find((item) => String(item.id) === row.dataset.vendorId);
  if (!vendor) return;

  selectedVendorId = vendor.id;

  if (event.target.dataset.action === 'edit') {
    populateForm(vendor);
  }

  renderVendorTable();
  renderVendorProfile();
});

approveVendorBtn?.addEventListener('click', async () => {
  const vendor = getSelectedVendor();
  if (!vendor) return;
  window.VendorVerifyUI?.setButtonLoading?.(approveVendorBtn, true);
  try {
    await ApiClient.approveVendor(vendor.id);
    await loadVendors();
    window.VendorVerifyUI?.showAlert?.('Vendor approved.', 'success');
  } finally {
    window.VendorVerifyUI?.setButtonLoading?.(approveVendorBtn, false);
  }
});

rejectVendorBtn?.addEventListener('click', async () => {
  const vendor = getSelectedVendor();
  if (!vendor) return;
  window.VendorVerifyUI?.setButtonLoading?.(rejectVendorBtn, true);
  try {
    await ApiClient.rejectVendor(vendor.id);
    await loadVendors();
    window.VendorVerifyUI?.showAlert?.('Vendor rejected.', 'info');
  } finally {
    window.VendorVerifyUI?.setButtonLoading?.(rejectVendorBtn, false);
  }
});

deleteVendorBtn?.addEventListener('click', async () => {
  const vendor = getSelectedVendor();
  if (!vendor) return;
  window.VendorVerifyUI?.setButtonLoading?.(deleteVendorBtn, true);
  try {
    await ApiClient.deleteVendor(vendor.id);
    await loadVendors();
    resetFormToCreateMode();
    window.VendorVerifyUI?.showAlert?.('Vendor deleted.', 'info');
  } finally {
    window.VendorVerifyUI?.setButtonLoading?.(deleteVendorBtn, false);
  }
});

searchInput?.addEventListener('input', renderVendorTable);
resetVendorFormBtn?.addEventListener('click', resetFormToCreateMode);

loadVendors();


tableBody?.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLButtonElement)) return;
  if (event.target.id === 'emptyCreateVendorBtn') {
    document.getElementById('companyName')?.focus();
  }
});
