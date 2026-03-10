import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

import { useEscapeKey } from "../../hooks/useEscapeKey";

// UI Components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";

// Services (PADRÃO NOVO)
import * as cartoriosService from "../../services/cartorios.service";
import * as municipiosService from "../../services/municipios.service";
import * as tiposCartorioService from "../../services/tiposCartorio.service";

// ---------------------------------------------
// Constantes
// ---------------------------------------------
const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

// Tipos padrão (fallback)
const DEFAULT_TIPOS = [
  { id: null, nome: "Cartório" },
  { id: null, nome: "Tabelionato" },
  { id: null, nome: "Ofício" },
];

// ---------------------------------------------
// Helpers (erros)
// ---------------------------------------------
function handleApiError(error, fallbackMessage) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 401) {
    toast.error("Sua sessão expirou. Faça login novamente.");
    return;
  }

  if ((status === 400 || status === 422) && data) {
    if (typeof data === "string") {
      toast.error(data);
      return;
    }

    if (typeof data === "object") {
      Object.entries(data).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (field === "non_field_errors") toast.error(msg);
            else toast.error(`${field}: ${msg}`);
          });
        } else if (typeof messages === "string") {
          toast.error(messages);
        }
      });
      return;
    }
  }

  if (status >= 500) {
    toast.error("Erro interno no servidor. Tente novamente mais tarde.");
    return;
  }

  toast.error(fallbackMessage);
}

// ---------------------------------------------
// Máscara de telefone
// ---------------------------------------------
function formatPhone(value) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const PHONE_REGEX = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// ---------------------------------------------
// Máscara CEP
// ---------------------------------------------
function formatCep(value) {
  if (!value) return "";
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// ---------------------------------------------
// Normalizador de horário
// ---------------------------------------------
function normalizeTime(value) {
  if (!value) return "";
  return String(value).slice(0, 5);
}

// ---------------------------------------------
// Normalização texto (pra evitar duplicados por acento/caixa)
// ---------------------------------------------
function normalizeText(value) {
  if (!value) return "";
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ---------------------------------------------
// Componente principal
// ---------------------------------------------
export default function SuperAdminCartoriosManager() {
  // -------------------------------------------
  // Estados principais
  // -------------------------------------------
  const [cartorios, setCartorios] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [tiposCartorio, setTiposCartorio] = useState(DEFAULT_TIPOS);

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null); // cartório em edição

  // Dropdowns (autocomplete)
  const [showMunicipiosDropdown, setShowMunicipiosDropdown] = useState(false);
  const [showTiposDropdown, setShowTiposDropdown] = useState(false);

  // Busca
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMunicipio, setSearchMunicipio] = useState("");
  const [searchTipo, setSearchTipo] = useState("");

  // Criação inline de município/tipo
  const [creatingMunicipio, setCreatingMunicipio] = useState(false);
  const [creatingTipo, setCreatingTipo] = useState(false);
  const [novoTipo, setNovoTipo] = useState("");
  const [newMunicipioData, setNewMunicipioData] = useState({
    nome: "",
    uf: "",
  });

  // Referências para click-outside
  const municipioDropdownRef = useRef(null);
  const tipoDropdownRef = useRef(null);

  // Modal de exclusão
  const [cartorioParaExcluir, setCartorioParaExcluir] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form (create/edit)
  const [formData, setFormData] = useState({
    nome: "",
    municipio_id: "",
    tipo_id: "",
    endereco: "",
    numero: "",
    cep: "",
    telefone: "",
    whatsapp: "",
    email: "",
    capacidade_diaria: "",
    abertura: "08:00",
    fechamento: "17:00",
    ativo: true,
  });

  // Loading para salvar
  const [isSaving, setIsSaving] = useState(false);

  // Loading específico para criação inline (Município/Tipo)
  const [isSavingMunicipioInline, setIsSavingMunicipioInline] = useState(false);
  const [isSavingTipoInline, setIsSavingTipoInline] = useState(false);

  // Estado de "buscando CEP" pra eu evitar spam e também mostrar feedback se quiser
  const [isCepLoading, setIsCepLoading] = useState(false);

  // ESC fecha modal
  useEscapeKey(() => {
    if (modalOpen) closeModal();
    if (cartorioParaExcluir) setCartorioParaExcluir(null);
  });

  // Helpers de fechamento
  function resetForm() {
    setFormData({
      nome: "",
      municipio_id: "",
      tipo_id: "",
      endereco: "",
      numero: "",
      cep: "",
      telefone: "",
      whatsapp: "",
      email: "",
      capacidade_diaria: "",
      abertura: "08:00",
      fechamento: "17:00",
      ativo: true,
    });

    setSearchMunicipio("");
    setSearchTipo("");

    setCreatingMunicipio(false);
    setCreatingTipo(false);
    setNovoTipo("");
    setNewMunicipioData({ nome: "", uf: "" });
  }

  function closeModal() {
    setModalOpen(false);
    setEditando(null);
    resetForm();
  }

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showMunicipiosDropdown &&
        municipioDropdownRef.current &&
        !municipioDropdownRef.current.contains(e.target)
      ) {
        setShowMunicipiosDropdown(false);
      }

      if (
        showTiposDropdown &&
        tipoDropdownRef.current &&
        !tipoDropdownRef.current.contains(e.target)
      ) {
        setShowTiposDropdown(false);
      }
    }

    if (showMunicipiosDropdown || showTiposDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMunicipiosDropdown, showTiposDropdown]);

  // Buscar dados iniciais (services)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          cartoriosService.list(),
          municipiosService.listMunicipios(),
          tiposCartorioService.listTiposCartorio(),
        ]);

        const [cartRes, munRes, tiposRes] = results;

        // CARTÓRIOS (obrigatório)
        if (cartRes.status === "fulfilled") {
          const list = Array.isArray(cartRes.value)
            ? cartRes.value
            : cartRes.value?.data ?? [];
          setCartorios(list || []);
        } else {
          throw cartRes.reason;
        }

        // MUNICÍPIOS (opcional)
        if (munRes.status === "fulfilled") {
          const list = Array.isArray(munRes.value)
            ? munRes.value
            : munRes.value?.data ?? [];
          setMunicipios(list || []);
        } else {
          console.warn("Erro ao carregar municípios", munRes.reason);
          setMunicipios([]);
        }

        // TIPOS (opcional com fallback)
        if (tiposRes.status === "fulfilled") {
          const raw = Array.isArray(tiposRes.value)
            ? tiposRes.value
            : tiposRes.value?.data ?? [];

          const normalizados = (raw || []).map((t) =>
            typeof t === "string" ? { id: null, nome: t } : t
          );

          setTiposCartorio(
            normalizados.length
              ? normalizados
              : DEFAULT_TIPOS.map((n) => ({ id: null, nome: n.nome }))
          );
        } else {
          setTiposCartorio(DEFAULT_TIPOS);
        }
      } catch (error) {
        console.error(error);
        handleApiError(error, "Erro ao carregar dados dos cartórios.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Helpers de labels (backend novo)
  function getMunicipioLabelFromObj(m) {
    if (!m) return "Não informado";
    if (typeof m === "string") return m;

    const nome = m?.nome ?? m?.municipio ?? "";
    const uf = m?.uf ? ` - ${m.uf}` : "";
    return nome ? `${nome}${uf}` : "Não informado";
  }

  function getTipoLabelFromObj(t) {
    if (!t) return "Não informado";
    if (typeof t === "string") return t;

    const nome = t?.nome ?? t?.tipo ?? "";
    return nome || "Não informado";
  }

  // Resolvedores de contrato
  function resolveMunicipio(cartorio, municipiosList) {
    if (cartorio?.municipio?.nome) return cartorio.municipio;
    if (!cartorio?.municipio_id) return null;

    return (
      (municipiosList || []).find((m) => m.id === cartorio.municipio_id) || null
    );
  }

  function resolveTipo(cartorio, tiposList) {
    if (cartorio?.tipo?.nome) return cartorio.tipo;
    if (!cartorio?.tipo_id) return null;

    return (tiposList || []).find((t) => t.id === cartorio.tipo_id) || null;
  }

  // Listas filtradas (busca)
  const cartoriosFiltered = useMemo(() => {
    const term = normalizeText(searchTerm);
    if (!term) return cartorios;

    return (cartorios || []).filter((c) => {
      const nome = normalizeText(c?.nome || "");
      const municipio = normalizeText(c?.municipio?.nome || c?.municipio || "");
      const tipo = normalizeText(c?.tipo?.nome || c?.tipo || "");
      return (
        nome.includes(term) || municipio.includes(term) || tipo.includes(term)
      );
    });
  }, [cartorios, searchTerm]);

  const municipiosFiltered = useMemo(() => {
    const term = normalizeText(searchMunicipio);
    if (!term) return municipios;

    return (municipios || []).filter((m) => {
      const label = normalizeText(
        `${m?.nome || ""}${m?.uf ? ` ${m.uf}` : ""}`
      );
      return label.includes(term);
    });
  }, [municipios, searchMunicipio]);

  const tiposFiltered = useMemo(() => {
    const term = normalizeText(searchTipo);
    if (!term) return tiposCartorio;

    return (tiposCartorio || []).filter((t) => {
      const label = normalizeText(t?.nome || "");
      return label.includes(term);
    });
  }, [tiposCartorio, searchTipo]);

  // CEP - ViaCEP (preenchimento automático)
  async function handleCepAutoFill(rawCep) {
    const digits = (rawCep || "").replace(/\D/g, "");
    if (digits.length !== 8) return;
    if (isCepLoading) return;

    try {
      setIsCepLoading(true);

      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (!res.ok || data?.erro) {
        toast.error("CEP não encontrado.");
        return;
      }

      const logradouro = data?.logradouro || "";
      const bairro = data?.bairro || "";
      const localidade = data?.localidade || "";
      const uf = data?.uf || "";

      const enderecoAuto = [logradouro, bairro].filter(Boolean).join(" - ");

      setFormData((prev) => ({
        ...prev,
        endereco: enderecoAuto || prev.endereco,
      }));

      if (localidade && uf && Array.isArray(municipios) && municipios.length) {
        const alvoNome = normalizeText(localidade);
        const alvoUf = normalizeText(uf);

        const found = municipios.find((m) => {
          const mNome = normalizeText(m?.nome || "");
          const mUf = normalizeText(m?.uf || "");
          return mNome === alvoNome && mUf === alvoUf;
        });

        if (found?.id) {
          setFormData((prev) => ({
            ...prev,
            municipio_id: String(found.id),
          }));
          setSearchMunicipio(getMunicipioLabelFromObj(found));
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Falha ao buscar CEP.");
    } finally {
      setIsCepLoading(false);
    }
  }

  // Submit (create/edit) - backend novo
  async function handleSubmit(e) {
    e.preventDefault();

    const requiredFields = [
      { key: "nome", label: "Nome" },
      { key: "municipio_id", label: "Município" },
      { key: "tipo_id", label: "Tipo" },
      { key: "endereco", label: "Endereço" },
      { key: "numero", label: "Número" },
      { key: "telefone", label: "Telefone" },
      { key: "capacidade_diaria", label: "Capacidade diária" },
    ];

    for (const field of requiredFields) {
      const value = formData[field.key];
      if (!value || String(value).trim() === "") {
        toast.error(`O campo "${field.label}" é obrigatório.`);
        return;
      }
    }

    if (!PHONE_REGEX.test(formData.telefone)) {
      toast.error("Telefone inválido.");
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      municipio_id: formData.municipio_id
        ? Number(formData.municipio_id)
        : null,

      tipo_id: formData.tipo_id
        ? Number(formData.tipo_id)
        : null,

      endereco: formData.endereco?.trim() || "",
      numero: formData.numero?.trim() || "",
      cep: formData.cep?.trim() || "",
      telefone: formData.telefone,
      whatsapp: formData.whatsapp || "",
      email: formData.email || "",

      capacidade_diaria:
        formData.capacidade_diaria !== ""
          ? Number(formData.capacidade_diaria)
          : null,

      abertura: formData.abertura,
      fechamento: formData.fechamento,

      status: formData.ativo ? "ativo" : "inativo",
    };

    try {
      setIsSaving(true);

      if (editando?.id) {
        await cartoriosService.update(editando.id, payload);
        toast.success("Cartório atualizado com sucesso!");
      } else {
        await cartoriosService.create(payload);
        toast.success("Cartório criado com sucesso!");
      }

      const res = await cartoriosService.list();
      const list = Array.isArray(res) ? res : res?.data ?? [];
      setCartorios(list);

      closeModal();
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao salvar cartório.");
    } finally {
      setIsSaving(false);
    }
  }

  // Editar cartório
  function handleEdit(c) {
    const municipio = resolveMunicipio(c, municipios);
    const tipo = resolveTipo(c, tiposCartorio);

    setFormData({
      nome: c?.nome || "",

      municipio_id: municipio?.id ? String(municipio.id) : "",
      tipo_id: tipo?.id ? String(tipo.id) : "",

      endereco: c?.endereco || "",
      numero: c?.numero || "",
      cep: c?.cep || "",
      telefone: c?.telefone || "",
      whatsapp: c?.whatsapp || "",
      email: c?.email || "",

      capacidade_diaria:
        c?.capacidade_diaria != null ? String(c.capacidade_diaria) : "",

      abertura: normalizeTime(c?.abertura) || "08:00",
      fechamento: normalizeTime(c?.fechamento) || "17:00",

      ativo: c?.status === "ativo",
    });

    setSearchMunicipio(municipio ? getMunicipioLabelFromObj(municipio) : "");
    setSearchTipo(tipo ? getTipoLabelFromObj(tipo) : "");

    setEditando(c);
    setModalOpen(true);
  }

  // Novo cartório
  function handleNovoCartorio() {
    resetForm();
    setEditando(null);
    setModalOpen(true);
  }

  // Excluir cartório
  function handleDelete(cartorio) {
    setCartorioParaExcluir(cartorio);
  }

  async function confirmDelete() {
    if (!cartorioParaExcluir?.id) return;

    try {
      setIsDeleting(true);
      await cartoriosService.remove(cartorioParaExcluir.id);

      setCartorios((prev) =>
        (prev || []).filter((c) => c.id !== cartorioParaExcluir.id)
      ); 

      toast.success("Cartório excluído com sucesso!");
      setCartorioParaExcluir(null);
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao excluir cartório.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Criar novo tipo (inline) - sem duplicar
  async function handleCreateTipo() {
    if (isSavingTipoInline) return;

    const nome = (novoTipo ?? "").trim();
    if (!nome) {
      toast.error("Informe o nome do tipo.");
      return;
    }

    const nomeLower = nome.toLowerCase();
    const existente = (tiposCartorio || []).find(
      (t) => String(t?.nome ?? "").trim().toLowerCase() === nomeLower
    );

    if (existente?.id) {
      setFormData((prev) => ({ ...prev, tipo_id: existente.id }));
      setSearchTipo(existente.nome);
      setCreatingTipo(false);
      setNovoTipo("");
      toast.success("Tipo já existia — selecionei pra você.");
      return;
    }

    setIsSavingTipoInline(true);

    try {
      const created = await tiposCartorioService.create({
        nome,
        ativo: true,
      });

      const novo = created?.data ?? created;
      if (!novo) throw new Error("Retorno inválido ao criar tipo.");

      setTiposCartorio((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        const jaTem = arr.some((t) => (t?.id ?? null) === (novo?.id ?? null));
        return jaTem ? arr : [...arr, novo];
      });

      if (novo?.id) {
        setFormData((prev) => ({ ...prev, tipo_id: novo.id }));
        setSearchTipo(novo.nome ?? nome);
      } else {
        setSearchTipo(nome);
      }

      toast.success("Tipo criado com sucesso!");
      setCreatingTipo(false);
      setNovoTipo("");
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao criar tipo.");
    } finally {
      setIsSavingTipoInline(false);
    }
  }

  // Criar novo município (inline) - sem duplicar
  async function handleCreateMunicipio() {
    if (isSavingMunicipioInline) return;

    const nome = (newMunicipioData?.nome ?? "").trim();
    const uf = (newMunicipioData?.uf ?? "").trim();

    if (!nome) {
      toast.error("Informe o nome do município.");
      return;
    }

    const nomeLower = nome.toLowerCase();
    const ufLower = uf.toLowerCase();

    const existente = (municipios || []).find((m) => {
      const n = String(m?.nome ?? m?.municipio ?? "").trim().toLowerCase();
      const u = String(m?.uf ?? "").trim().toLowerCase();
      return n === nomeLower && u === ufLower;
    });

    if (existente?.id) {
      setFormData((prev) => ({ ...prev, municipio_id: existente.id }));
      setSearchMunicipio(getMunicipioLabelFromObj(existente));
      setCreatingMunicipio(false);
      setNewMunicipioData({ nome: "", uf: "" });
      toast.success("Município já existia — selecionei pra você.");
      return;
    }

    setIsSavingMunicipioInline(true);

    try {
      const created = await municipiosService.create({
        nome,
        uf: uf || null,
        ativo: true,
      });

      const novo = created?.data ?? created;
      if (!novo) throw new Error("Retorno inválido ao criar município.");

      setMunicipios((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        const jaTem = arr.some((m) => (m?.id ?? null) === (novo?.id ?? null));
        return jaTem ? arr : [...arr, novo];
      });

      if (novo?.id) {
        setFormData((prev) => ({ ...prev, municipio_id: novo.id }));
        setSearchMunicipio(getMunicipioLabelFromObj(novo));
      } else {
        setSearchMunicipio(`${nome}${uf ? ` - ${uf}` : ""}`);
      }

      toast.success("Município criado com sucesso!");
      setCreatingMunicipio(false);
      setNewMunicipioData({ nome: "", uf: "" });
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao criar município.");
    } finally {
      setIsSavingMunicipioInline(false);
    }
  }

  // Render helpers
  function renderStatusBadge(ativo) {
    const isAtivo = !!ativo;
    return (
      <Badge variant={isAtivo ? "default" : "secondary"}>
        {isAtivo ? "Ativo" : "Inativo"}
      </Badge>
    );
  }

  // UI - Modal (Portal)
  const modal = modalOpen
    ? createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editando ? "Editar Cartório" : "Novo Cartório"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados abaixo para{" "}
                  {editando ? "atualizar" : "criar"} o cartório.
                </p>
              </div>

              <Button type="button" variant="ghost" onClick={closeModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome *</label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nome: e.target.value }))
                  }
                  placeholder="Nome do cartório"
                />
              </div>

              {/* Município (autocomplete + criar) */}
              <div className="space-y-1" ref={municipioDropdownRef}>
                <label className="text-sm font-medium">Município *</label>

                <div className="relative">
                  <Input
                    value={searchMunicipio}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchMunicipio(value);
                      setShowMunicipiosDropdown(true);

                      if (
                        value !==
                        getMunicipioLabelFromObj(
                          (municipios || []).find(
                            (m) => String(m.id) === formData.municipio_id
                          )
                        )
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          municipio_id: "",
                        }));
                      }
                    }}
                    onFocus={() => setShowMunicipiosDropdown(true)}
                    placeholder="Buscar município..."
                  />

                  <AnimatePresence>
                    {showMunicipiosDropdown && (
                      <motion.div
                        className="absolute z-10 mt-2 w-full rounded-md border bg-white shadow"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                      >
                        <div className="max-h-56 overflow-auto p-2">
                          {(municipiosFiltered || []).length ? (
                            (municipiosFiltered || []).map((m) => (
                              <button
                                key={m.id ?? `${m.nome}-${m.uf}`}
                                type="button"
                                className="w-full rounded px-2 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    municipio_id: String(m.id),
                                  }));
                                  setSearchMunicipio(
                                    getMunicipioLabelFromObj(m)
                                  );
                                  setShowMunicipiosDropdown(false);

                                  setCreatingMunicipio(false);
                                  setNewMunicipioData({ nome: "", uf: "" });
                                }}
                              >
                                {getMunicipioLabelFromObj(m)}
                              </button>
                            ))
                          ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                              Nenhum município encontrado.
                            </div>
                          )}
                        </div>

                        {/* Ação: criar município */}
                        <div className="border-t p-2">
                          {!creatingMunicipio ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="px-4 py-2 text-sm"
                              onClick={() => {
                                setCreatingMunicipio(true);

                                const guessNome = searchMunicipio
                                  .split("-")[0]
                                  .trim();

                                setNewMunicipioData((prev) => ({
                                  ...prev,
                                  nome: prev.nome || guessNome || "",
                                }));
                              }}
                            >
                              Cadastrar novo município
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                  <Input
                                    value={newMunicipioData.nome}
                                    onChange={(e) =>
                                      setNewMunicipioData((prev) => ({
                                        ...prev,
                                        nome: e.target.value,
                                      }))
                                    }
                                    placeholder="Nome do município"
                                  />
                                </div>

                                <div className="col-span-1">
                                  <select
                                    className="h-10 w-full rounded-md border bg-white px-3 text-sm"
                                    value={newMunicipioData.uf}
                                    onChange={(e) =>
                                      setNewMunicipioData((prev) => ({
                                        ...prev,
                                        uf: e.target.value,
                                      }))
                                    }
                                  >
                                    <option value="">UF</option>
                                    {UF_OPTIONS.map((ufOpt) => (
                                      <option key={ufOpt} value={ufOpt}>
                                        {ufOpt}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={handleCreateMunicipio}
                                  disabled={isSavingMunicipioInline}
                                >
                                  {isSavingMunicipioInline
                                    ? "Salvando..."
                                    : "Salvar município"}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-4 py-2 text-sm"
                                  onClick={() => {
                                    setCreatingMunicipio(false);
                                    setIsSavingMunicipioInline(false);
                                    setNewMunicipioData({
                                      nome: "",
                                      uf: "",
                                    });
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Eu evito duplicidade por nome + UF. Se já
                                existir, eu só seleciono.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tipo (autocomplete + criar) */}
              <div className="space-y-1" ref={tipoDropdownRef}>
                <label className="text-sm font-medium">Tipo *</label>

                <div className="relative">
                  <Input
                    value={searchTipo}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchTipo(value);
                      setShowTiposDropdown(true);

                      if (
                        value !==
                        getTipoLabelFromObj(
                          (tiposCartorio || []).find(
                            (t) => String(t.id) === formData.tipo_id
                          )
                        )
                      ) {
                        setFormData((prev) => ({ ...prev, tipo_id: "" }));
                      }
                    }}
                    onFocus={() => setShowTiposDropdown(true)}
                    placeholder="Buscar tipo..."
                  />

                  <AnimatePresence>
                    {showTiposDropdown && (
                      <motion.div
                        className="absolute z-10 mt-2 w-full rounded-md border bg-white shadow"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                      >
                        <div className="max-h-56 overflow-auto p-2">
                          {(tiposFiltered || []).length ? (
                            (tiposFiltered || []).map((t, idx) => (
                              <button
                                key={t.id ?? `${t.nome}-${idx}`}
                                type="button"
                                className="w-full rounded px-2 py-2 text-left text-sm hover:bg-muted"
                                onClick={() => {
                                  if (t?.id != null) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      tipo_id: String(t.id),
                                    }));
                                  } else {
                                    setFormData((prev) => ({
                                      ...prev,
                                      tipo_id: "",
                                    }));
                                  }

                                  setSearchTipo(getTipoLabelFromObj(t));
                                  setShowTiposDropdown(false);

                                  setCreatingTipo(false);
                                  setNovoTipo("");
                                }}
                              >
                                {getTipoLabelFromObj(t)}
                              </button>
                            ))
                          ) : (
                            <div className="px-2 py-2 text-sm text-muted-foreground">
                              Nenhum tipo encontrado.
                            </div>
                          )}
                        </div>

                        {/* Ação: criar tipo */}
                        <div className="border-t p-2">
                          {!creatingTipo ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="px-4 py-2 text-sm"
                              onClick={() => {
                                setCreatingTipo(true);
                                setNovoTipo((prev) => prev || searchTipo || "");
                              }}
                            >
                              Cadastrar novo tipo
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <Input
                                value={novoTipo}
                                onChange={(e) => setNovoTipo(e.target.value)}
                                placeholder="Nome do tipo"
                              />

                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  onClick={handleCreateTipo}
                                  disabled={isSavingTipoInline}
                                >
                                  {isSavingTipoInline
                                    ? "Salvando..."
                                    : "Salvar tipo"}
                                </Button>

                                <Button
                                  type="button"
                                  variant="outline"
                                  className="px-4 py-2 text-sm"
                                  onClick={() => {
                                    setCreatingTipo(false);
                                    setIsSavingTipoInline(false);
                                    setNovoTipo("");
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>

                              <p className="text-xs text-muted-foreground">
                                Eu evito duplicidade por nome. Se já existir,
                                eu só seleciono.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Endereço + Número */}
              <div>
                <label className="text-sm font-medium">Endereço *</label>

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <Input
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endereco: e.target.value,
                      }))
                    }
                    placeholder="Rua, bairro..."
                  />

                  <Input
                    value={formData.numero}
                    onChange={(e) => {
                      const onlyDigits = (e.target.value || "")
                        .replace(/\D/g, "")
                        .slice(0, 5);

                      setFormData((prev) => ({
                        ...prev,
                        numero: onlyDigits,
                      }));
                    }}
                    placeholder="00000"
                  />
                </div>
              </div>

              {/* CEP (com autofill) */}
              <div className="space-y-1">
                <label className="text-sm font-medium">CEP</label>
                <Input
                  value={formData.cep}
                  onChange={(e) => {
                    const masked = formatCep(e.target.value);
                    setFormData((prev) => ({ ...prev, cep: masked }));

                    const digits = masked.replace(/\D/g, "");
                    if (digits.length === 8) {
                      handleCepAutoFill(masked);
                    }
                  }}
                  onBlur={() => {
                    handleCepAutoFill(formData.cep);
                  }}
                  placeholder="00000-000"
                />
                {isCepLoading ? (
                  <p className="text-xs text-muted-foreground">
                    Buscando endereço pelo CEP...
                  </p>
                ) : null}
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefone *</label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        telefone: formatPhone(e.target.value),
                      }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Whatsapp</label>
                  <Input
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: formatPhone(e.target.value),
                      }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">E-mail</label>
                  <Input
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    Capacidade diária *
                  </label>
                  <Input
                    value={formData.capacidade_diaria}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        capacidade_diaria: e.target.value.replace(/[^\d]/g, ""),
                      }))
                    }
                    placeholder="Ex: 20"
                  />
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Abertura</label>
                  <Input
                    type="time"
                    value={formData.abertura}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        abertura: normalizeTime(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Fechamento</label>
                  <Input
                    type="time"
                    value={formData.fechamento}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechamento: normalizeTime(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, ativo: !prev.ativo }))
                  }
                  className={`rounded-lg px-4 py-2 font-medium transition ${formData.ativo
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-purple-500 text-purple-600 hover:bg-purple-50"
                    }`}
                >
                  {formData.ativo ? "Ativo" : "Inativo"}
                </button>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancelar
                </Button>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </span>
                  ) : editando ? (
                    "Salvar alterações"
                  ) : (
                    "Criar cartório"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
    : null;

  // UI - Modal excluir (Portal)
  const deleteModal = cartorioParaExcluir
    ? createPortal(
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <div className="mb-2 text-lg font-semibold">Excluir cartório</div>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja excluir{" "}
              <span className="font-medium">{cartorioParaExcluir?.nome}</span>?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCartorioParaExcluir(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </span>
                ) : (
                  "Excluir"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
    : null;

  // Render principal
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cartórios</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie cartórios, municípios e tipos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setViewMode((prev) => (prev === "cards" ? "table" : "cards"))
            }
          >
            Alternar visualização
          </Button>

          <Button type="button" onClick={handleNovoCartorio}>
            <Plus className="mr-2 h-4 w-4" />
            Novo cartório
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome, município ou tipo..."
        />
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando...
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(cartoriosFiltered || []).map((c) => {
            const municipio = resolveMunicipio(c, municipios);
            const tipo = resolveTipo(c, tiposCartorio);

            return (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="truncate">{c?.nome}</span>
                    {renderStatusBadge(c?.status === "ativo")}
                  </CardTitle>

                  <CardDescription className="truncate">
                    {municipio
                      ? `${municipio.nome}${municipio.uf ? ` - ${municipio.uf}` : ""
                      }`
                      : "Não informado"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <div className="text-muted-foreground">Tipo</div>
                    <div className="font-medium">
                      {tipo?.nome || "Não informado"}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="text-muted-foreground">Telefone</div>
                    <div className="font-medium">{c?.telefone || "-"}</div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleEdit(c)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleDelete(c)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(cartoriosFiltered || []).map((c) => {
                const municipio = resolveMunicipio(c, municipios);
                const tipo = resolveTipo(c, tiposCartorio);

                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c?.nome}</TableCell>

                    <TableCell>
                      {municipio
                        ? `${municipio.nome}${municipio.uf ? ` - ${municipio.uf}` : ""
                        }`
                        : "-"}
                    </TableCell>

                    <TableCell>{tipo?.nome || "-"}</TableCell>

                    <TableCell>
                      {renderStatusBadge(c?.status === "ativo")}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleEdit(c)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => handleDelete(c)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!cartoriosFiltered?.length ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-6 text-center text-sm text-muted-foreground"
                  >
                    Nenhum cartório encontrado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Portals */}
      {modal}
      {deleteModal}
    </div>
  );
}
