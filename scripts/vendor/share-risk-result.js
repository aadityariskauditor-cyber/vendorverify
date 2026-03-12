(() => {
  const output = document.getElementById('shareRiskLinkOutput');
  const copyButton = document.getElementById('copyRiskLink');
  const whatsapp = document.getElementById('shareWhatsApp');
  const linkedIn = document.getElementById('shareLinkedIn');
  const email = document.getElementById('shareEmail');
  const debug = window.VendorVerifyDebug;

  const STORAGE_KEY = 'vendorverifyRiskResults';
  let latestLink = '';

  function getStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function setStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function buildLink(id) {
    return `${window.location.origin}/pages/risk-result.html?id=${encodeURIComponent(id)}`;
  }

  function updateShareTargets(link) {
    const encoded = encodeURIComponent(link);
    const text = encodeURIComponent('Vendor risk result from VendorVerify');
    whatsapp?.setAttribute('href', `https://wa.me/?text=${text}%20${encoded}`);
    linkedIn?.setAttribute('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`);
    email?.setAttribute('href', `mailto:?subject=Vendor%20Risk%20Result&body=${text}%0A${encoded}`);
  }

  function renderLink(link) {
    latestLink = link;
    if (output) {
      output.innerHTML = `<strong>Shareable link:</strong> <a href="${link}" target="_blank" rel="noopener">${link}</a>`;
    }
    updateShareTargets(link);
  }

  function createShareLink(source, payload) {
    const store = getStore();
    const id = `${Date.now()}`;
    store[id] = {
      source,
      payload,
      createdAt: new Date().toISOString(),
    };
    setStore(store);

    const link = buildLink(id);
    renderLink(link);
    debug?.log?.('Share link created', { source, id });
  }

  window.addEventListener('vendorverify:riskCalculator', (event) => {
    createShareLink('risk-calculator', event.detail || {});
  });

  window.addEventListener('vendorverify:gstRisk', (event) => {
    createShareLink('gst-risk-check', event.detail || {});
  });

  window.addEventListener('vendorverify:fraudProbability', (event) => {
    createShareLink('fraud-probability', event.detail || {});
  });

  copyButton?.addEventListener('click', async () => {
    if (!latestLink) return;
    try {
      await navigator.clipboard.writeText(latestLink);
      if (output) output.innerHTML = `${output.innerHTML}<br/><span>Copied to clipboard.</span>`;
    } catch (error) {
      if (output) output.innerHTML = `${output.innerHTML}<br/><span>Copy failed. Please copy manually.</span>`;
    }
  });

  window.VendorVerifyShareRiskResult = {
    createShareLink,
  };
})();
