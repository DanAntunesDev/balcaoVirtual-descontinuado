import { useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/Toasts/ToastProvider";
import { useAuth } from "@/domain/auth/useAuth";
import { getMe, updateMe, changePassword, deleteAccount } from "@/services/userService";
import { getHistoricoCliente } from "@/services/agendamentoService";
import { listDocumentoCategorias, uploadDocumentoAgendamento } from "@/services/documentoService";
import "./clientMeuPerfil.css";
import "@/components/modals/agendamentoModal.css"; // reaproveita estilos de inputs/botões do upload

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatBR(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${date} ${time}`;
  } catch {
    return "—";
  }
}

function splitFullName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
}

function statusDocBadge(status = "") {
  const s = normalize(status);
  if (s.includes("aprov")) return { label: "Aprovado", cls: "mp-badge mp-badge--ok" };
  if (s.includes("reprov")) return { label: "Reprovado", cls: "mp-badge mp-badge--danger" };
  return { label: "Pendente", cls: "mp-badge mp-badge--pending" };
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

const SECTIONS = [
  { key: "dados", label: "Dados Pessoais" },
  { key: "senha", label: "Alterar senha" },
  { key: "contato", label: "Referência de contato" },
  { key: "seguranca", label: "Segurança da conta" },
  { key: "historico", label: "Histórico de atividade" },
  { key: "docs", label: "Documentos do cliente" },
];

export default function ClientMeuPerfil() {
  const { showToast } = useToast();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);

  // dropdown
  const [section, setSection] = useState("dados");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // user
  const [me, setMe] = useState(null);

  // forms
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  const [prefEmail, setPrefEmail] = useState(true);
  const [prefWhats, setPrefWhats] = useState(false);
  const [prefLembrete, setPrefLembrete] = useState(true);

  // senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [savingSenha, setSavingSenha] = useState(false);

  // segurança / excluir
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // histórico / documentos
  const [historico, setHistorico] = useState({ agendamentos: [], documentos: [] });
  const [categorias, setCategorias] = useState([]);

  // upload docs (cliente)
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadAgendamentoId, setUploadAgendamentoId] = useState("");
  const [uploadNome, setUploadNome] = useState("");
  const [uploadCategoriaId, setUploadCategoriaId] = useState("");
  const [uploadArquivo, setUploadArquivo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const [meData, hist, cats] = await Promise.all([
          getMe(),
          getHistoricoCliente(),
          listDocumentoCategorias(),
        ]);

        if (!alive) return;

        setMe(meData);

        const full = [meData?.first_name, meData?.last_name].filter(Boolean).join(" ").trim()
          || meData?.username
          || "Usuário";

        setNomeCompleto(full);
        setEmail(meData?.email || "");
        setTelefone(meData?.telefone || "");

        setPrefEmail(Boolean(meData?.notificar_email));
        setPrefWhats(Boolean(meData?.notificar_whatsapp));
        setPrefLembrete(Boolean(meData?.lembrete_automatico_agendamento));

        setHistorico({
          agendamentos: Array.isArray(hist?.agendamentos) ? hist.agendamentos : [],
          documentos: Array.isArray(hist?.documentos) ? hist.documentos : [],
        });

        setCategorias(Array.isArray(cats) ? cats : []);

        // default do upload: primeiro agendamento (se existir)
        const ags = Array.isArray(hist?.agendamentos) ? hist.agendamentos : [];
        const first = ags[0]?.id ? String(ags[0].id) : "";
        setUploadAgendamentoId(first);
      } catch (e) {
        showToast("error", e?.message || "Não foi possível carregar seu perfil.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sectionLabel = useMemo(() => {
    return SECTIONS.find((s) => s.key === section)?.label || "Dados Pessoais";
  }, [section]);

  const agendamentos = historico?.agendamentos || [];
  const docs = historico?.documentos || [];

  const ultimosAgendamentos = useMemo(() => {
    return [...agendamentos]
      .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
      .slice(0, 6);
  }, [agendamentos]);

  const cancelamentos = useMemo(() => {
    return agendamentos
      .filter((a) => normalize(a.status).includes("cancel"))
      .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
      .slice(0, 6);
  }, [agendamentos]);

  const retornos = useMemo(() => {
    return agendamentos
      .filter((a) => String(a.observacoes || "").toUpperCase().includes("[RETORNO]"))
      .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
      .slice(0, 6);
  }, [agendamentos]);

  async function salvarDadosPessoais() {
    try {
      const { first_name, last_name } = splitFullName(nomeCompleto);

      const updated = await updateMe({
        first_name,
        last_name,
        email,
        telefone,
      });

      setMe(updated);
      showToast("success", "Dados atualizados.");
    } catch (e) {
      showToast("error", e?.message || "Não foi possível salvar.");
    }
  }

  async function salvarPreferencias() {
    try {
      const updated = await updateMe({
        notificar_email: Boolean(prefEmail),
        notificar_whatsapp: Boolean(prefWhats),
        lembrete_automatico_agendamento: Boolean(prefLembrete),
      });

      setMe(updated);
      showToast("success", "Preferências salvas.");
    } catch (e) {
      showToast("error", e?.message || "Não foi possível salvar preferências.");
    }
  }

  async function alterarSenha() {
    setSavingSenha(true);
    try {
      await changePassword({
        current_password: senhaAtual,
        new_password: novaSenha,
        confirm_password: confSenha,
      });

      setSenhaAtual("");
      setNovaSenha("");
      setConfSenha("");

      showToast("success", "Senha alterada.");
    } catch (e) {
      showToast("error", e?.message || "Não foi possível alterar a senha.");
    } finally {
      setSavingSenha(false);
    }
  }

  function clearUpload() {
    setUploadNome("");
    setUploadCategoriaId("");
    setUploadArquivo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function enviarDocumento() {
    if (!uploadAgendamentoId) {
      showToast("error", "Selecione um agendamento.");
      return;
    }
    if (!uploadArquivo) {
      showToast("error", "Selecione um arquivo.");
      return;
    }
    if (!uploadCategoriaId) {
      showToast("error", "Selecione uma categoria.");
      return;
    }

    setUploading(true);
    try {
      const created = await uploadDocumentoAgendamento({
        agendamentoId: uploadAgendamentoId,
        nome: (uploadNome || uploadArquivo?.name || "Documento").trim(),
        categoriaId: uploadCategoriaId,
        arquivo: uploadArquivo,
      });

      setHistorico((prev) => ({
        ...(prev || {}),
        documentos: [created, ...(prev?.documentos || [])],
      }));

      showToast("success", "Documento enviado.");
      setUploadOpen(false);
      clearUpload();
    } catch (e) {
      showToast("error", e?.message || "Não foi possível enviar o documento.");
    } finally {
      setUploading(false);
    }
  }

  async function confirmarExcluirConta() {
    setDeleting(true);
    try {
      await deleteAccount({ confirm_text: deleteText });
      showToast("success", "Conta desativada.");

      logout?.();
      window.location.href = "/";
    } catch (e) {
      showToast("error", e?.message || "Não foi possível excluir a conta.");
    } finally {
      setDeleting(false);
    }
  }

  const deviceInfo = useMemo(() => {
    const ua = navigator.userAgent || "";
    const plat = navigator.platform || "";
    return `${plat} • ${ua}`.trim();
  }, []);

  const fileInputId = `mp-doc-upload`;

  return (
    <div className="mp-wrap">
      <div className="mp-head">
        <h1>Meu Perfil</h1>
        <p>Gerencie seus dados, segurança e documentos.</p>
      </div>

      <div className="mp-controls">
        <div className="mp-dropdown" ref={menuRef}>
          <button
            className="mp-dd-btn"
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="mp-dd-label">{sectionLabel}</span>
            <span className="material-symbols-outlined">expand_more</span>
          </button>

          {menuOpen && (
            <div className="mp-dd-menu">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`mp-dd-item ${section === s.key ? "is-active" : ""}`}
                  onClick={() => {
                    setSection(s.key);
                    setMenuOpen(false);
                    setDeleteOpen(false);
                    setUploadOpen(false);
                  }}
                >
                  {s.label}
                  {section === s.key && (
                    <span className="material-symbols-outlined">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mp-loading">Carregando...</div>
      ) : (
        <div className="mp-card">
          {section === "dados" && (
            <>
              <h2 className="mp-title">Dados Pessoais</h2>

              <div className="mp-grid">
                <div className="mp-field mp-field--wide">
                  <label>Nome Completo</label>
                  <input value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
                </div>

                <div className="mp-field">
                  <label>CPF</label>
                  <input value={me?.cpf || ""} disabled />
                </div>

                <div className="mp-field">
                  <label>Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="mp-field">
                  <label>Telefone</label>
                  <input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="mp-actions">
                <button type="button" className="mp-btn mp-btn--primary" onClick={salvarDadosPessoais}>
                  Salvar
                </button>
              </div>
            </>
          )}

          {section === "senha" && (
            <>
              <h2 className="mp-title">Alterar senha</h2>

              <div className="mp-grid">
                <div className="mp-field">
                  <label>Senha Atual</label>
                  <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
                </div>

                <div className="mp-field">
                  <label>Nova Senha</label>
                  <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
                </div>

                <div className="mp-field">
                  <label>Confirmar Senha</label>
                  <input type="password" value={confSenha} onChange={(e) => setConfSenha(e.target.value)} />
                </div>
              </div>

              <div className="mp-actions">
                <button
                  type="button"
                  className="mp-btn mp-btn--primary"
                  onClick={alterarSenha}
                  disabled={savingSenha}
                >
                  {savingSenha ? "Alterando..." : "Alterar Senha"}
                </button>
              </div>
            </>
          )}

          {section === "contato" && (
            <>
              <h2 className="mp-title">Referência de contato</h2>

              <div className="mp-list">
                <label className="mp-check">
                  <input type="checkbox" checked={prefEmail} onChange={(e) => setPrefEmail(e.target.checked)} />
                  Receber notificações por email
                </label>

                <label className="mp-check">
                  <input type="checkbox" checked={prefWhats} onChange={(e) => setPrefWhats(e.target.checked)} />
                  Receber notificações por Whatsapp
                </label>

                <label className="mp-check">
                  <input type="checkbox" checked={prefLembrete} onChange={(e) => setPrefLembrete(e.target.checked)} />
                  Lembrete Automático de Agendamento
                </label>
              </div>

              <div className="mp-actions">
                <button type="button" className="mp-btn mp-btn--primary" onClick={salvarPreferencias}>
                  Salvar preferências
                </button>
              </div>
            </>
          )}

          {section === "seguranca" && (
            <>
              <h2 className="mp-title">Segurança da conta</h2>

              <div className="mp-grid">
                <div className="mp-field mp-field--wide">
                  <label>Último Login</label>
                  <input value={me?.last_login ? formatBR(me.last_login) : "—"} disabled />
                </div>

                <div className="mp-field mp-field--wide">
                  <label>Dispositivo Atual</label>
                  <input value={deviceInfo || "—"} disabled />
                </div>
              </div>

              <div className="mp-actions mp-actions--between">
                <button type="button" className="mp-btn" disabled title="A definir com estratégia de tokens">
                  Encerrar Sessão em outros dispositivos
                </button>

                <button
                  type="button"
                  className="mp-btn mp-btn--danger"
                  onClick={() => setDeleteOpen((v) => !v)}
                >
                  Excluir conta
                </button>
              </div>

              {deleteOpen && (
                <div className="mp-danger-box">
                  <p className="mp-danger-title">
                    Confirmação obrigatória
                  </p>
                  <p className="mp-danger-sub">
                    Digite <strong>EXCLUIR</strong> para desativar sua conta. Essa ação não apaga seus registros de agendamento, apenas desativa e anonimiza seu usuário.
                  </p>

                  <div className="mp-danger-row">
                    <input
                      value={deleteText}
                      onChange={(e) => setDeleteText(e.target.value)}
                      placeholder="Digite EXCLUIR"
                    />

                    <button
                      type="button"
                      className="mp-btn mp-btn--danger"
                      onClick={confirmarExcluirConta}
                      disabled={deleting}
                    >
                      {deleting ? "Excluindo..." : "Confirmar exclusão"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {section === "historico" && (
            <>
              <h2 className="mp-title">Histórico de atividade</h2>

              <div className="mp-split">
                <div className="mp-block">
                  <h3>Últimos Agendamentos Realizados</h3>
                  {ultimosAgendamentos.length === 0 ? (
                    <div className="mp-empty">Nenhum agendamento.</div>
                  ) : (
                    <ul className="mp-ul">
                      {ultimosAgendamentos.map((a) => (
                        <li key={a.id}>
                          <span className="mp-strong">{a.cartorio_nome}</span>
                          <span className="mp-muted">{formatBR(a.data_hora)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mp-block">
                  <h3>Cancelamentos</h3>
                  {cancelamentos.length === 0 ? (
                    <div className="mp-empty">Nenhum cancelamento.</div>
                  ) : (
                    <ul className="mp-ul">
                      {cancelamentos.map((a) => (
                        <li key={a.id}>
                          <span className="mp-strong">{a.cartorio_nome}</span>
                          <span className="mp-muted">{formatBR(a.data_hora)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="mp-block">
                  <h3>Solicitações de retorno</h3>
                  {retornos.length === 0 ? (
                    <div className="mp-empty">Nenhuma solicitação.</div>
                  ) : (
                    <ul className="mp-ul">
                      {retornos.map((a) => (
                        <li key={a.id}>
                          <span className="mp-strong">{a.cartorio_nome}</span>
                          <span className="mp-muted">{formatBR(a.data_hora)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {section === "docs" && (
            <>
              <div className="mp-docs-head">
                <h2 className="mp-title">Documentos do cliente</h2>

                {!uploadOpen && (
                  <button type="button" className="mp-btn mp-btn--primary" onClick={() => setUploadOpen(true)}>
                    Upload de Documentos
                  </button>
                )}
              </div>

              {uploadOpen && (
                <div className="mp-upload">
                  <div className="bv-doc-item">
                    <div className="bv-field">
                      <label>Agendamento</label>
                      <select
                        className="bv-tag"
                        value={uploadAgendamentoId}
                        onChange={(e) => setUploadAgendamentoId(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {agendamentos.map((a) => (
                          <option key={a.id} value={String(a.id)}>
                            {a.cartorio_nome} — {formatBR(a.data_hora)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bv-field">
                      <label>Título do documento</label>
                      <input
                        className="bv-input"
                        value={uploadNome}
                        onChange={(e) => setUploadNome(e.target.value)}
                        placeholder="Ex: RG (frente)"
                      />
                    </div>

                    <div className="bv-field bv-select-wrap">
                      <label>Categoria</label>
                      <select
                        className="bv-tag"
                        value={uploadCategoriaId}
                        onChange={(e) => setUploadCategoriaId(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {categorias.map((c) => (
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
                        onChange={(e) => setUploadArquivo(e.target.files?.[0] || null)}
                      />
                      <label className="bv-file-btn" htmlFor={fileInputId}>
                        <span className="bv-file-left">
                          <span className="material-symbols-outlined">upload_file</span>
                          <span className="bv-file-name">
                            {uploadArquivo?.name || "Nenhum arquivo selecionado"}
                          </span>
                        </span>
                        <span className="bv-file-action">
                          {uploadArquivo ? "Trocar" : "Selecionar"}
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

                  <div className="mp-actions">
                    <button
                      type="button"
                      className="mp-btn"
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
                      className="mp-btn mp-btn--primary"
                      onClick={enviarDocumento}
                      disabled={uploading}
                    >
                      {uploading ? "Enviando..." : "Enviar"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mp-docs">
                {docs.length === 0 ? (
                  <div className="mp-empty">Nenhum documento enviado.</div>
                ) : (
                  docs.map((d) => {
                    const badge = statusDocBadge(d.status);
                    const fileUrl = resolveBackendUrl(d.arquivo);

                    return (
                      <div className="mp-doc" key={d.id}>
                        <div className="mp-doc-left">
                          <div className="mp-doc-title">{d.nome || "Documento"}</div>
                          <div className="mp-doc-sub">
                            <span className={badge.cls}>{badge.label}</span>
                            <span className="mp-muted">{d.categoria || "—"}</span>
                          </div>
                        </div>

                        <div className="mp-doc-actions">
                          {fileUrl ? (
                            <a className="mp-btn mp-btn--ghost" href={fileUrl} target="_blank" rel="noreferrer">
                              Ver
                            </a>
                          ) : (
                            <span className="mp-muted">Sem arquivo</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}