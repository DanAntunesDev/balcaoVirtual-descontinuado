import httpClient from "@/services/api";
import { API_CONFIG } from "@/infrastructure/api/apiConfig";
import { cartoriosMock } from "@/mocks/cartorios.mock";

// Normaliza strings (remove acentos)
function normalizeStr(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Ex: "Registro Civil" -> "registro_civil"
function toTipoKey(nome = "") {
  return normalizeStr(nome)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function normalizeStatus(status) {
  const s = normalizeStr(status || "").toLowerCase();
  if (s === "aberto" || s === "ativo") return "ABERTO";
  if (s === "fechado" || s === "inativo" || s === "suspenso" || s === "arquivado") return "FECHADO";
  return status ? String(status).toUpperCase() : "ABERTO";
}

// Adapta o payload do backend público (CartorioPublicoSerializer) para o shape da UI
function mapPublicApiToUi(item) {
  const tipoNomeRaw = item?.tipo?.nome ?? null;

  return {
    id: item?.id ?? null,
    nome: item?.nome ?? "",
    cidade: item?.cidade ?? null,
    uf: item?.estado ?? null, // backend usa "estado" (UF)
    endereco: item?.endereco ?? null,
    telefone: item?.telefone ?? null,
    horario: item?.horario ?? null,

    // UI hoje trabalha com "ABERTO/FECHADO" (pill)
    status: normalizeStatus(item?.status),

    // Mantém objeto compatível com mock: {id, nome: <tipoKey>}
    tipo: item?.tipo
      ? { id: item.tipo.id ?? null, nome: toTipoKey(tipoNomeRaw || "") }
      : null,

    // extras úteis (não obrigatórios)
    tipo_label: tipoNomeRaw || null,
    icon: null, // icon é resolvido no frontend por tipo
  };
}

/**
 * Lista de cartórios para o público.
 * - Usa API real quando possível
 * - Usa fallback mock em erro (ou quando VITE_API_MODE="mock")
 */
export async function listPublicCartorios() {
  // Força mock quando ambiente define
  if ((API_CONFIG.MODE || "real").toLowerCase() === "mock") {
    return cartoriosMock;
  }

  try {
    const { data } = await httpClient.get("/v1/public/cartorios/");
    if (!Array.isArray(data)) return cartoriosMock;

    const mapped = data.map(mapPublicApiToUi);

    // Se API vier vazia, mantemos o fallback visual
    return mapped.length ? mapped : cartoriosMock;
  } catch (e) {
    return cartoriosMock;
  }
}

export async function getCartorioById(cartorioId) {
  if (!cartorioId) throw new Error("cartorioId obrigatório");

  if ((API_CONFIG.MODE || "real").toLowerCase() === "mock") {
    const found = cartoriosMock.find((c) => String(c.id) === String(cartorioId));
    return found || null;
  }

  const { data } = await httpClient.get(`/v1/cartorios/${cartorioId}/`);
  return data;
}