import { useEffect, useMemo, useRef, useState } from "react";
import { getAgendamentoById } from "@/services/agendamentoService";
import { getCartorioById, listPublicCartorios } from "@/services/cartorioService";
import { listDocumentoCategorias, uploadDocumentoAgendamento } from "@/services/documentoService";
import { useToast } from "@/components/Toasts/ToastProvider";
import "./agendamentoModal.css";
import "./agendamentoDetalhesModal.css";

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getThemeClass() {
  const html = document.documentElement;
  const t = html?.getAttribute("data-theme");
  if (t && t.toLowerCase() === "light") return "is-light";
  return "is-dark";
}

function formatBR(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const time = d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  } catch {
    return { date: "-", time: "-" };
  }
}

function statusBadge(status = "") {
  const s = normalize(status);
  if (s.includes("confirm")) return { label: "Confirmado", cls: "ag-badge ag-badge--ok" };
  if (s.includes("cancel")) return { label: "Cancelado", cls: "ag-badge ag-badge--danger" };
  return { label: "Pendente", cls: "ag-badge ag-badge--pending" };
}

function resolveBackendUrl(url) {
  if (!url) return null;
  const u = String(url);
  if (/^https?:\/\//i.test(u)) return u;

  const apiBase = String(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
  const origin = apiBase.replace(/\/api(\/.*)?$/i, "");

  if (u.startsWith("/")) return `${origin}${u}`;
  return `${origin}/${u}`;
}

function buildEndereco(cartorio) {
  if (!cartorio) return null;

  const parts = [];
  if (cartorio.endereco) parts.push(cartorio.endereco);
  if (cartorio.numero) parts.push(String(cartorio.numero));
  if (cartorio.bairro) parts.push(cartorio.bairro);
  if (cartorio.complemento) parts.push(cartorio.complemento);

  return parts.length ? parts.join(", ") : (cartorio.endereco || null);
}

function cidadeUfFromCartorio(cartorio) {
  if (!cartorio) return null;

  const mun = cartorio.municipio;
  if (mun?.nome && mun?.uf) return `${mun.nome} - ${mun.uf}`;

  const cidade = cartorio.cidade || null;
  const uf = cartorio.uf || cartorio.estado || null;
  if (cidade && uf) return `${cidade} - ${uf}`;

  return null;
}

export default function AgendamentoDetalhesModal({
  open,
  onClose,
  agendamentoId,
  initialAgendamento = null,
}) {
  const { showToast } = useToast();

  const [themeClass, setThemeClass] = useState("is-dark");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [agendamento, setAgendamento] = useState(null);
  const [cartorio, setCartorio] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [docNome, setDocNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [arquivo, setArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const categoriasById = useMemo(() => {
    const map = new Map();
    for (const c of categorias || []) {
      if (c?.id != null) map.set(String(c.id), c);
    }
    return map;
  }, [categorias]);

  useEffect(() => {
    if (!open) return;

    setThemeClass(getThemeClass());
    const obs = new MutationObserver(() => setThemeClass(getThemeClass()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    setErrorMsg("");
    setCartorio(null);
    setUploadOpen(false);
    setDocNome("");
    setCategoriaId("");
    setArquivo(null);
    setUploading(false);

    if (initialAgendamento) setAgendamento(initialAgendamento);

    (async () => {
      if (!agendamentoId) return;

      setLoading(true);
      try {
        const [ag, cats] = await Promise.all([
          getAgendamentoById(agendamentoId),
          listDocumentoCategorias(),
        ]);

        setAgendamento(ag);
        setCategorias(Array.isArray(cats) ? cats : []);

        if (ag?.cartorio) {
          try {
            const c = await getCartorioById(ag.cartorio);
            setCartorio(c || null);
          } catch {
            const list = await listPublicCartorios();
            const found = Array.isArray(list)
              ? list.find((x) => String(x.id) === String(ag.cartorio))
              : null;
            setCartorio(found || null);
          }
        }
      } catch (e) {
        setErrorMsg(e?.message || "Não foi possível carregar os detalhes.");
      } finally {
        setLoading(false);
      }
    })();

    return () => obs.disconnect();
  }, [open, agendamentoId, initialAgendamento]);

  if (!open) return null;

  const ag = agendamento;
  const badge = statusBadge(ag?.status || "");

  const cartorioNome = ag?.cartorio_nome || cartorio?.nome || "Cartório";
  const { date, time } = formatBR(ag?.data_hora);

  const endereco = buildEndereco(cartorio);
  const cidadeUf = cidadeUfFromCartorio(cartorio);
  const cep = cartorio?.cep || null;
  const telefone = cartorio?.telefone || null;

  const docs = Array.isArray(ag?.documentos) ? ag.documentos : [];

  function clearUpload() {
    setDocNome("");
    setCategoriaId("");
    setArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleUpload() {
    if (!agendamentoId) return;

    if (!arquivo) {
      showToast("error", "Selecione um arquivo.");
      return;
    }
    if (!categoriaId) {
      showToast("error", "Selecione uma categoria.");
      return;
    }

    const nomeFinal = (docNome || arquivo?.name || "Documento").trim();

    setUploading(true);
    try {
      const created = await uploadDocumentoAgendamento({
        agendamentoId,
        nome: nomeFinal,
        categoriaId,
        arquivo,
      });

      setAgendamento((prev) => {
        const prevDocs = Array.isArray(prev?.documentos) ? prev.documentos : [];
        return {
          ...(prev || ag || {}),
          documentos: [created, ...prevDocs],
        };
      });

      showToast("success", "Documento enviado.");
      setUploadOpen(false);
      clearUpload();
    } catch (e) {
      showToast("error", e?.message || "Não foi possível enviar o documento.");
    } finally {
      setUploading(false);
    }
  }

  const fileInputId = `bv-doc-upload-${agendamentoId || "x"}`;

  return (
    <div className={`bv-modal-theme ${themeClass}`}>
      <div className="bv-modal-overlay" role="dialog" aria-modal="true">
        <div className="bv-modal bv-details-modal">
          <div className="bv-modal-inner">
            <div className="bv-modal-header">
              <div className="bv-modal-title">
                <h2>Visualizar agendamento</h2>
                <p>{cartorioNome}</p>
              </div>

              <button className="bv-close" onClick={onClose} aria-label="Fechar">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bv-details-top">
              <span className={badge.cls}>{badge.label}</span>
            </div>

            {loading ? (
              <div className="bv-details-loading">Carregando...</div>
            ) : errorMsg ? (
              <div className="bv-details-error">{errorMsg}</div>
            ) : (
              <>
                <div className="bv-details-grid">
                  <div className="bv-details-item">
                    <span className="bv-details-label">Data</span>
                    <span className="bv-details-value">{date}</span>
                  </div>

                  <div className="bv-details-item">
                    <span className="bv-details-label">Horário</span>
                    <span className="bv-details-value">{time}</span>
                  </div>

                  <div className="bv-details-item bv-details-item--wide">
                    <span className="bv-details-label">Endereço</span>
                    <span className="bv-details-value">{endereco || "—"}</span>
                  </div>

                  <div className="bv-details-item">
                    <span className="bv-details-label">Cidade</span>
                    <span className="bv-details-value">{cidadeUf || "—"}</span>
                  </div>

                  <div className="bv-details-item">
                    <span className="bv-details-label">CEP</span>
                    <span className="bv-details-value">{cep || "—"}</span>
                  </div>

                  <div className="bv-details-item">
                    <span className="bv-details-label">Telefone</span>
                    <span className="bv-details-value">{telefone || "—"}</span>
                  </div>

                  <div className="bv-details-item bv-details-item--wide">
                    <span className="bv-details-label">Observações</span>
                    <span className="bv-details-value">{ag?.observacoes || "—"}</span>
                  </div>
                </div>

                <div className="bv-details-section">
                  <div className="bv-details-section-head">
                    <h3 className="bv-details-section-title">Documentos</h3>

                    {!uploadOpen && (
                      <button
                        type="button"
                        className="bv-details-cta"
                        onClick={() => setUploadOpen(true)}
                      >
                        Enviar documentos
                      </button>
                    )}
                  </div>

                  {docs.length === 0 ? (
                    <div className="bv-details-empty">Nenhum documento enviado.</div>
                  ) : (
                    <div className="bv-details-docs">
                      {docs.map((d) => {
                        const cat =
                          d?.categoria != null ? categoriasById.get(String(d.categoria)) : null;
                        const catLabel =
                          cat?.nome || (d?.categoria != null ? `Categoria #${d.categoria}` : "—");

                        const fileUrl = resolveBackendUrl(d?.arquivo);

                        return (
                          <div className="bv-doc" key={d.id || `${d.nome}-${d.criado_em}`}>
                            <div className="bv-doc-main">
                              <div className="bv-doc-name">{d?.nome || "Documento"}</div>
                              <div className="bv-doc-meta">{catLabel}</div>
                            </div>

                            <div className="bv-doc-actions">
                              {fileUrl ? (
                                <a className="bv-doc-btn" href={fileUrl} target="_blank" rel="noreferrer">
                                  Ver
                                </a>
                              ) : (
                                <span className="bv-doc-muted">Sem arquivo</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {uploadOpen && (
                    <div className="bv-upload-block">
                      <div className="bv-doc-item">
                        <div className="bv-field">
                          <label>Título do documento</label>
                          <input
                            className="bv-input"
                            value={docNome}
                            onChange={(e) => setDocNome(e.target.value)}
                            placeholder="Ex: RG (frente)"
                          />
                        </div>

                        <div className="bv-field bv-select-wrap">
                          <label>Categoria</label>
                          <select
                            className="bv-tag"
                            value={categoriaId}
                            onChange={(e) => setCategoriaId(e.target.value)}
                          >
                            <option value="">Selecione...</option>
                            {(categorias || []).map((c) => (
                              <option key={c.id} value={String(c.id)}>
                                {c.nome}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="bv-field bv-file-wrap">
                          <label>Arquivo</label>

                          <input
                            ref={fileInputRef}
                            id={fileInputId}
                            type="file"
                            onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                          />

                          <label className="bv-file-btn" htmlFor={fileInputId}>
                            <span className="bv-file-left">
                              <span className="material-symbols-outlined">upload_file</span>
                              <span className="bv-file-name">
                                {arquivo?.name || "Nenhum arquivo selecionado"}
                              </span>
                            </span>
                            <span className="bv-file-action">
                              {arquivo ? "Trocar" : "Selecionar"}
                            </span>
                          </label>
                        </div>

                        <button
                          type="button"
                          className="bv-trash"
                          onClick={clearUpload}
                          aria-label="Limpar"
                          title="Limpar"
                          disabled={uploading}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>

                      <div className="bv-upload-actions">
                        <button
                          type="button"
                          className="bv-link-btn"
                          onClick={() => {
                            setUploadOpen(false);
                            clearUpload();
                          }}
                          disabled={uploading}
                        >
                          Cancelar
                        </button>

                        <button
                          type="button"
                          className="bv-primary-btn"
                          onClick={handleUpload}
                          disabled={uploading}
                        >
                          {uploading ? "Enviando..." : "Enviar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bv-details-actions">
                  <button type="button" className="bv-link-btn" onClick={onClose}>
                    Fechar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}