async function loadVendorDashboard() {
  const companyNameLabel = document.getElementById('vendorCompany');
  const openRequestsCount = document.getElementById('openRequestsCount');
  const documentCount = document.getElementById('documentCount');
  const latestStatus = document.getElementById('latestStatus');
  const vendorActivityTable = document.getElementById('vendorActivityTable');
  const statusLabel = document.getElementById('statusLabel');
  const statusRequestId = document.getElementById('statusRequestId');
  const statusUpdatedAt = document.getElementById('statusUpdatedAt');

  try {
    const currentUser = window.VendorVerifyAuth?.getCurrentUser?.();
    const vendors = await ApiClient.getVendors();
    const vendorRequests = vendors.filter((item) => !currentUser?.email || item.email === currentUser.email);

    if (companyNameLabel && vendorRequests.length) {
      companyNameLabel.textContent = vendorRequests[0].companyName || 'Your Company';
    }

    if (openRequestsCount) {
      openRequestsCount.textContent = `${vendorRequests.filter((request) => request.status !== 'Approved').length}`;
    }

    if (documentCount) {
      documentCount.textContent = `${vendorRequests.reduce((total, request) => total + (request.documents?.length || 0), 0)}`;
    }

    if (latestStatus) {
      latestStatus.textContent = vendorRequests[0]?.status || 'Not Submitted';
    }

    if (vendorActivityTable) {
      const tableBody = vendorActivityTable.querySelector('tbody');
      tableBody.innerHTML = vendorRequests.length
        ? vendorRequests.slice(0, 6).map((request) => `
          <tr>
            <td>${request.id}</td>
            <td>${new Date(request.createdAt).toLocaleDateString()}</td>
            <td>${request.documents?.length || 0} file(s)</td>
            <td><span class="status-badge ${request.status === 'Approved' ? 'approved' : request.status === 'Rejected' ? 'rejected' : 'pending'}">${request.status}</span></td>
          </tr>
        `).join('')
        : '<tr><td colspan="4">No requests submitted yet.</td></tr>';
    }

    const latestRequest = vendorRequests[0];
    if (statusLabel && statusRequestId && statusUpdatedAt) {
      statusLabel.textContent = latestRequest?.status || 'Not Submitted';
      statusRequestId.textContent = latestRequest?.id || '-';
      statusUpdatedAt.textContent = latestRequest ? new Date(latestRequest.updatedAt).toLocaleString() : '-';
    }
  } catch (error) {
    // no-op fallback for static pages
  }
}

loadVendorDashboard();
