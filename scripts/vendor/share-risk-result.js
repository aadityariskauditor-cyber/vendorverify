(() => {
  const output = document.getElementById('shareRiskLinkOutput');
  const copyButton = document.getElementById('copyRiskLink');
  const whatsapp = document.getElementById('shareWhatsApp');
  const linkedIn = document.getElementById('shareLinkedIn');
  const email = document.getElementById('shareEmail');
  const debug = window.VendorVerifyDebug;

  const STORAGE_KEY = 'vendorverifyRiskResults';
  const SNAPSHOT_PARAM = 'snapshot';
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

  function encodeSnapshot(data) {
    try {
      const json = JSON.stringify(data || {});
      const utf8Bytes = new TextEncoder().encode(json);
      let binary = '';
      utf8Bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
    } catch (error) {
      debug?.warn?.('Could not encode snapshot payload', error);
      return '';
    }
  }

  function buildLink(id, entry) {
    const snapshot = encodeSnapshot(entry);
    const url = new URL('/pages/risk-result.html', window.location.origin);
    if (!snapshot) return '';

    // Keep id for backwards compatibility/debug tracing, but make the payload
    // self-contained in the snapshot so links work across devices and browsers.
    url.searchParams.set('id', id);
    url.searchParams.set(SNAPSHOT_PARAM, snapshot);
    return url.toString();
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

  function createId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createShareLink(source, payload) {
    const store = getStore();
    const id = createId();
    const entry = {
      source,
      payload,
      createdAt: new Date().toISOString(),
    };

    const link = buildLink(id, entry);

    try {
      store[id] = entry;
      setStore(store);
    } catch (error) {
      debug?.warn?.('Could not persist share entry in localStorage', error);
    }

    if (!link) {
      if (output) {
        output.innerHTML = '<strong>Shareable link unavailable.</strong> Please rerun the assessment.';
      }
      debug?.warn?.('Share link could not be created because snapshot encoding failed');
      return;
    }

    renderLink(link);
    debug?.log?.('Share link created', { source, id, snapshot: true });
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
