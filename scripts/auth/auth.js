(function initializeVendorVerifyAuth(global) {
  const STORAGE_KEY = 'vv_auth_state';

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

    if (Object.values(ROLES).includes(role)) {
      return role;
    }

    return null;
  }

  function loadAuthState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (error) {
      return null;
    }
  }

  function saveAuthState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function login({ email, role, name }) {
    const normalizedRole = normalizeRole(role);

    if (!normalizedRole) {
      throw new Error('Invalid role selected.');
    }

    const state = {
      isAuthenticated: true,
      user: {
        email: String(email || '').trim().toLowerCase(),
        name: String(name || '').trim(),
        role: normalizedRole,
      },
      loggedInAt: new Date().toISOString(),
    };

    saveAuthState(state);
    return state;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getState() {
    const state = loadAuthState();

    if (!state || !state.isAuthenticated) {
      return {
        isAuthenticated: false,
        user: null,
        loggedInAt: null,
      };
    }

    return state;
  }

  function isAuthenticated() {
    return getState().isAuthenticated;
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

  function getHomeUrlForRole(role) {
    const path = getHomePathForRole(role);

    if (!path) {
      return null;
    }

    return new URL(path, window.location.origin).toString();
  }

  function redirectToRoleHome(role) {
    const targetUrl = getHomeUrlForRole(role);

    if (!targetUrl) {
      throw new Error('Unable to resolve home URL for role.');
    }

    window.location.href = targetUrl;
  }

  global.VendorVerifyAuth = {
    ROLES,
    login,
    logout,
    getState,
    getCurrentUser,
    getCurrentRole,
    isAuthenticated,
    getHomePathForRole,
    redirectToRoleHome,
  };
}(window));
