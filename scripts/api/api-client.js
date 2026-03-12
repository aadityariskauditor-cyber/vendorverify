const ApiClient = (() => {
  const API_BASE_URL = window.VENDORVERIFY_API_BASE_URL || 'http://localhost:5000';
  const AUTH_STORAGE_KEY = 'vv_auth_state';

  const getAuthState = () => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    } catch (error) {
      return null;
    }
  };

  const getToken = () => getAuthState()?.token || null;

  async function request(path, { method = 'GET', body, requiresAuth = false } = {}) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();

      if (!token) {
        throw new Error('You must be logged in to perform this action.');
      }

      headers.Authorization = `Bearer ${token}`;
    }

    const debug = window.VendorVerifyDebug;
    const endpoint = `${API_BASE_URL}${path}`;

    if (debug?.isEnabled?.()) {
      debug.log(`API request started → ${path}`);
      debug.updatePanelState('lastApiCall', path);
    }

    const response = await fetch(endpoint, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      if (debug?.isEnabled?.()) {
        debug.error(`API request failed: ${path}`, { status: response.status });
      }
      throw new Error(payload?.message || `Request failed with status ${response.status}`);
    }

    if (debug?.isEnabled?.()) {
      debug.log(`API response received → ${path}`, { status: response.status });
    }

    return payload;
  }

  return {
    register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
    getVendors: () => request('/api/vendors', { requiresAuth: true }),
    createVendor: (payload) => request('/api/vendors', { method: 'POST', body: payload, requiresAuth: true }),
    updateVendor: (id, payload) => request(`/api/vendors/${id}`, { method: 'PUT', body: payload, requiresAuth: true }),
    deleteVendor: (id) => request(`/api/vendors/${id}`, { method: 'DELETE', requiresAuth: true }),
    approveVendor: (id) => request(`/api/vendors/${id}/approve`, { method: 'POST', requiresAuth: true }),
    rejectVendor: (id) => request(`/api/vendors/${id}/reject`, { method: 'POST', requiresAuth: true }),
    getTestimonials: (status) => request(`/api/marketing/testimonials${status ? `?status=${status}` : ''}`),
    approveTestimonial: (id) => request(`/api/marketing/testimonials/${id}/approve`, { method: 'PATCH' }),
    deleteTestimonial: (id) => request(`/api/marketing/testimonials/${id}`, { method: 'DELETE' }),
    submitLeadCapture: (payload) => request('/api/marketing/lead-capture', { method: 'POST', body: payload }),
    gstRiskCheck: (payload) => request('/api/gst-risk-check', { method: 'POST', body: payload }),
    submitContact: (payload) => request('/api/contact', { method: 'POST', body: payload }),
  };
})();
