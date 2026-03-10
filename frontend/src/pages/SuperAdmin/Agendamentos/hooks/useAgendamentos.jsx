import { useEffect, useState } from "react";

/**
 * MOCK (até integrar API)
 * - inclui documentos por agendamento (pra contagem e preview)
 */
const MOCK_AGENDAMENTOS = [
  {
    id: 1,
    cliente_nome: "João da Silva",
    cartorio_nome: "Cartório Central",
    data: "18/10/2026 09:30",
    status: "confirmado",
    documentos: [
      { id: 1, nome: "Certidão de Casamento", categoria: "certidoes" },
      { id: 2, nome: "Certidão de Nascimento", categoria: "certidoes" },
      { id: 3, nome: "Rec. de Firma", categoria: "identificacao" },
    ],
  },
  {
    id: 2,
    cliente_nome: "Maria Oliveira",
    cartorio_nome: "Cartório Oliveira",
    data: "19/10/2026 14:00",
    status: "pendente",
    documentos: [{ id: 1, nome: "RG", categoria: "identificacao" }],
  },
  {
    id: 3,
    cliente_nome: "Carlos Pereira",
    cartorio_nome: "Cartório Central",
    data: "20/10/2026 11:15",
    status: "cancelado",
    documentos: [],
  },
  {
    id: 4,
    cliente_nome: "Ana Costa",
    cartorio_nome: "Cartório Zona Sul",
    data: "21/10/2026 16:45",
    status: "confirmado",
    documentos: [{ id: 1, nome: "Comprovante de residência", categoria: "endereco" }],
  },
  {
    id: 5,
    cliente_nome: "Ricardo Mendes",
    cartorio_nome: "Cartório Zona Norte",
    data: "22/10/2026 10:00",
    status: "pendente",
    documentos: [],
  },
];

export default function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [modalType, setModalType] = useState(null);
  // modalType: "visualizar" | "reagendar" | "documentos" | null

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setAgendamentos(MOCK_AGENDAMENTOS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const openVisualizar = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalType("visualizar");
  };

  const openReagendar = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setModalType("reagendar");
  };

  const openDocumentos = (agendamento) => {
    // IMPORTANTÍSSIMO: só chamar isso a partir do botão VER no modal
    setSelectedAgendamento(agendamento);
    setModalType("documentos");
  };

  const closeModals = () => {
    setSelectedAgendamento(null);
    setModalType(null);
  };

  /**
   * Reagendar (mock/local)
   * - atualiza data
   * - muda status para "confirmado"
   *
   * ⚠️ Para persistir:
   * precisamos que o backend faça PATCH /agendamentos/:id
   * aceitando { data, status } e salvando no banco.
   */
  const reagendarLocal = async ({ id, data }) => {
    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, data, status: "confirmado" } : a
      )
    );

    setSelectedAgendamento((prev) =>
      prev?.id === id ? { ...prev, data, status: "confirmado" } : prev
    );
  };

  return {
    agendamentos,
    loading,
    selectedAgendamento,
    modalType,

    openVisualizar,
    openReagendar,
    openDocumentos,
    closeModals,

    reagendarLocal,
  };
}
