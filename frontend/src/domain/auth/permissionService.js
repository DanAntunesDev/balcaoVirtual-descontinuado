export const hasRole = (user, allowedRoles = []) => {
  if (!user) return false;
  return allowedRoles.includes(user.role);
};

export const canAccessRoute = (user, routeRoles) => {
  if (!routeRoles || routeRoles.length === 0) return true;
  return hasRole(user, routeRoles);
};
