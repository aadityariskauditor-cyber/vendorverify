const testimonialsTableBody = document.querySelector('#testimonialsAdminTable tbody');

function renderRows(testimonials) {
  if (!testimonialsTableBody) {
    return;
  }

  testimonialsTableBody.innerHTML = testimonials.map((item) => `
    <tr data-id="${item.id}">
      <td>${item.name}</td>
      <td>${item.designation}</td>
      <td>${item.company_type}</td>
      <td>${item.testimonial_text}</td>
      <td><span class="status-badge ${item.status === 'approved' ? 'approved' : 'pending'}">${item.status}</span></td>
      <td>
        <button class="btn btn-secondary" type="button" data-action="approve">Approve</button>
        <button class="btn btn-outline" type="button" data-action="delete">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function loadAdminTestimonials() {
  try {
    const response = await ApiClient.getTestimonials();
    renderRows(response?.testimonials || []);
  } catch (error) {
    window.VendorVerifyUI?.showAlert(error.message || 'Unable to load testimonials.', 'danger');
  }
}

async function handleTableClick(event) {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const row = target.closest('tr');
  const id = Number(row?.dataset.id);
  const action = target.dataset.action;

  if (!id || !action) {
    return;
  }

  try {
    if (action === 'approve') {
      await ApiClient.approveTestimonial(id);
      window.VendorVerifyUI?.showAlert('Testimonial approved.', 'success');
    }

    if (action === 'delete') {
      await ApiClient.deleteTestimonial(id);
      window.VendorVerifyUI?.showAlert('Testimonial deleted.', 'success');
    }

    await loadAdminTestimonials();
  } catch (error) {
    window.VendorVerifyUI?.showAlert(error.message || 'Action failed.', 'danger');
  }
}

if (testimonialsTableBody) {
  testimonialsTableBody.addEventListener('click', handleTableClick);
  loadAdminTestimonials();
}
