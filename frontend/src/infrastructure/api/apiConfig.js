export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.VITE_API_MODE || "real", // real | mock
  TIMEOUT: 10000,
};
