(() => {
  const openButton = document.getElementById('openReportPreview');
  const closeButton = document.getElementById('closeReportPreview');
  const modal = document.getElementById('reportPreviewModal');
  const modalBody = document.getElementById('reportPreviewModalBody');
  const fieldsRoot = document.getElementById('reportPreviewFields');
  const debug = window.VendorVerifyDebug;

  function getFieldPairs() {
    if (!fieldsRoot) return [];
    return Array.from(fieldsRoot.querySelectorAll('div')).map((group) => {
      const key = group.querySelector('dt')?.textContent?.trim() || '';
      const value = group.querySelector('dd')?.textContent?.trim() || '';
      return { key, value };
    });
  }

  function renderModalContent() {
    if (!modalBody) return;
    const rows = getFieldPairs();
    modalBody.innerHTML = `
      <dl class="report-preview-grid">
        ${rows.map((row) => `<div><dt>${row.key}</dt><dd>${row.value}</dd></div>`).join('')}
      </dl>
    `;
    debug?.log?.('Report preview generated', rows);
  }

  function openModal() {
    if (!modal) return;
    renderModalContent();
    modal.classList.remove('is-hidden');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('is-hidden');
    modal.setAttribute('aria-hidden', 'true');
  }

  openButton?.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  window.VendorVerifyReportPreview = {
    openModal,
    closeModal,
  };
})();
