(function initializeVendorVerifyPermissions(global) {
  const rolePermissions = Object.freeze({
    admin: Object.freeze([
      'manage_users',
      'approve_vendors',
      'view_analytics',
    ]),
    reviewer: Object.freeze([
      'review_vendor_documents',
      'add_notes',
    ]),
    vendor: Object.freeze([
      'submit_documents',
      'track_status',
    ]),
  });

  function normalizeRole(value) {
    return String(value || '').trim().toLowerCase();
  }

  function getPermissionsForRole(role) {
    const normalizedRole = normalizeRole(role);
    return rolePermissions[normalizedRole] || [];
  }

  function hasPermission(role, permission) {
    const permissions = getPermissionsForRole(role);
    return permissions.includes(permission);
  }

  function getCurrentRole() {
    if (!global.VendorVerifyAuth || typeof global.VendorVerifyAuth.getCurrentRole !== 'function') {
      return null;
    }

    return global.VendorVerifyAuth.getCurrentRole();
  }

  function currentUserHas(permission) {
    const role = getCurrentRole();

    if (!role) {
      return false;
    }

    return hasPermission(role, permission);
  }

  function guard(permission, onDenied) {
    if (currentUserHas(permission)) {
      return true;
    }

    if (typeof onDenied === 'function') {
      onDenied();
    }

    return false;
  }

  global.VendorVerifyPermissions = {
    ALL: rolePermissions,
    getPermissionsForRole,
    hasPermission,
    currentUserHas,
    guard,
  };
}(window));
