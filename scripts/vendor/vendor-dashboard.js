const vendorRequests = JSON.parse(localStorage.getItem('vendorRequests') || '[]');

const companyNameLabel = document.getElementById('vendorCompany');
const openRequestsCount = document.getElementById('openRequestsCount');
const documentCount = document.getElementById('documentCount');
const latestStatus = document.getElementById('latestStatus');
const vendorActivityTable = document.getElementById('vendorActivityTable');

if (companyNameLabel && vendorRequests.length) {
  companyNameLabel.textContent = vendorRequests[0].companyName || 'Your Company';
}

if (openRequestsCount) {
  const openCount = vendorRequests.filter((request) => request.status !== 'Approved').length;
  openRequestsCount.textContent = `${openCount}`;
}

if (documentCount) {
  const totalDocuments = vendorRequests.reduce((total, request) => total + (request.documents?.length || 0), 0);
  documentCount.textContent = `${totalDocuments}`;
}

if (latestStatus) {
  latestStatus.textContent = vendorRequests[0]?.status || 'Not Submitted';
}

if (vendorActivityTable) {
  const tableBody = vendorActivityTable.querySelector('tbody');

  if (tableBody) {
    if (!vendorRequests.length) {
      tableBody.innerHTML = '<tr><td colspan="4">No requests submitted yet.</td></tr>';
    } else {
      tableBody.innerHTML = vendorRequests
        .slice(0, 6)
        .map((request) => {
          const submittedDate = new Date(request.submittedOn).toLocaleDateString();
          const documents = request.documents?.length || 0;
          const statusClass = request.status.includes('Approved')
            ? 'approved'
            : request.status.includes('Rejected')
              ? 'rejected'
              : 'pending';

          return `
            <tr>
              <td>${request.id}</td>
              <td>${submittedDate}</td>
              <td>${documents} file(s)</td>
              <td><span class="status-badge ${statusClass}">${request.status}</span></td>
            </tr>
          `;
        })
        .join('');
    }
  }
}

const statusLabel = document.getElementById('statusLabel');
const statusRequestId = document.getElementById('statusRequestId');
const statusUpdatedAt = document.getElementById('statusUpdatedAt');
const currentRequestStatus = document.getElementById('currentRequestStatus');
const statusChecklist = document.getElementById('statusChecklist');

if (statusLabel && statusRequestId && statusUpdatedAt && currentRequestStatus && statusChecklist) {
  const latestRequest = vendorRequests[0];

  if (!latestRequest) {
    statusLabel.textContent = 'Not Submitted';
    statusRequestId.textContent = '-';
    statusUpdatedAt.textContent = '-';
  } else {
    statusLabel.textContent = latestRequest.status;
    statusRequestId.textContent = latestRequest.id;
    statusUpdatedAt.textContent = new Date(latestRequest.submittedOn).toLocaleString();

    const statusCard = currentRequestStatus.querySelector('.vendor-status-card');
    if (statusCard) {
      statusCard.classList.remove('approved', 'rejected', 'pending');

      if (latestRequest.status.includes('Approved')) {
        statusCard.classList.add('approved');
      } else if (latestRequest.status.includes('Rejected')) {
        statusCard.classList.add('rejected');
      } else {
        statusCard.classList.add('pending');
      }
    }

    const checklistStates = latestRequest.documents?.length
      ? ['Complete', 'Complete', 'In Review', latestRequest.status.includes('Approved') ? 'Complete' : 'Pending']
      : ['Complete', 'Pending', 'Pending', 'Pending'];

    statusChecklist.innerHTML = [
      'Request Submitted',
      'Documents Uploaded',
      'Compliance Review',
      'Final Verification'
    ]
      .map((item, index) => {
        const state = checklistStates[index];
        const stateClass = state === 'Complete' ? 'success' : state === 'In Review' ? 'warning' : 'info';
        return `<li><span>${item}</span><span class="status-pill ${stateClass}">${state}</span></li>`;
      })
      .join('');
  }
}
