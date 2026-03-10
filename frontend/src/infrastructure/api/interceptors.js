import { getToken, clearAuth } from "@/domain/auth/tokenService";

export const attachInterceptors = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};
