const ACCESS_KEY = "auth_token";
const REFRESH_KEY = "auth_refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// Backwards compatible (interceptors usam isso)
export const getToken = () => getAccessToken();

export const setTokens = (access, refresh) => {
  if (access) localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};