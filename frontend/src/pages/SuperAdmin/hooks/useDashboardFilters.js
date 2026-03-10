import { useMemo, useState } from "react";
import { useIbgeAutocomplete } from "./useIbgeAutocomplete";

/* UF padronizado */
export const UF_OPTIONS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO"
];

/* Formata AAAA-MM-DD → DD/MM/AAAA */
export function formatDateBR(value) {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  return (!y || !m || !d) ? value : `${d}/${m}/${y}`;
}

export function useDashboardFilters({ municipios, cartorios }) {

  /* GUARDA valores sempre seguros */
  const safeMunicipios = Array.isArray(municipios) ? municipios : [];
  const safeCartorios = Array.isArray(cartorios) ? cartorios : [];

  /* Estado principal de filtros */
  const emptyFilters = {
    uf: "",
    municipioId: "",
    cartorioId: "",
    status: "",
    tipoUsuario: "",
    horarioInicio: "",
    horarioFim: "",
    dataInicio: "",
    dataFim: "",
  };

  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [filterForm, setFilterForm] = useState(emptyFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  /* LOAD PRESETS */
  const [savedFilters, setSavedFilters] = useState(() => {
    try {
      const saved = localStorage.getItem("dashboard_filters");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  /* IBGE AUTOCOMPLETE */
  const {
    searchTerm: ibgeSearchTerm,
    setSearchTerm: setIbgeSearchTerm,
    cities: ibgeCities,
    isLoading: ibgeLoading,
  } = useIbgeAutocomplete();

  /* MERGE CIDADES (IBGE + locais) */
  const mergedCityList = useMemo(() => {
    if (!isFilterModalOpen) return []; // evita piscadas fora do modal

    const ibgeMapped = (ibgeCities || []).map((c) => ({
      id: String(c.id),
      municipio: c.nome,
      uf: c.uf,
      fromIbge: true,
    }));

    const localMapped = safeMunicipios.map((m) => ({
      id: String(m.id),
      municipio: m.municipio,
      uf: m.uf,
      fromIbge: false,
    }));

    const map = new Map();
    [...ibgeMapped, ...localMapped].forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });

    return Array.from(map.values()).slice(0, 40);
  }, [ibgeCities, safeMunicipios, isFilterModalOpen]);

  /* FILTRA CARTÓRIOS pela cidade */
  const cartoriosFiltrados = useMemo(() => {
    const munId = filterForm.municipioId;
    if (!munId) return safeCartorios;
    return safeCartorios.filter((c) =>
      String(c.cidade) === String(munId)
    );
  }, [filterForm.municipioId, safeCartorios]);

  /* BADGES (estáveis) */
  const badges = useMemo(() => {
    const arr = [];

    if (appliedFilters.uf)
      arr.push({ key: "uf", label: `UF: ${appliedFilters.uf}` });

    if (appliedFilters.municipioId) {
      const mun = safeMunicipios.find(
        (m) => String(m.id) === String(appliedFilters.municipioId)
      );
      if (mun) arr.push({ key: "municipioId", label: `Cidade: ${mun.municipio}` });
    }

    if (appliedFilters.cartorioId) {
      const cart = safeCartorios.find(
        (c) => String(c.id) === String(appliedFilters.cartorioId)
      );
      if (cart) arr.push({ key: "cartorioId", label: `Cartório: ${cart.nome}` });
    }

    if (appliedFilters.status)
      arr.push({ key: "status", label: `Status: ${appliedFilters.status}` });

    if (appliedFilters.tipoUsuario)
      arr.push({ key: "tipoUsuario", label: `Usuário: ${appliedFilters.tipoUsuario}` });

    if (appliedFilters.horarioInicio || appliedFilters.horarioFim)
      arr.push({
        key: "horario",
        label: `Horário: ${appliedFilters.horarioInicio || "--"} - ${appliedFilters.horarioFim || "--"}`
      });

    if (appliedFilters.dataInicio || appliedFilters.dataFim)
      arr.push({
        key: "periodo",
        label: `Período: ${
          appliedFilters.dataInicio ? formatDateBR(appliedFilters.dataInicio) : "--"
        } → ${
          appliedFilters.dataFim ? formatDateBR(appliedFilters.dataFim) : "--"
        }`
      });

    return arr;
  }, [appliedFilters, safeMunicipios, safeCartorios]);

  const hasAnyFilterApplied = badges.length > 0;

  /* HANDLERS */
  function handleFilterFormChange(field, value) {
    setFilterForm((prev) => ({ ...prev, [field]: value }));
  }

  function openFilterModal() {
    setFilterForm(appliedFilters);
    setIsFilterModalOpen(true);
  }

  function closeFilterModal() {
    setIsFilterModalOpen(false);
    setIbgeSearchTerm("");
  }

  function applyFilters(e) {
    e?.preventDefault();
    setAppliedFilters({ ...filterForm });
    setIsFilterModalOpen(false);
  }

  function clearFilters() {
    setAppliedFilters(emptyFilters);
    setFilterForm(emptyFilters);
    setIbgeSearchTerm("");
  }

  function removeSingleFilter(key) {
    setAppliedFilters((prev) => {
      const n = { ...prev };
      if (key === "periodo") {
        n.dataInicio = "";
        n.dataFim = "";
      } else if (key === "horario") {
        n.horarioInicio = "";
        n.horarioFim = "";
      } else {
        n[key] = "";
      }
      return n;
    });
  }

  function saveFilterPreset(name) {
    if (!name.trim()) return;
    const updated = { ...savedFilters, [name]: appliedFilters };
    setSavedFilters(updated);
    localStorage.setItem("dashboard_filters", JSON.stringify(updated));
  }

  function loadFilterPreset(name) {
    const preset = savedFilters[name];
    if (!preset) return;
    setAppliedFilters(preset);
    setFilterForm(preset);
  }

  /* QUICK DATES */
  const todayString = () => new Date().toISOString().split("T")[0];

  const hoje = todayString();
  const seteDias = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
  const trintaDias = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const lastOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const firstPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
    .toISOString()
    .split("T")[0];

  const lastPrevMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    .toISOString()
    .split("T")[0];

  return {
    UF_OPTIONS,
    appliedFilters,
    filterForm,
    isFilterModalOpen,
    openFilterModal,
    closeFilterModal,
    handleFilterFormChange,
    applyFilters,
    clearFilters,
    removeSingleFilter,
    savedFilters,
    saveFilterPreset,
    loadFilterPreset,
    hasAnyFilterApplied,
    badges,
    cartoriosFiltrados,
    ibgeSearchTerm,
    setIbgeSearchTerm,
    ibgeCities: mergedCityList,
    ibgeLoading,
    quickRange: (start, end) =>
      setFilterForm((prev) => ({ ...prev, dataInicio: start, dataFim: end })),
    quickDates: {
      hoje,
      seteDias,
      trintaDias,
      firstOfMonth,
      lastOfMonth,
      firstPrevMonth,
      lastPrevMonth,
    },
  };
}
