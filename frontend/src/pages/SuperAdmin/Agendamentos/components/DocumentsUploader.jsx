import React, { useMemo, useRef, useState } from "react";
import api from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEFAULT_CATEGORIES = [
  { value: "identificacao", label: "Identificação" },
  { value: "estado_civil", label: "Estado civil" },
  { value: "filiacao", label: "Filiação" },
  { value: "endereco", label: "Endereço" },
  { value: "certidoes", label: "Certidões" },
];

export default function DocumentsUploader({
  open,
  agendamento,
  onClose,
  onUploaded,
  categories, // <-- categorias vindas do superadmin (quando tiver backend)
}) {
  const agendamentoId = agendamento?.id;

  const docs = useMemo(() => {
    return agendamento?.documentos || [];
  }, [agendamento]);

  const CATEGORIAS = (categories?.length ? categories : DEFAULT_CATEGORIES).map(
    (c) => (typeof c === "string" ? { value: c, label: c } : c)
  );

  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);

  async function handleUpload(e) {
    e.preventDefault();
    if (!agendamentoId) return;
    if (!file || !nome || !categoria) {
      alert("Preencha nome, categoria e selecione um arquivo.");
      return;
    }

    const formData = new FormData();
    formData.append("agendamento", agendamentoId);
    formData.append("nome", nome);
    formData.append("categoria", categoria);
    formData.append("arquivo", file);

    setLoading(true);
    try {
      const { data } = await api.post("/agendamentos/documentos/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUploaded?.(data);

      // limpa
      setNome("");
      setCategoria("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      alert("Documento enviado com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar documento:", err);
      alert("Erro ao enviar documento.");
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900">
            Documentos do agendamento #{agendamentoId ?? "-"}
          </DialogTitle>
        </DialogHeader>

        {/* Lista */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="px-4 py-3 text-sm font-medium text-slate-700 border-b border-slate-100">
            Enviados
          </div>

          {docs.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              Nenhum documento enviado.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {docs.map((d, idx) => (
                <li
                  key={d.id ?? idx}
                  className="px-4 py-3 text-sm text-slate-700 flex justify-between"
                >
                  <span className="min-w-0">
                    <span className="font-medium text-slate-800">
                      {d.nome || "Documento"}
                    </span>{" "}
                    <span className="text-slate-400">
                      — {d.categoria || "Sem categoria"}
                    </span>
                  </span>
                  <span className="text-slate-400">OK</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upload */}
        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Nome / tipo do documento
              </label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Certidão de Nascimento"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* IMPORTANTE: backend precisa fornecer essas categorias */}
              <p className="text-xs text-slate-400 mt-1">
                *Para travar categorias de verdade, precisamos que o backend exponha
                as categorias cadastradas no SuperAdmin.
              </p>
            </div>
          </div>

          {/* File input bonito */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Arquivo</label>

            <div className="flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="border-slate-200"
              >
                Procurar
              </Button>

              <span className="text-sm text-slate-600 truncate">
                {file ? file.name : "Nenhum arquivo selecionado."}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Adicionar documento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
