import {
  BsGeoAlt,
  BsMap,
  BsTelephone,
  BsClock,
  BsHeadset,
  BsTelephoneOutbound,
} from "react-icons/bs";
import { useState, useEffect } from "react";
import ModalAgendamento from "./ModalAgendamento";
import ModalSolicitarRetorno from "./ModalSolicitarRetorno";

/**
 * CartorioCard - Card individual de cartório
 * 
 * Design System: Roxo Puro (#583080)
 * - Fundo: Branco
 * - Borda: Roxo claro (#eceaf0) com hover roxo
 * - Ícones: Roxo (#583080)
 * - Botões: Roxo sólido com hover mais escuro
 * - Status: Verde (aberto) / Cinza (fechado)
 * - Sombra: Suave com hover elevado
 */

export default function CartorioCard({
  id = 1,
  nome = "Cartório Central",
  cidade = "Itaberaba - BA",
  endereco = "Rua das Flores, 123",
  telefone = "(75) 3251-1936",
  horarioAbertura = "08:00",
  horarioFechamento = "17:00",
}) {
  const [aberto, setAberto] = useState(false);
  const [openAgendar, setOpenAgendar] = useState(false);
  const [openRetorno, setOpenRetorno] = useState(false);

  useEffect(() => {
    const agora = new Date();
    const horaAtual = agora.getHours() + agora.getMinutes() / 60;
    const [hA, mA] = horarioAbertura.split(":").map(Number);
    const [hF, mF] = horarioFechamento.split(":").map(Number);
    const inicio = hA + mA / 60;
    const fim = hF + mF / 60;
    setAberto(horaAtual >= inicio && horaAtual < fim);
  }, [horarioAbertura, horarioFechamento]);

  const cartorioData = {
    id,
    nome,
    cidade,
    telefone,
    horarioAbertura,
    horarioFechamento,
  };

  return (
    <>
      <div className="bg-white p-6 rounded-bv border-2 border-bv-card-border shadow-bv-card hover:shadow-bv-card-hover hover:border-bv-primary transition-all duration-200 flex flex-col justify-between h-full">
        {/* TOPO - NOME E STATUS */}
        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-bv-text-main leading-tight line-clamp-2">
              {nome}
            </h3>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide flex-shrink-0 ml-2 ${
                aberto
                  ? "bg-bv-success-bg text-bv-success-text"
                  : "bg-bv-closed-bg text-bv-closed-text"
              }`}
            >
              {aberto ? "Aberto" : "Fechado"}
            </span>
          </div>

          {/* DIVISOR */}
          <div className="h-px bg-bv-card-border mb-4" />

          {/* INFORMAÇÕES */}
          <div className="space-y-3 text-sm text-bv-text-muted">
            <p className="flex items-start gap-2">
              <BsGeoAlt size={16} className="text-bv-primary flex-shrink-0 mt-0.5" />
              <span>{cidade}</span>
            </p>
            <p className="flex items-start gap-2">
              <BsMap size={16} className="text-bv-primary flex-shrink-0 mt-0.5" />
              <span>{endereco}</span>
            </p>
            <p className="flex items-center gap-2">
              <BsTelephone size={16} className="text-bv-primary flex-shrink-0" />
              <span>{telefone}</span>
            </p>
            <p className="flex items-center gap-2">
              <BsClock size={16} className="text-bv-primary flex-shrink-0" />
              <span>{horarioAbertura} - {horarioFechamento}</span>
            </p>
          </div>
        </div>

        {/* DIVISOR */}
        <div className="h-px bg-bv-card-border my-4" />

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpenAgendar(true)}
            disabled={!aberto}
            className={`py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
              aberto
                ? "bg-bv-primary text-white hover:bg-bv-primary-soft shadow-sm hover:shadow-md active:scale-95"
                : "bg-bv-primary/30 text-white cursor-not-allowed opacity-60"
            }`}
          >
            <BsHeadset size={16} />
            Agendar Horário
          </button>

          <button
            type="button"
            onClick={() => setOpenRetorno(true)}
            className="border-2 border-bv-primary text-bv-primary py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200 hover:bg-bv-background-light active:scale-95 flex items-center justify-center gap-2"
          >
            <BsTelephoneOutbound size={16} />
            Solicitar Retorno
          </button>
        </div>
      </div>

      {openAgendar && (
        <ModalAgendamento
          cartorio={cartorioData}
          onClose={() => setOpenAgendar(false)}
        />
      )}
      {openRetorno && (
        <ModalSolicitarRetorno
          cartorio={cartorioData}
          onClose={() => setOpenRetorno(false)}
        />
      )}
    </>
  );
}
