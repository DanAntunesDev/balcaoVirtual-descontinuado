// frontend/src/services/documentoService.js
import httpClient from "@/services/api";
import { API_CONFIG } from "@/infrastructure/api/apiConfig";
import { documentoCategoriasMock } from "@/mocks/documentoCategorias.mock";

const LS_DOCS_KEY = "bv_mock_docs_by_agendamento";

function readDocsLocal() {
  try {
    const raw = localStorage.getItem(LS_DOCS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDocsLocal(obj) {
  try {
    localStorage.setItem(LS_DOCS_KEY, JSON.stringify(obj));
  } catch {
    // noop
  }
}

export async function listDocumentoCategorias() {
  if ((API_CONFIG.MODE || "real").toLowerCase() === "mock") return documentoCategoriasMock;

  try {
    const { data } = await httpClient.get("/v1/documentos/categorias/");
    return Array.isArray(data) ? data : documentoCategoriasMock;
  } catch {
    return documentoCategoriasMock;
  }
}

export async function uploadDocumentoAgendamento({ agendamentoId, nome, categoriaId, arquivo }) {
  if (!agendamentoId) throw new Error("agendamentoId obrigatório");
  if (!nome) throw new Error("nome obrigatório");
  if (!categoriaId) throw new Error("categoriaId obrigatório");
  if (!arquivo) throw new Error("arquivo obrigatório");

  // mock mode: salva metadados localmente
  if ((API_CONFIG.MODE || "real").toLowerCase() === "mock") {
    const all = readDocsLocal();
    const list = Array.isArray(all[agendamentoId]) ? all[agendamentoId] : [];
    const record = {
      id: Math.floor(Math.random() * 10_000_000) + 1000,
      nome,
      categoria: categoriaId,
      arquivo_nome: arquivo?.name || "arquivo",
      criado_em: new Date().toISOString(),
    };
    all[agendamentoId] = [record, ...list];
    writeDocsLocal(all);
    return record;
  }

  const form = new FormData();
  form.append("nome", nome);
  form.append("categoria", String(categoriaId));
  form.append("arquivo", arquivo);

  // compat: caso backend ainda leia agendamento_id pelo body
  form.append("agendamento_id", String(agendamentoId));

  const { data } = await httpClient.post(`/v1/agendamentos/${agendamentoId}/documentos/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}