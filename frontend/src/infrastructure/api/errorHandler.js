export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.message || "Erro na requisição.";
  }
  if (error.request) {
    return "Servidor indisponível.";
  }
  return "Erro inesperado.";
};
