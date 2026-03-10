import { useEffect, useState, useCallback } from "react";
import { AuthContext } from "./authContext";
import { getToken, clearAuth } from "./tokenService";
import httpClient from "@/infrastructure/api/httpClient";
import { login as loginService, register as registerService } from "./authService";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return null;
      }

      const { data } = await httpClient.get("/usuarios/v1/me/");

      const normalized = {
        ...data,
        role: data?.role?.toLowerCase?.() ?? null,
      };

      setUser(normalized);
      return normalized;
    } catch {
      clearAuth();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handler = () => {
      fetchUser();
    };

    window.addEventListener("bv:auth:refresh", handler);
    return () => window.removeEventListener("bv:auth:refresh", handler);
  }, [fetchUser]);

  const login = async (credentials) => {
    setLoading(true);
    await loginService(credentials);
    await fetchUser();
  };

  const register = async (payload) => {
    setLoading(true);
    await registerService(payload);
    await fetchUser();
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}