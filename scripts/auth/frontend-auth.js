(function initializeFrontendAuth(global) {
  const TOKEN_STORAGE_KEY = 'vv_auth_token';
  const USER_STORAGE_KEY = 'vv_auth_user';
  const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/auth';

  function getApiBaseUrl() {
    return global.VENDORVERIFY_API_BASE_URL || DEFAULT_API_BASE_URL;
  }

  async function request(endpoint, payload) {
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Authentication request failed.');
    }

    return data;
  }

  function persistSession({ token, user }) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    if (global.VendorVerifyAuth && typeof global.VendorVerifyAuth.login === 'function') {
      global.VendorVerifyAuth.login({
        email: user.email,
        name: user.name,
        role: user.role,
      });
    }
  }

  async function register(payload) {
    const data = await request('/register', payload);
    persistSession(data);
    return data;
  }

  async function login(payload) {
    const data = await request('/login', payload);
    persistSession(data);
    return data;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }

  global.VendorVerifyFrontendAuth = {
    login,
    register,
    getToken,
  };
}(window));
