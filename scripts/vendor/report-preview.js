(() => {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  onReady(() => {
    const openButton = document.getElementById('openReportPreview');
    const closeButton = document.getElementById('closeReportPreview');
    const modal = document.getElementById('reportPreviewModal');
    const modalBody = document.getElementById('reportPreviewModalBody');
    const fieldsRoot = document.getElementById('reportPreviewFields');
    const debug = window.VendorVerifyDebug;

    function updateField(label, value) {
      if (!fieldsRoot) return;
      const rows = Array.from(fieldsRoot.querySelectorAll('div'));
      const row = rows.find((group) => group.querySelector('dt')?.textContent?.trim() === label);
      if (row) {
        const valueNode = row.querySelector('dd');
        if (valueNode) valueNode.textContent = value;
      }
    }

    function getFieldPairs() {
      if (!fieldsRoot) return [];
      return Array.from(fieldsRoot.querySelectorAll('div')).map((group) => ({
        key: group.querySelector('dt')?.textContent?.trim() || '',
        value: group.querySelector('dd')?.textContent?.trim() || '',
      }));
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

    window.addEventListener('vendorverify:gstRisk', (event) => {
      const details = event.detail || {};
      updateField('Vendor Name', details.companyName || 'N/A');
      updateField('Company Age', `${details.companyAge ?? 'N/A'} years`);
      updateField('GST Status', details.gstStatus || 'N/A');
      updateField('Compliance Risk', `${details.filingScore ?? 'N/A'}`);
      updateField('Litigation Signals', `${details.litigationSignals ?? 'N/A'}`);
      updateField('Vendor Risk Score', `${details.riskScore ?? 'N/A'} / 100`);
    });

    window.addEventListener('vendorverify:fraudProbability', (event) => {
      const details = event.detail || {};
      updateField('Operational Risk', details.riskLevel || details.level || 'N/A');
    });

    openButton?.addEventListener('click', openModal);
    closeButton?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    window.VendorVerifyReportPreview = {
      openModal,
      closeModal,
    };
  });
})();
