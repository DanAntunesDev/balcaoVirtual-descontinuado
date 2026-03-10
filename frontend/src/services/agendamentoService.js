import { agendamentosMock } from "@/mocks/agendamentos.mock";

const MODE = String(import.meta.env.VITE_API_MODE || "real").toLowerCase();
const API_BASE = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");

const LS_KEY = "bv_mock_agendamentos";

function safeJsonParse(v) {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}

function readMock() {
  const raw = localStorage.getItem(LS_KEY);
  const parsed = raw ? safeJsonParse(raw) : null;
  return Array.isArray(parsed) ? parsed : [];
}

function writeMock(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

function getAccessToken() {
  const directKeys = ["auth_token", "accessToken", "access_token", "bv_access_token", "token", "access"];
  for (const k of directKeys) {
    const v = localStorage.getItem(k);
    if (v && v.length > 20) return v;
  }

  const jsonKeys = ["tokens", "bv_tokens", "auth_tokens"];
  for (const k of jsonKeys) {
    const v = localStorage.getItem(k);
    const obj = v ? safeJsonParse(v) : null;
    const cand = obj?.access || obj?.accessToken || obj?.token;
    if (cand && cand.length > 20) return cand;
  }

  return null;
}

async function apiRequest(path, { method = "GET", body = null, headers = {} } = {}) {
  const url = `${API_BASE}${path}`;
  const token = getAccessToken();

  const finalHeaders = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const opts = {
    method,
    headers: finalHeaders,
  };

  if (body && !(body instanceof FormData)) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  } else if (body instanceof FormData) {
    opts.body = body;
  }

  const res = await fetch(url, opts);
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const detail = data?.detail || data?.error || text || `HTTP ${res.status}`;
    throw new Error(detail);
  }

  return data;
}

export async function createAgendamento({ cartorioId, dataHoraISO, observacoes = "" }) {
  if (!cartorioId) throw new Error("cartorioId obrigatório");
  if (!dataHoraISO) throw new Error("dataHoraISO obrigatório");

  if (MODE === "mock") {
    const list = readMock();
    const id = Math.floor(Math.random() * 1000000) + 1000;

    const created = {
      id,
      cartorio: cartorioId,
      cartorio_id: cartorioId,
      cartorio_nome: `Cartório #${cartorioId}`,
      data_hora: dataHoraISO,
      status: "pendente",
      observacoes,
      criado_em: new Date().toISOString(),
    };

    writeMock([created, ...list]);
    return created;
  }

  return apiRequest("/v1/agendamentos/", {
    method: "POST",
    body: {
      cartorio: cartorioId,
      data_hora: dataHoraISO,
      observacoes,
    },
  });
}

export async function createSolicitarRetorno({
  cartorioId,
  nome,
  telefone,
  dataHoraISO = null,
  mensagem = "",
}) {
  if (!cartorioId) throw new Error("cartorioId obrigatório");
  if (!nome) throw new Error("nome obrigatório");
  if (!telefone) throw new Error("telefone obrigatório");

  let whenISO = dataHoraISO;
  if (!whenISO) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    whenISO = d.toISOString();
  }

  const obs = `[RETORNO] Nome: ${nome} | Telefone: ${telefone}${mensagem ? ` | Msg: ${mensagem}` : ""}`;

  return createAgendamento({
    cartorioId,
    dataHoraISO: whenISO,
    observacoes: obs,
  });
}

export async function getHistoricoCliente() {
  if (MODE === "mock") {
    const local = readMock();
    const merged = [...local, ...agendamentosMock];
    return { agendamentos: merged, atendimentos: [], documentos: [] };
  }

  try {
    const data = await apiRequest("/v1/cliente/historico/");
    return {
      agendamentos: Array.isArray(data?.agendamentos) ? data.agendamentos : [],
      atendimentos: Array.isArray(data?.atendimentos) ? data.atendimentos : [],
      documentos: Array.isArray(data?.documentos) ? data.documentos : [],
    };
  } catch {
    const local = readMock();
    const merged = [...local, ...agendamentosMock];
    return { agendamentos: merged, atendimentos: [], documentos: [] };
  }
}

export async function listAgendamentosCliente() {
  const data = await getHistoricoCliente();
  return {
    items: Array.isArray(data?.agendamentos) ? data.agendamentos : [],
    mode: "compat",
  };
}

export async function getAgendamentoById(agendamentoId) {
  if (!agendamentoId) throw new Error("agendamentoId obrigatório");

  if (MODE === "mock") {
    const local = readMock();
    const merged = [...local, ...agendamentosMock];
    const found = merged.find((x) => String(x.id) === String(agendamentoId));
    if (!found) throw new Error("Agendamento não encontrado.");
    return { ...found, documentos: [] };
  }

  return apiRequest(`/v1/agendamentos/${agendamentoId}/`);
}

export async function cancelAgendamento(agendamentoId) {
  if (!agendamentoId) throw new Error("agendamentoId obrigatório");

  if (MODE === "mock") {
    const list = readMock();
    const next = list.map((it) =>
      String(it.id) === String(agendamentoId) ? { ...it, status: "cancelado" } : it
    );
    writeMock(next);

    const updated = next.find((x) => String(x.id) === String(agendamentoId));
    return updated || { id: agendamentoId, status: "cancelado" };
  }

  return apiRequest(`/v1/agendamentos/${agendamentoId}/cancelar/`, { method: "POST" });
}