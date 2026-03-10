import { useEffect, useMemo, useRef, useState } from "react";
import { createAgendamento } from "@/services/agendamentoService";
import { listDocumentoCategorias, uploadDocumentoAgendamento } from "@/services/documentoService";
import "./agendamentoModal.css";

const DOW = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
const TIME_SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00"];

function pad2(n) {
  return String(n).padStart(2, "0");
}

function ymd(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function monthLabel(date) {
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function buildCalendarMonth(viewDate) {
  const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startDay = first.getDay();
  const totalCells = 42;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startDay;
    const d = new Date(first);
    d.setDate(first.getDate() + dayOffset);
    const isOut = d.getMonth() !== viewDate.getMonth();
    cells.push({ date: d, isOut });
  }

  return { cells };
}

function getThemeClass() {
  const html = document.documentElement;
  const t = html?.getAttribute("data-theme");
  if (t && t.toLowerCase() === "light") return "is-light";
  return "is-dark";
}

function cartorioEnderecoCompleto(cartorio) {
  return cartorio?.endereco || "—";
}

export default function AgendarModal({ open, onClose, cartorio }) {
  const [themeClass, setThemeClass] = useState("is-dark");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState(() => ymd(new Date()));
  const [selectedTime, setSelectedTime] = useState("10:00");

  // DOCS
  const [docsOpen, setDocsOpen] = useState(false);
  const docsRef = useRef(null);

  const [categorias, setCategorias] = useState([]);
  const [docs, setDocs] = useState([
    { id: crypto?.randomUUID?.() ?? String(Date.now()), nome: "", categoriaId: "", arquivo: null },
  ]);

  const calendar = useMemo(() => buildCalendarMonth(viewMonth), [viewMonth]);

  useEffect(() => {
    if (!open) return;

    setThemeClass(getThemeClass());
    const obs = new MutationObserver(() => setThemeClass(getThemeClass()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    setLoading(false);
    setErrorMsg("");
    setSuccessInfo(null);

    const today = new Date();
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(ymd(today));
    setSelectedTime("10:00");

    setDocsOpen(false);
    setDocs([{ id: crypto?.randomUUID?.() ?? String(Date.now()), nome: "", categoriaId: "", arquivo: null }]);

    (async () => {
      const cats = await listDocumentoCategorias();
      setCategorias(Array.isArray(cats) ? cats : []);
    })();

    return () => obs.disconnect();
  }, [open]);

  useEffect(() => {
    if (!docsOpen) return;
    setTimeout(() => {
      docsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, [docsOpen]);

  if (!open) return null;

  const cartorioNome = cartorio?.nome || "Cartório";
  const cidadeUf = cartorio?.cidade && cartorio?.uf ? `${cartorio.cidade} - ${cartorio.uf}` : null;
  const telefone = cartorio?.telefone || null;
  const endereco = cartorioEnderecoCompleto(cartorio);

  function prevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function addDoc() {
    setDocs((d) => [
      ...d,
      { id: crypto?.randomUUID?.() ?? String(Date.now() + Math.random()), nome: "", categoriaId: "", arquivo: null },
    ]);
  }

  function removeDoc(id) {
    setDocs((d) => d.filter((x) => x.id !== id));
  }

  function updateDoc(id, patch) {
    setDocs((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  async function handleConfirm() {
    if (!cartorio?.id) {
      setErrorMsg("Cartório inválido.");
      return;
    }

    // valida docs se painel aberto
    if (docsOpen) {
      const invalid = docs.some((d) => !String(d.nome || "").trim() || !String(d.categoriaId || "").trim() || !d.arquivo);
      if (invalid) {
        setErrorMsg("Preencha título, categoria e selecione um arquivo em todos os documentos.");
        return;
      }
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const dt = new Date(`${selectedDate}T${selectedTime}:00`);
      const iso = dt.toISOString();

      // 1) cria agendamento
      const ag = await createAgendamento({
        cartorioId: cartorio.id,
        dataHoraISO: iso,
        observacoes: "",
      });

      const agendamentoId = ag?.id;
      if (!agendamentoId) throw new Error("Agendamento não retornou ID.");

      // 2) sobe documentos
      if (docsOpen) {
        for (const d of docs) {
          await uploadDocumentoAgendamento({
            agendamentoId,
            nome: d.nome,
            categoriaId: d.categoriaId,
            arquivo: d.arquivo,
          });
        }
      }

      setSuccessInfo({
        id: agendamentoId,
        when: ag?.data_hora ?? iso,
      });
    } catch (e) {
      setErrorMsg("Não foi possível finalizar o agendamento e upload dos documentos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`bv-modal-theme ${themeClass}`}>
      <div className="bv-modal-overlay" role="dialog" aria-modal="true">
        <div className="bv-modal">
          <div className="bv-modal-inner">
            <div className="bv-modal-header">
              <div className="bv-modal-title">
                <h2>Agendar Horário</h2>
                <p>{cartorioNome}</p>
              </div>

              <button className="bv-close" onClick={onClose} aria-label="Fechar">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bv-pill-row">
              <div className="bv-pill" title={endereco}>
                <span className="material-symbols-outlined">location_on</span>
                <div className="bv-pill-text">
                  <strong>{endereco}</strong>
                  <span>{cidadeUf || "—"}</span>
                </div>
              </div>

              {telefone && (
                <div className="bv-phone">
                  <span className="material-symbols-outlined">call</span>
                  <span>{telefone}</span>
                </div>
              )}
            </div>

            {successInfo ? (
              <div className="bv-notice success">
                <strong>Agendamento registrado!</strong>
                <div>Código: #{successInfo.id}</div>
                <div>Data/Hora: {successInfo.when}</div>
                {docsOpen ? <div>Documentos enviados com sucesso.</div> : null}
              </div>
            ) : (
              <>
                <div className="bv-body-grid">
                  <div className="bv-calendar">
                    <div className="bv-calendar-head">
                      <strong style={{ textTransform: "capitalize" }}>{monthLabel(viewMonth)}</strong>
                      <div className="bv-nav">
                        <button onClick={prevMonth} type="button" aria-label="Mês anterior">
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button onClick={nextMonth} type="button" aria-label="Próximo mês">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    </div>

                    <div className="bv-dow">
                      {DOW.map((d) => (
                        <div key={d}>{d}</div>
                      ))}
                    </div>

                    <div className="bv-days">
                      {calendar.cells.map((c, idx) => {
                        const key = `${c.date.toISOString()}-${idx}`;
                        const day = c.date.getDate();
                        const isSelected = ymd(c.date) === selectedDate;

                        return (
                          <button
                            key={key}
                            type="button"
                            className={["bv-day", c.isOut ? "is-out" : "", isSelected ? "is-selected" : ""].join(" ")}
                            disabled={c.isOut}
                            onClick={() => setSelectedDate(ymd(c.date))}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="bv-section-title">
                      <h3>Horários disponíveis para {selectedDate}</h3>
                      <span>Selecione um horário</span>
                    </div>

                    <div className="bv-slots">
                      {TIME_SLOTS.map((t) => {
                        const isSelected = t === selectedTime;
                        return (
                          <button
                            key={t}
                            type="button"
                            className={["bv-slot", isSelected ? "is-selected" : ""].join(" ")}
                            onClick={() => setSelectedTime(t)}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>

                    <button className="bv-docs-btn" type="button" onClick={() => setDocsOpen((v) => !v)}>
                      <span className="material-symbols-outlined">attach_file</span>
                      {docsOpen ? "Fechar documentos" : "Adicionar documento"}
                    </button>

                    {errorMsg ? <div className="bv-notice error">{errorMsg}</div> : null}
                  </div>
                </div>

                <div ref={docsRef} className={["bv-docs-panel", docsOpen ? "is-open" : ""].join(" ")}>
                  <div className="bv-docs-panel-inner">
                    <div className="bv-docs-head">
                      <strong>Documentos para o agendamento</strong>
                      <button type="button" className="bv-mini-btn" onClick={addDoc}>
                        <span className="material-symbols-outlined">add</span>
                        Adicionar
                      </button>
                    </div>

                    <div className="bv-docs-scroll">
                      {docs.map((d) => (
                        <div className="bv-doc-item" key={d.id}>
                          <div className="bv-field">
                            <label>Título do documento</label>
                            <input
                              className="bv-input"
                              value={d.nome}
                              onChange={(e) => updateDoc(d.id, { nome: e.target.value })}
                              placeholder="Ex: RG (frente)"
                            />
                          </div>

                          <div className="bv-field bv-select-wrap">
                            <label>Categoria</label>
                            <select
                              className="bv-tag"
                              value={d.categoriaId}
                              onChange={(e) => updateDoc(d.id, { categoriaId: e.target.value })}
                            >
                              <option value="">Selecione...</option>
                              {categorias.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.nome}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="bv-field bv-file-wrap">
                            <label>Arquivo</label>

                            <input
                              id={`file-${d.id}`}
                              type="file"
                              onChange={(e) => updateDoc(d.id, { arquivo: e.target.files?.[0] || null })}
                            />

                            <label className="bv-file-btn" htmlFor={`file-${d.id}`}>
                              <span className="bv-file-left">
                                <span className="material-symbols-outlined">upload_file</span>
                                <span className="bv-file-name">
                                  {d.arquivo?.name || "Nenhum arquivo selecionado"}
                                </span>
                              </span>
                              <span className="bv-file-action">{d.arquivo ? "Trocar" : "Selecionar"}</span>
                            </label>
                          </div>

                          <button
                            type="button"
                            className="bv-trash"
                            onClick={() => removeDoc(d.id)}
                            aria-label="Remover"
                            title="Remover"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="bv-footer">
              <button className="bv-link-btn" onClick={onClose} disabled={loading}>
                Cancelar
              </button>

              {!successInfo && (
                <button className="bv-primary-btn" onClick={handleConfirm} disabled={loading}>
                  {loading ? "Enviando..." : "Confirmar Agendamento"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 