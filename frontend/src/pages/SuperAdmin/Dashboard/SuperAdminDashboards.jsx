import { useState } from "react";
import {
  CalendarDays,
  Building2,
  Users,
  FileText,
} from "lucide-react";

// Components principais
import StatCard from "../components/StatCard";
import MiniCard from "../components/MiniCard";
import ChartBox from "../components/ChartBox";
import CategoryDistribution, {
  categoryDummy as categoryDummyData,
} from "../components/CategoryDistribution";
import HeatmapDias, {
  heatmapDummy as heatmapDummyData,
} from "../components/HeatmapDias";
import RankingProfissionais, {
  rankingProfDummy as rankingProfDummyData,
} from "../components/RankingProfissionais";
import TimelineProcess, {
  timelineDummy as timelineDummyData,
} from "../components/TimelineProcess";
import AuditLogs, {
  auditDummy as auditLogsDummyData,
} from "../components/AuditLogs";
import MonthlyComparison, {
  monthlyDummy as monthlyDummyData,
} from "../components/MonthlyComparison";
import KPISection from "../components/KPISection";
import RankingCard from "../components/RankingCard";
import FilterTag from "../components/FilterTag";

// Hooks / dados
import FiltersModal from "../components/FiltersModal";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardData } from "../hooks/useDashboardData";

export default function SuperAdminDashboards() {
  // Filtros que serão de fato enviados para o backend
  const [dashboardFilters, setDashboardFilters] = useState(null);

  // Dados da API (stats, gráfico, ranking, listas base)
  const {
    stats,
    graficoDias,
    topCartorios,
    municipios,
    cartorios,
    loading,
  } = useDashboardData(dashboardFilters);

  // Hook de filtros (modal, badges, IBGE etc.)
  const {
    UF_OPTIONS,
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
    ibgeCities,
    ibgeLoading,
    quickRange,
    quickDates,
  } = useDashboardFilters({ municipios, cartorios });

  // Wrapper: aplica filtros no hook + atualiza filtros usados na API
  function handleApplyFilters(e) {
    applyFilters(e);
    setDashboardFilters({ ...filterForm });
  }

  function handleClearFilters() {
    clearFilters();
    setDashboardFilters(null);
  }

  function handleRemoveFilter(key) {
    removeSingleFilter(key);
    setDashboardFilters((prev) => {
      if (!prev) return prev;
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

  const mainKpis = [
    {
      component: StatCard,
      title: "Total de Agendamentos",
      value: stats?.total_agendamentos ?? "1.259",
      subtitle: "Últimos 30 dias",
      icon: <CalendarDays size={20} />,
    },
    {
      component: StatCard,
      title: "Cartórios Ativos",
      value: stats?.cartorios_ativos ?? "32",
      subtitle: "Unidades operando",
      icon: <Building2 size={20} />,
    },
    {
      component: StatCard,
      title: "Usuários Cadastrados",
      value: stats?.usuarios_cadastrados ?? "487",
      subtitle: "Entre clientes e operadores",
      icon: <Users size={20} />,
    },
    {
      component: StatCard,
      title: "Documentos Emitidos",
      value: stats?.documentos_emitidos ?? "902",
      subtitle: "No período analisado",
      icon: <FileText size={20} />,
    },
  ];

  return (
    <div className="w-full p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">
            Dashboard do SuperAdmin
          </h1>
          <p className="text-sm text-zinc-400">
            Visão geral dos agendamentos, cartórios e atividades do sistema.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {loading && (
            <span className="text-xs text-zinc-400">
              Atualizando dados...
            </span>
          )}
          <button
            onClick={openFilterModal}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm"
          >
            Filtros avançados
          </button>
        </div>
      </div>

      {/* BADGES DE FILTRO ATIVO */}
      {hasAnyFilterApplied && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <FilterTag
              key={badge.key}
              label={badge.label}
              onRemove={() => handleRemoveFilter(badge.key)}
            />
          ))}
        </div>
      )}

      {/* KPIs PRINCIPAIS */}
      <KPISection cards={mainKpis} />

      {/* GRÁFICO PRINCIPAL + RANKING DE CARTÓRIOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartBox data={graficoDias} loading={loading} />
        </div>

        <RankingCard topCartorios={topCartorios} />
      </div>

      {/* COMPARAÇÕES E DISTRIBUIÇÕES (DUMMY VISUAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MonthlyComparison data={monthlyDummyData} />
        <CategoryDistribution data={categoryDummyData} />
        <HeatmapDias data={heatmapDummyData} />
      </div>

      {/* RANKING PROFISSIONAIS + TIMELINE PROCESSOS (DUMMY VISUAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingProfissionais data={rankingProfDummyData} />
        <TimelineProcess steps={timelineDummyData} />
      </div>

      {/* LOGS DE AUDITORIA (DUMMY VISUAL) */}
      <AuditLogs logs={auditLogsDummyData} />

      {/* MODAL DE FILTROS */}
      <FiltersModal
        isOpen={isFilterModalOpen}
        onClose={closeFilterModal}
        UF_OPTIONS={UF_OPTIONS}
        filterForm={filterForm}
        onChangeField={handleFilterFormChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        cartoriosFiltrados={cartoriosFiltrados}
        ibgeSearchTerm={ibgeSearchTerm}
        setIbgeSearchTerm={setIbgeSearchTerm}
        ibgeCities={ibgeCities}
        ibgeLoading={ibgeLoading}
        quickRange={quickRange}
        quickDates={quickDates}
        savedFilters={savedFilters}
        onSaveFilter={saveFilterPreset}
        onLoadFilter={loadFilterPreset}
      />
    </div>
  );
}
