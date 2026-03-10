import { useEffect, useMemo, useRef, useState } from "react";
import { cancelAgendamento, getHistoricoCliente } from "@/services/agendamentoService";
import { useToast } from "@/components/Toasts/ToastProvider";
import AgendamentoDetalhesModal from "@/components/modals/AgendamentoDetalhesModal";
import "./clientAgendamentos.css";

function normalize(str = "") {
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
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

function categoriaLabel(item) {
  const obs = String(item?.observacoes || "");
  if (obs.toUpperCase().includes("[RETORNO]")) return "Retorno";
  return "Agendamento";
}

function statusKey(status = "") {
  const s = normalize(status);
  if (s.includes("confirm")) return "confirmado";
  if (s.includes("cancel")) return "cancelado";
  return "pendente";
}

export default function ClientAgendamentos() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  // filtro real (3 status)
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all | pendente | confirmado | cancelado
  const filterRef = useRef(null);

  // modal visualizar
  const [viewOpen, setViewOpen] = useState(false);
  const [viewId, setViewId] = useState(null);
  const [viewInitial, setViewInitial] = useState(null);

  // cancelar
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      const res = await getHistoricoCliente();
      if (!alive) return;

      setItems(Array.isArray(res?.agendamentos) ? res.agendamentos : []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // fechar menu ao clicar fora
  useEffect(() => {
    function onDocClick(e) {
      if (!filterRef.current) return;
      if (!filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    if (filterOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const query = normalize(q.trim());

    let base = items;

    if (statusFilter !== "all") {
      base = base.filter((x) => statusKey(x.status) === statusFilter);
    }

    if (!query) return base;

    return base.filter((x) => {
      const hay = normalize(`${categoriaLabel(x)} ${x.cartorio_nome} ${x.status}`);
      return hay.includes(query);
    });
  }, [items, q, statusFilter]);

  function handleVisualizar(a) {
    setViewId(a?.id || null);
    setViewInitial(a || null);
    setViewOpen(true);
  }

  async function handleCancelar(a) {
    if (!a?.id) return;

    const key = statusKey(a.status);
    if (key === "cancelado") return;

    setCancelLoadingId(a.id);
    try {
      const updated = await cancelAgendamento(a.id);
      const nextStatus = updated?.status || "cancelado";

      setItems((prev) =>
        prev.map((it) => (it.id === a.id ? { ...it, status: nextStatus } : it))
      );

      showToast("success", "Agendamento cancelado.");
    } catch (e) {
      showToast("error", e?.message || "Não foi possível cancelar o agendamento.");
    } finally {
      setCancelLoadingId(null);
    }
  }

  return (
    <div className="ag-wrap">
      <div className="ag-head">
        <h1>Meus Agendamentos</h1>
        <p>Gerencie seus atendimentos agendados nos cartórios</p>
      </div>

      <div className="ag-controls">
        <div className="ag-search">
          <span className="material-symbols-outlined">search</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filtrar por cartório ou serviço..."
          />
        </div>

        <div className="ag-filter-wrap" ref={filterRef}>
          <button
            className="ag-filter-btn"
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
          >
            <span className="material-symbols-outlined">filter_list</span>
            Filtrar
          </button>

          {filterOpen && (
            <div className="ag-filter-menu" role="menu" aria-label="Filtro de status">
              {[
                { key: "all", label: "Todos" },
                { key: "pendente", label: "Pendente" },
                { key: "confirmado", label: "Confirmado" },
                { key: "cancelado", label: "Cancelado" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`ag-filter-item ${statusFilter === opt.key ? "is-active" : ""}`}
                  onClick={() => {
                    setStatusFilter(opt.key);
                    setFilterOpen(false);
                  }}
                >
                  <span>{opt.label}</span>
                  {statusFilter === opt.key && (
                    <span className="material-symbols-outlined">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="ag-loading">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="ag-empty">
          <div className="ag-empty-card">
            <span className="material-symbols-outlined">calendar_month</span>
            <h2>Nenhum agendamento</h2>
            <p>Quando você agendar ou solicitar retorno, aparecerá aqui.</p>
          </div>
        </div>
      ) : (
        <>
          <section className="ag-grid">
            {filtered.map((a) => {
              const { date, time } = formatBR(a.data_hora);
              const badge = statusBadge(a.status);
              const isCancelling = cancelLoadingId === a.id;
              const isCanceled = statusKey(a.status) === "cancelado";

              return (
                <article key={a.id} className="ag-card">
                  <div className="ag-card-top">
                    <div className="ag-card-left">
                      <span className="ag-category">{categoriaLabel(a)}</span>
                      <h3>{a.cartorio_nome}</h3>
                    </div>
                    <span className={badge.cls}>{badge.label}</span>
                  </div>

                  <div className="ag-card-mid">
                    <div className="ag-row">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <span>{date}</span>
                    </div>
                    <div className="ag-row">
                      <span className="material-symbols-outlined">schedule</span>
                      <span>{time}</span>
                    </div>
                  </div>

                  <div className="ag-actions">
                    <button
                      className="ag-btn ag-btn--primary"
                      type="button"
                      onClick={() => handleVisualizar(a)}
                    >
                      Visualizar
                    </button>

                    <button
                      className="ag-btn ag-btn--ghost"
                      type="button"
                      onClick={() => handleCancelar(a)}
                      disabled={isCanceled || isCancelling}
                      title={isCanceled ? "Agendamento já cancelado" : "Cancelar agendamento"}
                    >
                      {isCancelling ? "Cancelando..." : "Cancelar"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <div className="loadmore-wrap">
            <button className="btn-loadmore" type="button">
              Ver histórico completo
              <span className="material-symbols-outlined">history</span>
            </button>
          </div>
        </>
      )}

      <AgendamentoDetalhesModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        agendamentoId={viewId}
        initialAgendamento={viewInitial}
      />
    </div>
  );
}