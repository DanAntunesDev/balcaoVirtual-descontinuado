import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReagendarModal({ open, agendamento, onClose, onConfirm }) {
  const [novaData, setNovaData] = useState("");
  const [novoHorario, setNovoHorario] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // reset quando abrir
    if (open) {
      setNovaData("");
      setNovoHorario("");
      setLoading(false);
    }
  }, [open]);

  async function handleConfirm() {
    if (!agendamento?.id) return;
    if (!novaData || !novoHorario) {
      alert("Informe a nova data e o novo horário.");
      return;
    }

    const dataFormatada = `${novaData} ${novoHorario}`; // mantendo o padrão do mock "DD/MM/AAAA HH:MM"

    setLoading(true);
    try {
      await onConfirm?.({
        id: agendamento.id,
        data: dataFormatada,
      });
      onClose?.();
    } catch (e) {
      console.error(e);
      alert("Erro ao reagendar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={!!open}
      onOpenChange={(v) => {
        if (!v) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Reagendar</DialogTitle>
        </DialogHeader>

        {!agendamento ? (
          <div className="py-6 text-sm text-slate-500">
            Nenhum agendamento selecionado.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Nova data (DD/MM/AAAA)
              </label>
              <Input
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                placeholder="Ex: 25/10/2026"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Novo horário (HH:MM)
              </label>
              <Input
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
                placeholder="Ex: 14:30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
