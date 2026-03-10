import httpClient from "@/services/api";

const onlyDigits = (v = "") => String(v || "").replace(/\D/g, "");
const normCode = (v = "") => String(v || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export async function requestPasswordReset({ cpf, email }) {
  const payload = {
    cpf: onlyDigits(cpf),
    email: String(email || "").trim().toLowerCase(),
  };
  const { data } = await httpClient.post("/usuarios/v1/password/request/", payload);
  return data;
}

export async function validatePasswordResetCode({ cpf, email, code }) {
  const payload = {
    cpf: onlyDigits(cpf),
    email: String(email || "").trim().toLowerCase(),
    code: normCode(code),
  };
  const { data } = await httpClient.post("/usuarios/v1/password/code-login/", payload);
  return data;
}

export async function resetPasswordWithCode({ cpf, email, code, password, password_confirm }) {
  const payload = {
    cpf: onlyDigits(cpf),
    email: String(email || "").trim().toLowerCase(),
    code: normCode(code),
    password,
    password_confirm,
  };
  const { data } = await httpClient.post("/usuarios/v1/password/reset/", payload);
  return data;
}