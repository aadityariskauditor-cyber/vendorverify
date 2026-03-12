(function initializeVendorVerifyAuth(global) {
  const STORAGE_KEY = 'vv_auth_state';
  const VENDOR_SESSION_KEY = 'vendorverify_session';

  const ROLES = Object.freeze({
    ADMIN: 'admin',
    REVIEWER: 'reviewer',
    VENDOR: 'vendor',
  });

  const HOME_BY_ROLE = Object.freeze({
    [ROLES.ADMIN]: '/pages/admin/dashboard.html',
    [ROLES.REVIEWER]: '/pages/admin/verification-requests.html',
    [ROLES.VENDOR]: '/pages/vendor/dashboard.html',
  });

  function normalizeRole(value) {
    const role = String(value || '').trim().toLowerCase();
    return Object.values(ROLES).includes(role) ? role : null;
  }

  function saveAuthState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(VENDOR_SESSION_KEY, 'active');
  }

  function loadAuthState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function loginState({ token, user }) {
    const state = {
      isAuthenticated: true,
      token,
      user,
      loggedInAt: new Date().toISOString(),
    };

    saveAuthState(state);
    return state;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VENDOR_SESSION_KEY);
  }

  function getState() {
    return loadAuthState() || { isAuthenticated: false, user: null, token: null };
  }

  function getCurrentUser() {
    return getState().user;
  }

  function getCurrentRole() {
    return getCurrentUser()?.role || null;
  }

  function getHomePathForRole(role) {
    const normalizedRole = normalizeRole(role);
    return normalizedRole ? HOME_BY_ROLE[normalizedRole] : null;
  }

  function redirectToRoleHome(role) {
    const homePath = getHomePathForRole(role);

    if (homePath) {
      window.location.href = new URL(homePath, window.location.origin).toString();
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.querySelector('#email')?.value;
    const password = form.querySelector('#password')?.value;

    try {
      const result = await ApiClient.login({ email, password });
      loginState(result);
      redirectToRoleHome(result.user.role);
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form.querySelector('#name')?.value;
    const email = form.querySelector('#email')?.value;
    const password = form.querySelector('#password')?.value;
    const role = form.querySelector('#role')?.value || ROLES.VENDOR;

    try {
      const result = await ApiClient.register({ name, email, password, role });
      loginState(result);
      redirectToRoleHome(result.user.role);
    } catch (error) {
      alert(error.message);
    }
  }

  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('signupForm')?.addEventListener('submit', handleSignupSubmit);

  global.VendorVerifyAuth = {
    ROLES,
    login: loginState,
    logout,
    getState,
    getCurrentUser,
    getCurrentRole,
    getHomePathForRole,
    redirectToRoleHome,
  };
}(window));
