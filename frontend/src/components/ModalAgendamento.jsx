// src/components/ModalAgendamento.jsx
import { useEffect, useMemo, useState } from "react";
import { X, Loader2, MapPin, Phone, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000/api";

const fmtISO = (d) => d.toISOString().split("T")[0];

export default function ModalAgendamento({ cartorio, onClose }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [diasMes, setDiasMes] = useState([]);
  const [loadingDias, setLoadingDias] = useState(true);

  const [horarios, setHorarios] = useState([]);
  const [loadingHrs, setLoadingHrs] = useState(true);
  const [selectedHora, setSelectedHora] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // ================= FECHAR COM ESC =================
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ================= CALENDÁRIO =================
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoadingDias(true);
      try {
        const base = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        );
        const daysInMonth = new Date(
          base.getFullYear(),
          base.getMonth() + 1,
          0
        ).getDate();
        const hojeISO = fmtISO(new Date());

        const lista = [];
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(base.getFullYear(), base.getMonth(), d);
          const iso = fmtISO(dt);
          const isDomingo = dt.getDay() === 0;
          const isFeriado = d === 15;
          const isAberto = !isDomingo && !isFeriado;
          lista.push({
            dia: d,
            iso,
            isHoje: iso === hojeISO,
            isFeriado,
            isAberto,
          });
        }

        const primeiroDiaSemana = new Date(
          base.getFullYear(),
          base.getMonth(),
          1
        ).getDay();
        for (let i = 0; i < primeiroDiaSemana; i++) {
          lista.unshift({
            dia: "",
            iso: `empty-${i}`,
            isAberto: false,
            empty: true,
          });
        }

        if (!cancel) setDiasMes(lista);
      } catch (e) {
        console.error(e);
        if (!cancel) toast.error("Falha ao carregar dias disponíveis.");
      } finally {
        if (!cancel) setLoadingDias(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [selectedDate]);

  // ================= HORÁRIOS DISPONÍVEIS (API REAL) =================
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!cartorio?.id || !selectedDate) return;
      setLoadingHrs(true);
      setSelectedHora(null);
      try {
        const dataISO = fmtISO(selectedDate);
        const { data } = await axios.get(
          `${API_URL}/get_horarios/?cartorio_id=${cartorio.id}&dia=${dataISO}`
        );

        const lista =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.horarios)
            ? data.horarios
            : [];

        if (!cancel) setHorarios(lista);
      } catch (e) {
        console.error(e);
        if (!cancel) toast.error("Falha ao carregar horários disponíveis.");
      } finally {
        if (!cancel) setLoadingHrs(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [cartorio?.id, selectedDate]);

  const tituloMes = useMemo(() => {
    const f = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return f.format(selectedDate);
  }, [selectedDate]);

  // ================= CONFIRMAR AGENDAMENTO =================
  async function agendar() {
    if (!selectedHora) return toast.error("Selecione um horário disponível.");
    setEnviando(true);
    try {
      await axios.post(`${API_URL}/post_atendimento/`, {
        cartorio_id: cartorio.id,
        data: fmtISO(selectedDate),
        horario: selectedHora,
      });
      toast.success("Agendamento realizado com sucesso!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao tentar agendar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(128,79,216,0.3)] border border-white/10 bg-[#804fd8]/40 backdrop-blur-2xl text-white"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative p-6">
            {/* FECHAR */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            {/* CABEÇALHO */}
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-2">
              Agendar horário
            </h2>
            <p className="text-center text-white/80 mb-5">
              {cartorio?.nome || "Cartório"}
            </p>

            {/* INFORMAÇÕES DO CARTÓRIO */}
            <div className="mb-6 rounded-xl border border-white/20 bg-white/10 p-4 flex flex-col sm:flex-row gap-4 justify-between text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="opacity-90" />
                <span>{cartorio?.cidade}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="opacity-90" />
                <span>{cartorio?.telefone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="opacity-90" />
                <span>
                  {cartorio?.horarioAbertura} - {cartorio?.horarioFechamento}
                </span>
              </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CALENDÁRIO */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{tituloMes}</h3>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 text-sm rounded bg-white/10 hover:bg-white/20"
                      onClick={() => {
                        const d = new Date(selectedDate);
                        setSelectedDate(new Date(d.getFullYear(), d.getMonth() - 1, 1));
                      }}
                    >
                      ◀
                    </button>
                    <button
                      className="px-2 py-1 text-sm rounded bg-white/10 hover:bg-white/20"
                      onClick={() => {
                        const d = new Date(selectedDate);
                        setSelectedDate(new Date(d.getFullYear(), d.getMonth() + 1, 1));
                      }}
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-center text-xs mb-1 text-white/70 select-none">
                  {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                    <div key={i} className="font-medium py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {loadingDias ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {diasMes.map((d) =>
                      d.empty ? (
                        <div key={d.iso} />
                      ) : (
                        <button
                          key={d.iso}
                          disabled={!d.isAberto}
                          onClick={() => setSelectedDate(new Date(d.iso))}
                          className={[
                            "py-2 rounded-lg transition-all font-medium border",
                            d.isHoje ? "border-white/70" : "border-white/20",
                            fmtISO(selectedDate) === d.iso
                              ? "bg-white text-[#804fd8]"
                              : d.isFeriado
                              ? "bg-red-400/30 text-white/70 cursor-not-allowed"
                              : d.isAberto
                              ? "hover:bg-white/15"
                              : "bg-gray-500/20 text-white/50 cursor-not-allowed",
                          ].join(" ")}
                        >
                          {d.dia}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-4 mt-4 text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-white/80"></span> Disponível
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-red-400/70"></span> Feriado
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded border border-white"></span> Hoje
                  </div>
                </div>
              </div>

              {/* HORÁRIOS */}
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 flex flex-col">
                <h3 className="text-lg font-semibold mb-3 text-center">
                  Escolha um horário disponível:
                </h3>

                {loadingHrs ? (
                  <div className="flex-1 flex items-center justify-center py-6">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : horarios.length ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {horarios.map((h) => {
                      const isSel = h === selectedHora;
                      return (
                        <button
                          key={h}
                          onClick={() => setSelectedHora(h)}
                          className={[
                            "py-2 rounded-lg font-medium border transition-all",
                            isSel
                              ? "bg-white text-[#804fd8] border-white"
                              : "border-white/30 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-white/80">
                    Nenhum horário disponível.
                  </p>
                )}

                <button
                  onClick={agendar}
                  disabled={!selectedHora || enviando}
                  className={[
                    "mt-4 w-full py-3 rounded-xl font-semibold transition-all",
                    !selectedHora || enviando
                      ? "bg-white/30 text-white/70 cursor-not-allowed"
                      : "bg-white text-[#804fd8] hover:bg-purple-100",
                  ].join(" ")}
                >
                  {enviando ? "Enviando..." : "Confirmar agendamento"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
