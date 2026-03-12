(() => {
  const DEBUG_MODE = true;

  const panelState = {
    currentPage: window.location.pathname,
    lastApiCall: 'None',
    imageStatus: 'Waiting',
    scriptStatus: 'Waiting',
  };

  const pad = (value) => String(value).padStart(2, '0');
  const timestamp = () => {
    const now = new Date();
    return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const normalizePath = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    return path.startsWith('/') ? path : `/${path}`;
  };

  let panel = null;
  let panelReady = false;

  const updatePanel = () => {
    if (!DEBUG_MODE || !panel || !panelReady) return;

    const page = panel.querySelector('[data-debug-page]');
    const api = panel.querySelector('[data-debug-api]');
    const image = panel.querySelector('[data-debug-image]');
    const script = panel.querySelector('[data-debug-script]');

    if (page) page.textContent = panelState.currentPage;
    if (api) api.textContent = panelState.lastApiCall;
    if (image) image.textContent = panelState.imageStatus;
    if (script) script.textContent = panelState.scriptStatus;
  };

  const baseLog = (level, message, data) => {
    if (!DEBUG_MODE) return;
    const prefix = level === 'error'
      ? `[VendorVerify ERROR | ${timestamp()}]`
      : `[VendorVerify Debug | ${timestamp()}]`;

    if (typeof data !== 'undefined') {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  };

  const debug = {
    isEnabled: () => DEBUG_MODE,
    log: (message, data) => baseLog('log', message, data),
    warn: (message, data) => baseLog('warn', message, data),
    error: (message, data) => baseLog('error', message, data),
    imageCheck: (path) => new Promise((resolve) => {
      if (!DEBUG_MODE) {
        resolve(true);
        return;
      }

      const normalizedPath = normalizePath(path);
      const image = new Image();

      image.onload = () => {
        panelState.imageStatus = `OK (${normalizedPath})`;
        updatePanel();
        debug.log(`Image loaded: ${normalizedPath}`);
        resolve(true);
      };

      image.onerror = () => {
        panelState.imageStatus = `Failed (${normalizedPath})`;
        updatePanel();
        debug.error('Image failed to load. Check file path.', { path: normalizedPath });
        resolve(false);
      };

      image.src = normalizedPath;
    }),
    routeCheck: () => {
      if (!DEBUG_MODE) return;
      const route = window.location.pathname;
      panelState.currentPage = route;
      updatePanel();
      debug.log(`Page Loaded → ${route}`);
    },
    scriptCheck: (scriptPath) => {
      if (!DEBUG_MODE) return true;

      const normalizedPath = normalizePath(scriptPath);
      const found = Array.from(document.querySelectorAll('script[src]')).some((script) => {
        try {
          return new URL(script.src, window.location.origin).pathname.endsWith(normalizedPath);
        } catch (error) {
          return script.getAttribute('src')?.endsWith(scriptPath);
        }
      });

      if (found) {
        panelState.scriptStatus = `OK (${scriptPath})`;
        debug.log(`Script loaded: ${scriptPath}`);
      } else {
        panelState.scriptStatus = `Missing (${scriptPath})`;
        debug.warn(`Script failed to load: ${scriptPath}`);
      }

      updatePanel();
      return found;
    },
    apiCheck: async (endpoint, options = {}) => {
      if (!DEBUG_MODE) {
        return fetch(endpoint, options);
      }

      panelState.lastApiCall = endpoint;
      updatePanel();
      debug.log(`API request started → ${endpoint}`);

      try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
          debug.error(`API request failed: ${endpoint}`, { status: response.status });
        } else {
          debug.log(`API response received → ${endpoint}`, { status: response.status });
        }
        return response;
      } catch (error) {
        debug.error(`API request failed: ${endpoint}`, error);
        throw error;
      }
    },
    updatePanelState: (key, value) => {
      if (!DEBUG_MODE) return;
      panelState[key] = value;
      updatePanel();
    },
    getPanelState: () => ({ ...panelState }),
  };

  const createPanel = () => {
    if (!DEBUG_MODE || panelReady || !document.body) return;

    panel = document.createElement('aside');
    panel.id = 'vendorverify-debug-panel';
    panel.innerHTML = `
      <div style="font-weight:700;margin-bottom:8px;">VendorVerify Debug Panel</div>
      <div><strong>Current page:</strong> <span data-debug-page>-</span></div>
      <div><strong>Last API call:</strong> <span data-debug-api>-</span></div>
      <div><strong>Image status:</strong> <span data-debug-image>-</span></div>
      <div><strong>Script status:</strong> <span data-debug-script>-</span></div>
    `;

    panel.style.cssText = [
      'position:fixed',
      'right:16px',
      'bottom:16px',
      'z-index:2147483647',
      'max-width:320px',
      'padding:12px',
      'border-radius:10px',
      'background:#111827',
      'color:#f9fafb',
      'font-family:Arial,sans-serif',
      'font-size:12px',
      'line-height:1.4',
      'box-shadow:0 8px 20px rgba(0,0,0,0.3)',
    ].join(';');

    document.body.appendChild(panel);
    panelReady = true;
    updatePanel();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPanel);
  } else {
    createPanel();
  }

  window.VendorVerifyDebug = debug;
})();
