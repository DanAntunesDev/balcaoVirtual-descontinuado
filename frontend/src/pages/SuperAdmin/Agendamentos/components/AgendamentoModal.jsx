import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value}</span>
  </div>
);

export default function AgendamentoModal({
  open,
  agendamento,
  onClose,
  onOpenDocumentos, // <-- importante: abrir DocumentsUploader SOMENTE via VER
}) {
  const docs = useMemo(() => {
    // preferir o que vier do backend no futuro: agendamento.documentos
    return agendamento?.documentos || [];
  }, [agendamento]);

  const docsCount = docs.length;

  return (
    <Dialog
      open={!!open}
      onOpenChange={(v) => {
        // ESC / clique fora
        if (!v) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Detalhes do agendamento
          </DialogTitle>
        </DialogHeader>

        {!agendamento ? (
          <div className="py-6 text-sm text-slate-500">Nenhum agendamento selecionado.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* COLUNA ESQUERDA */}
            <div className="space-y-3">
              <InfoRow label="Cliente" value={agendamento.cliente_nome || "-"} />
              <InfoRow label="Cartório" value={agendamento.cartorio_nome || "-"} />
              <InfoRow label="Data" value={agendamento.data || "-"} />

              {/* Status dentro do quadrinho, alinhado */}
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                <span className="text-sm text-slate-500">Status</span>
                <StatusBadge status={agendamento.status} />
              </div>

              {/* Documentos | X documentos | VER */}
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                <span className="text-sm text-slate-500">Documentos</span>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-900">
                    {docsCount} documento{docsCount === 1 ? "" : "s"}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onOpenDocumentos?.(agendamento)}
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    VER
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>

            {/* COLUNA DIREITA - lista de documentos enviados (preview) */}
            <div className="rounded-xl border border-slate-100 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-medium text-slate-800">
                  Documentos Enviados
                </p>
                <p className="text-xs text-slate-500">
                  Visualização rápida (abra em <b>VER</b> para gerenciar/anexar).
                </p>
              </div>

              {docsCount === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  Nenhum documento enviado.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {docs.map((d, idx) => (
                    <li
                      key={d.id ?? idx}
                      className="px-4 py-3 text-sm text-slate-700 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {d.nome || "Documento"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {d.categoria || "Sem categoria"}
                        </p>
                      </div>

                      <span className="text-xs text-slate-400">OK</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
