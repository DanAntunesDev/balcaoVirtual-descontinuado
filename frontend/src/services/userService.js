import httpClient from "@/services/api";

export async function getMe() {
  const { data } = await httpClient.get("/usuarios/v1/me/");
  return data;
}

export async function updateMe(patch) {
  const { data } = await httpClient.patch("/usuarios/v1/me/", patch);
  return data;
}

export async function changeMyPassword({ currentPassword, newPassword, confirmPassword }) {
  const payload = {
    current_password: currentPassword,
    new_password: newPassword,
    confirm_password: confirmPassword,
  };
  const { data } = await httpClient.post("/usuarios/v1/me/alterar-senha/", payload);
  return data;
}

export async function deleteMyAccount({ confirmText }) {
  const payload = { confirm_text: confirmText };
  const { data } = await httpClient.post("/usuarios/v1/me/excluir-conta/", payload);
  return data;
}