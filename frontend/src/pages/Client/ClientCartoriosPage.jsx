import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgendarModal from "@/components/modals/AgendarModal";
import SolicitarRetornoModal from "@/components/modals/SolicitarRetornoModal";
import {
  getPendingIntent,
  clearPendingIntent,
} from "@/domain/navigation/pendingIntentService";
import { listPublicCartorios } from "@/services/cartorioService";
import { getToken } from "@/domain/auth/tokenService";

import "./Client.css";

const ICON_BY_TIPO = {
  notas: "account_balance",
  protesto: "gavel",
  registro_civil: "fingerprint",
  imoveis: "home_work",
  titulos_documentos: "history_edu",
  notas_registro: "edit_note",
  documentos: "description",
};

function getTipoKey(cartorio) {
  const t = cartorio?.tipo;

  if (!t) return "";
  if (typeof t === "string") return t.toLowerCase();
  if (typeof t?.nome === "string") return t.nome.toLowerCase();
  if (typeof cartorio?.tipo_label === "string") return cartorio.tipo_label.toLowerCase();

  return "";
}

function getIconName(cartorio) {
  if (cartorio?.icon) return cartorio.icon;
  const tipoKey = getTipoKey(cartorio);
  return ICON_BY_TIPO[tipoKey] || "account_balance";
}

function parseHorarioRange(horario) {
  if (!horario) return null;

  const s = String(horario);
  const m = s.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;

  const h1 = Number(m[1]);
  const min1 = Number(m[2]);
  const h2 = Number(m[3]);
  const min2 = Number(m[4]);

  if (
    Number.isNaN(h1) || Number.isNaN(min1) ||
    Number.isNaN(h2) || Number.isNaN(min2)
  ) return null;

  return {
    aberturaMin: h1 * 60 + min1,
    fechamentoMin: h2 * 60 + min2,
  };
}

function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

function getHorarioStatus(cartorio, now) {
  const statusRaw = normalizeStatus(cartorio?.status);

  // Se cartório está inativo/fechado por status administrativo, mantém fechado
  if (["fechado", "inativo", "suspenso", "arquivado"].includes(statusRaw)) {
    return { label: "Fechado", className: "status-pill status-danger" };
  }

  const range = parseHorarioRange(cartorio?.horario);
  if (!range) {
    // fallback simples pelo status
    if (["aberto", "ativo"].includes(statusRaw) || statusRaw === "aberto") {
      return { label: "Aberto", className: "status-pill status-open" };
    }
    return { label: "Fechado", className: "status-pill status-danger" };
  }

  const nowMin = now.getHours() * 60 + now.getMinutes();

  const { aberturaMin, fechamentoMin } = range;

  // Fechado após o horário de fechamento (mesmo que 1 min)
  if (nowMin > fechamentoMin) {
    return { label: "Fechado", className: "status-pill status-danger" };
  }

  // Antes de abrir
  if (nowMin < aberturaMin) {
    if (nowMin >= aberturaMin - 60) {
      return { label: "Abertura em breve", className: "status-pill status-warning" };
    }
    return { label: "Fechado", className: "status-pill status-danger" };
  }

  // Dentro do horário (abertura <= now <= fechamento)
  if (nowMin >= fechamentoMin - 60) {
    return { label: "Fecha em breve", className: "status-pill status-warning" };
  }

  return { label: "Aberto", className: "status-pill status-open" };
}

export default function ClientCartoriosPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [retornoOpen, setRetornoOpen] = useState(false);
  const [selectedCartorio, setSelectedCartorio] = useState(null);

  const [cartoriosBase, setCartoriosBase] = useState([]);

  // tick para recalcular status por horário
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);

  function handleAction(cartorio, action) {
    setSelectedCartorio(cartorio);
    action === "agendar" ? setAgendarOpen(true) : setRetornoOpen(true);
  }

  // Carrega lista (API real com fallback)
  useEffect(() => {
    let alive = true;

    (async () => {
      const data = await listPublicCartorios();
      if (!alive) return;
      setCartoriosBase(Array.isArray(data) ? data : []);
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Reabre modal vindo de navegação (fallback legado)
  useEffect(() => {
    if (location.state?.cartorio && location.state?.action) {
      const { cartorio, action } = location.state;

      setSelectedCartorio(cartorio);

      if (action === "agendar") setAgendarOpen(true);
      else setRetornoOpen(true);

      clearPendingIntent();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Reabre modal via pendingIntent (pós-login)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const intent = getPendingIntent();
    if (!intent?.action) return;

    const action = intent.action;
    const fromIntent = intent.cartorio || null;

    let target = fromIntent;
    if (fromIntent?.id && Array.isArray(cartoriosBase) && cartoriosBase.length) {
      const found = cartoriosBase.find((c) => c?.id === fromIntent.id);
      if (found) target = found;
    }

    if (!target) return;

    setSelectedCartorio(target);
    if (action === "agendar") setAgendarOpen(true);
    else setRetornoOpen(true);

    clearPendingIntent();
  }, [cartoriosBase]);

  const normalize = (str) =>
    str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const cartorios = useMemo(() => {
    const q = normalize(search?.trim());
    if (!q) return cartoriosBase;

    return cartoriosBase.filter((c) => {
      const hay = normalize(
        [
          c.nome,
          c.cidade,
          c.uf,
          c.endereco,
          c?.tipo?.nome,
          c?.tipo_label,
          ...(c.servicos || []),
        ]
          .filter(Boolean)
          .join(" ")
      );
      return hay.includes(q);
    });
  }, [search, cartoriosBase]);

  return (
    <>
      {/* SEARCH CENTRALIZADA */}
      <div
        className="search-wrap"
        style={{
          margin: "40px auto 32px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="searchbar"
          style={{
            width: "520px",
          }}
        >
          <span className="material-symbols-outlined">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cartórios por nome, cidade ou serviço..."
          />
        </div>
      </div>

      {/* CARDS */}
      <section className="client-cards-grid">
        {cartorios.map((c) => {
          const st = getHorarioStatus(c, now);

          return (
            <article key={c.id ?? c.nome} className="cartorio-card">
              <div className="card-top">
                <div className="icon-badge">
                  <span className="material-symbols-outlined">
                    {getIconName(c)}
                  </span>
                </div>

                <span className={st.className}>
                  {st.label}
                </span>
              </div>

              <div className="card-body">
                <h3>{c.nome}</h3>

                {c.endereco && (
                  <div className="meta">
                    <span className="material-symbols-outlined">location_on</span>
                    <span>{c.endereco}</span>
                  </div>
                )}

                {c.cidade && (
                  <p className="small">
                    {c.cidade} - {c.uf}
                  </p>
                )}

                {c.telefone && (
                  <div className="meta small">
                    <span className="material-symbols-outlined">call</span>
                    <span>{c.telefone}</span>
                  </div>
                )}

                {c.horario && (
                  <div className="meta small">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>{c.horario}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleAction(c, "agendar")}
                >
                  Agendar Atendimento
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleAction(c, "retorno")}
                >
                  Solicitar Retorno
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* LOAD MORE */}
      <div className="loadmore-wrap">
        <button className="btn-loadmore" type="button">
          Carregar mais cartórios
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </div>

      <AgendarModal
        open={agendarOpen}
        onClose={() => setAgendarOpen(false)}
        cartorio={selectedCartorio}
      />

      <SolicitarRetornoModal
        open={retornoOpen}
        onClose={() => setRetornoOpen(false)}
        cartorio={selectedCartorio}
      />
    </>
  );
}