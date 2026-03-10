import httpClient from "@/infrastructure/api/httpClient";
import { setTokens, clearAuth } from "./tokenService";

const onlyDigits = (v = "") => String(v).replace(/\D/g, "");

function pickTokens(data) {
  const access = data?.access || data?.token || null;
  const refresh = data?.refresh || null;
  return { access, refresh };
}

function parseApiError(err) {
  const data = err?.response?.data;

  if (!data) return null;

  // DRF padrão
  if (typeof data === "string") return data;

  // Quando vem {"detail": "..."}
  if (typeof data?.detail === "string") return data.detail;

  // Quando vem {"non_field_errors": ["..."]}
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length) {
    return String(data.non_field_errors[0]);
  }

  // Quando vem {"cpf": ["..."]} ou {"password": ["..."]}
  const keys = Object.keys(data || {});
  for (const k of keys) {
    const v = data[k];
    if (Array.isArray(v) && v.length) return String(v[0]);
    if (typeof v === "string") return v;
  }

  return null;
}

export async function login({ cpf, password }) {
  const payload = {
    cpf: onlyDigits(cpf),
    password,
  };

  try {
    const res = await httpClient.post("/usuarios/v1/login/", payload);
    const { access, refresh } = pickTokens(res?.data);

    if (!access) {
      throw new Error("Login sem token na resposta (access/token).");
    }

    setTokens(access, refresh);
    return res.data;
  } catch (err) {
    const apiMsg = parseApiError(err);
    throw new Error(apiMsg || "Falha ao fazer login.");
  }
}

export async function register({ nome, cpf, email, password }) {
  const payload = {
    nome: String(nome || "").trim(),
    cpf: onlyDigits(cpf),
    email: String(email || "").trim().toLowerCase(),
    password,
  };

  try {
    const res = await httpClient.post("/usuarios/v1/register/", payload);

    const { access, refresh } = pickTokens(res?.data);
    if (access) setTokens(access, refresh);

    return res.data;
  } catch (err) {
    const apiMsg = parseApiError(err);
    throw new Error(apiMsg || "Falha ao criar conta.");
  }
}

export function logout() {
  clearAuth();
}