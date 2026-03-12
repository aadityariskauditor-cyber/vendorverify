(() => {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  onReady(() => {
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
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (error) {
        return {};
      }
    }

    function setStore(store) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      } catch (error) {
        debug?.warn?.('Unable to persist share result', error);
      }
    }

    function generateShareId() {
      const random = Math.random().toString(36).slice(2, 8);
      return `${Date.now()}${random}`;
    }

    function buildLink(id) {
      const baseUrl = window.location.origin || 'https://vendorverify.in';
      return `${baseUrl}/pages/risk-result.html?id=${encodeURIComponent(id)}`;
    }

    function updateShareTargets(link) {
      const encodedLink = encodeURIComponent(link);
      const message = encodeURIComponent('Vendor risk result from VendorVerify');

      whatsapp?.setAttribute('href', `https://wa.me/?text=${message}%20${encodedLink}`);
      linkedIn?.setAttribute('href', `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`);
      email?.setAttribute('href', `mailto:?subject=Vendor%20Risk%20Result&body=${message}%0A${encodedLink}`);
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
      const id = generateShareId();

      store[id] = {
        source,
        payload: payload && typeof payload === 'object' ? payload : { value: payload },
        createdAt: new Date().toISOString(),
      };

      setStore(store);

      const link = buildLink(id);
      renderLink(link);

      debug?.log?.('Share link created', { source, id, link });

      return link;
    }

    async function copyLatestLink() {
      if (!latestLink) return;

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(latestLink);
          if (output) output.innerHTML += `<br/><span>Copied to clipboard.</span>`;
          return;
        }
      } catch (error) {}

      if (output) {
        output.innerHTML += `<br/><span>Copy failed. Please copy manually.</span>`;
      }
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

    copyButton?.addEventListener('click', copyLatestLink);

    window.VendorVerifyShareRiskResult = {
      createShareLink,
    };
  });
})();