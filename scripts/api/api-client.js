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

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      throw new Error(payload?.message || `Request failed with status ${response.status}`);
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
  };
})();
