function getVendorStatusClass(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('approved')) return 'approved';
  if (normalized.includes('reject')) return 'rejected';
  return 'pending';
}

async function loadVendorDashboard() {
  const companyNameLabel = document.getElementById('vendorCompany');
  const openRequestsCount = document.getElementById('openRequestsCount');
  const documentCount = document.getElementById('documentCount');
  const latestStatus = document.getElementById('latestStatus');
  const vendorActivityTable = document.getElementById('vendorActivityTable');
  const statusLabel = document.getElementById('statusLabel');
  const statusRequestId = document.getElementById('statusRequestId');
  const statusUpdatedAt = document.getElementById('statusUpdatedAt');
  const auditPaymentStatus = document.getElementById('auditPaymentStatus');

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
            <td><span class="status-badge ${getVendorStatusClass(request.status)}">${request.status}</span></td>
          </tr>
        `).join('')
        : '<tr><td colspan="4"><div class="empty-state"><p>No vendors yet. Start by adding your first vendor.</p><a class="btn btn-outline" href="submit-documents.html">Submit your first request</a></div></td></tr>';
    }

    const latestRequest = vendorRequests[0];

    if (auditPaymentStatus) {
      const normalizedStatus = String(latestRequest?.status || '').toLowerCase();
      const isAuditSubmitted = ['approved', 'completed', 'submitted'].some((keyword) => normalizedStatus.includes(keyword));
      auditPaymentStatus.textContent = isAuditSubmitted ? 'Audit Submitted' : 'Waiting for Payment Confirmation';
    }
    if (statusLabel && statusRequestId && statusUpdatedAt) {
      statusLabel.textContent = latestRequest?.status || 'Not Submitted';
      statusRequestId.textContent = latestRequest?.id || '-';
      statusUpdatedAt.textContent = latestRequest ? new Date(latestRequest.updatedAt).toLocaleString() : '-';
      const statusCard = statusLabel.closest('.vendor-status-card');
      if (statusCard) {
        statusCard.classList.remove('approved', 'pending', 'rejected');
        statusCard.classList.add(getVendorStatusClass(latestRequest?.status));
      }
    }
  } catch (error) {
    // no-op fallback for static pages
  }
}

loadVendorDashboard();

// Future integration point
// Razorpay payment gateway
// PayPal payment gateway
