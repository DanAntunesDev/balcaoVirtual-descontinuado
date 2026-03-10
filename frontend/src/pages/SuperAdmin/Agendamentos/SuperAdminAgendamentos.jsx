import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Eye, CalendarClock, FileText, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import useAgendamentos from "./hooks/useAgendamentos";

import AgendamentoModal from "./components/AgendamentoModal";
import ReagendarModal from "./components/ReagendarModal";
import DocumentsUploader from "./components/DocumentsUploader";
import StatusBadge from "./components/StatusBadge";

const SuperAdminAgendamentos = () => {
  const {
    agendamentos,
    loading,
    selectedAgendamento,
    modalType,
    openVisualizar,
    openReagendar,
    openDocumentos,
    closeModals,
    reagendarLocal,
  } = useAgendamentos();

  const stats = useMemo(() => {
    const total = agendamentos.length;
    const confirmados = agendamentos.filter(
      (a) => a.status === "confirmado"
    ).length;
    const pendentes = agendamentos.filter(
      (a) => a.status === "pendente"
    ).length;
    const cancelados = agendamentos.filter(
      (a) => a.status === "cancelado"
    ).length;

    return { total, confirmados, pendentes, cancelados };
  }, [agendamentos]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Agendamentos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestão completa dos agendamentos realizados no sistema.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ResumoCard
          title="TOTAL"
          value={stats.total}
          icon={<CalendarClock className="h-4 w-4 text-slate-500" />}
        />
        <ResumoCard
          title="CONFIRMADOS"
          value={stats.confirmados}
          icon={<CalendarClock className="h-4 w-4 text-emerald-500" />}
        />
        <ResumoCard
          title="PENDENTES"
          value={stats.pendentes}
          icon={<CalendarClock className="h-4 w-4 text-amber-500" />}
        />
        <ResumoCard
          title="CANCELADOS"
          value={stats.cancelados}
          icon={<CalendarClock className="h-4 w-4 text-rose-500" />}
        />
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/80">
              <tr>
                <Th>Cliente</Th>
                <Th>Cartório</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th align="right">Ações</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Carregando agendamentos...
                  </td>
                </tr>
              ) : agendamentos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                agendamentos.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60">
                    <Td>{a.cliente_nome || "-"}</Td>
                    <Td>{a.cartorio_nome || "-"}</Td>
                    <Td>{a.data || "-"}</Td>
                    <Td>
                      <StatusBadge status={a.status} />
                    </Td>

                    <Td align="right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          label="Visualizar"
                          onClick={() => openVisualizar(a)}
                        >
                          <Eye className="h-4 w-4" />
                        </IconButton>

                        <IconButton
                          label="Reagendar"
                          onClick={() => openReagendar(a)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </IconButton>

                        {/* Regra: modal de documentos NÃO abre direto daqui.
                            Aqui a gente abre os detalhes e o usuário clica em VER lá dentro. */}
                        <IconButton
                          label="Documentos"
                          onClick={() => openDocumentos(a)}
                        >
                          <FileText className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais */}
      <AgendamentoModal
        open={modalType === "visualizar"}
        agendamento={selectedAgendamento}
        onClose={closeModals}
        onOpenDocumentos={(ag) => openDocumentos(ag)}
      />

      <ReagendarModal
        open={modalType === "reagendar"}
        agendamento={selectedAgendamento}
        onClose={closeModals}
        onConfirm={async ({ id, data }) => {
          // mock/local
          await reagendarLocal({ id, data });
        }}
      />

      <DocumentsUploader
        open={modalType === "documentos"}
        agendamento={selectedAgendamento}
        onClose={closeModals}
        onUploaded={(doc) => {
          // opcional: quando tiver backend/refresh, atualizamos lista
          // por enquanto, só feedback
          console.log("Documento enviado:", doc);
        }}
        // categories={...} // <- no futuro: vir do backend (categorias criadas no SuperAdmin)
      />
    </div>
  );
};

/* ---------- Auxiliares ---------- */

const Th = ({ children, align }) => (
  <th
    className={cn(
      "px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500",
      align === "right" && "text-right"
    )}
  >
    {children}
  </th>
);

const Td = ({ children, align }) => (
  <td
    className={cn(
      "px-4 py-3 text-sm text-slate-700",
      align === "right" && "text-right"
    )}
  >
    {children}
  </td>
);

const IconButton = ({ children, label, onClick }) => (
  <Button
    size="icon"
    variant="ghost"
    onClick={onClick}
    title={label}
    aria-label={label}
  >
    {children}
  </Button>
);

const ResumoCard = ({ title, value, icon }) => (
  <div className="flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </p>
      <div className="rounded-full bg-slate-50 p-1.5">{icon}</div>
    </div>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
  </div>
);

export default SuperAdminAgendamentos;
