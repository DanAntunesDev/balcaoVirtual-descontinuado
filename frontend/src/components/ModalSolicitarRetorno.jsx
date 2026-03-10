import { useEffect, useMemo, useState } from "react";
import { X, MapPin, Phone, User, CalendarDays, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://127.0.0.1:8000/api";

function maskPhone(v = "") {
  return v
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

export default function ModalSolicitarRetorno({ cartorio, onClose }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const [horariosBrutos, setHorariosBrutos] = useState([]);
  const [selectedHora, setSelectedHora] = useState("");

  // ===================== FECHAR COM ESC =====================
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // ===================== BUSCAR HORÁRIOS DA API =====================
  useEffect(() => {
    async function fetchHorarios() {
      if (!cartorio?.id || !selectedDate) return;
      try {
        setLoading(true);
        const dataISO = selectedDate.toISOString().slice(0, 10);
        const { data } = await axios.get(
          `${API_URL}/get_horarios/?cartorio_id=${cartorio.id}&dia=${dataISO}`
        );

        const lista =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.horarios)
            ? data.horarios
            : [];

        setHorariosBrutos(lista);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível carregar horários disponíveis.");
      } finally {
        setLoading(false);
      }
    }

    fetchHorarios();
  }, [cartorio?.id, selectedDate]);

  const daysGrid = useMemo(() => {
    const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startOffset = firstDay.getDay();

    const grid = [];
    for (let i = 0; i < startOffset; i++) grid.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      grid.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [cursor]);

  const isToday = (d) =>
    d &&
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const headerTitle = `${cursor.toLocaleString("pt-BR", {
    month: "long",
  })} de ${cursor.getFullYear()}`;

  async function handleSubmit() {
    if (!nome.trim()) return toast.error("Informe seu nome completo.");
    if (!telefone.trim()) return toast.error("Informe um número de telefone.");
    if (!selectedDate) return toast.error("Selecione a data do atendimento.");
    if (!selectedHora) return toast.error("Selecione um horário disponível.");

    try {
      setSending(true);
      const payload = {
        cartorio_id: cartorio?.id,
        nome_completo: nome.trim(),
        telefone,
        data: selectedDate.toISOString().slice(0, 10),
        hora: selectedHora,
      };

      await axios.post(`${API_URL}/solicitar-retorno/`, payload);
      toast.success("Solicitação enviada! Em breve o cartório retornará o contato.");
      onClose?.();
    } catch (e) {
      console.error(e);
      toast.error("Falha ao solicitar retorno. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#6f3ad9] via-[#804fd8] to-[#9b6eff]" />
          <div className="relative bg-white/10 backdrop-blur-xl p-6 sm:p-8 text-white">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 text-white/80 hover:text-white"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-1">
              Solicitar Retorno
            </h2>
            <p className="text-center text-white/80 mb-5">
              {cartorio?.nome || "Cartório"}
            </p>

            <div className="mb-6 rounded-xl border border-white/15 bg-white/10 p-4 grid sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={16} /> {cartorio?.cidade || "-"}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} /> {cartorio?.telefone || "-"}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} /> Horário:{" "}
                {cartorio?.horarioAbertura || "08:00"} -{" "}
                {cartorio?.horarioFechamento || "17:00"}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* COLUNA ESQUERDA */}
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm text-white/90 flex items-center gap-2 mb-1">
                    <User size={16} /> Nome completo
                  </span>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-white/15 border border-white/25 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/40 placeholder-white/70"
                    placeholder="Seu nome completo"
                  />
                </label>

                <label className="block">
                  <span className="text-sm text-white/90 flex items-center gap-2 mb-1">
                    <Phone size={16} /> Número de telefone
                  </span>
                  <input
                    inputMode="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(maskPhone(e.target.value))}
                    className="w-full bg-white/15 border border-white/25 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-white/40 placeholder-white/70"
                    placeholder="(00) 00000-0000"
                  />
                </label>

                <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span className="font-medium capitalize">
                        {headerTitle}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCursor(
                            new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                          )
                        }
                        className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() =>
                          setCursor(
                            new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                          )
                        }
                        className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/15"
                      >
                        ›
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-white/80 mb-1">
                    {weekLabels.map((l) => (
                      <div key={l} className="py-1">
                        {l}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {daysGrid.map((d, idx) => {
                      if (!d) return <div key={idx} className="h-9" />;
                      const selected =
                        selectedDate &&
                        d.toDateString() === selectedDate.toDateString();
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(d)}
                          className={`h-9 rounded-lg text-sm transition ${
                            selected
                              ? "bg-white text-[#804fd8] font-semibold"
                              : "bg-white/10 text-white hover:bg-white/15"
                          } ${
                            isToday(d) && !selected
                              ? "ring-1 ring-white/40"
                              : ""
                          }`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA */}
              <div className="rounded-xl border border-white/15 bg-white/10 p-3">
                <p className="text-sm text-white/90 mb-2 flex items-center gap-2">
                  <Clock size={16} /> Escolha um horário disponível:
                </p>

                {loading ? (
                  <div className="py-10 text-center text-white/80">
                    Carregando…
                  </div>
                ) : !selectedDate ? (
                  <div className="py-10 text-center text-white/80">
                    Selecione uma data para ver os horários.
                  </div>
                ) : horariosBrutos.length === 0 ? (
                  <div className="py-10 text-center text-white/80">
                    Nenhum horário disponível para este dia.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                    {horariosBrutos.map((h) => {
                      const active = selectedHora === h;
                      return (
                        <button
                          key={h}
                          onClick={() => setSelectedHora(h)}
                          className={`py-2 rounded-lg border text-sm transition font-medium ${
                            active
                              ? "bg-white text-[#804fd8]"
                              : "border-white/35 text-white hover:bg-white/10"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className="w-full mt-5 py-3 rounded-xl font-semibold bg-white text-[#804fd8] hover:bg-purple-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? "Enviando…" : "Confirmar solicitação de retorno"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
