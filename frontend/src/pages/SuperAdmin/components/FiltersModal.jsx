import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function FiltersModal({
  isOpen,
  onClose,
  UF_OPTIONS,
  filterForm,
  onChangeField,
  onApply,
  onClear,
  cartoriosFiltrados,
  // IBGE
  ibgeSearchTerm,
  setIbgeSearchTerm,
  ibgeCities,
  ibgeLoading,
  // períodos rápidos
  quickRange,
  quickDates,
  // favoritos
  savedFilters,
  onSaveFilter,
  onLoadFilter,
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 pt-5 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Filtros avançados
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Refine a visão do painel com região, cartório, horário e período.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* BODY */}
            <form
              onSubmit={onApply}
              className="px-6 py-4 space-y-5"
            >
              {/* UF + Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    UF
                  </label>
                  <select
                    value={filterForm.uf}
                    onChange={(e) => onChangeField("uf", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Todas</option>
                    {UF_OPTIONS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Status do agendamento
                  </label>
                  <select
                    value={filterForm.status}
                    onChange={(e) => onChangeField("status", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Tipo usuário */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Tipo de usuário
                </label>
                <select
                  value={filterForm.tipoUsuario}
                  onChange={(e) =>
                    onChangeField("tipoUsuario", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="admin">Admin</option>
                  <option value="servidor">Servidor</option>
                  <option value="advogado">Advogado</option>
                  <option value="juiz">Juiz</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              {/* Cidade IBGE */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cidade (IBGE)
                </label>
                <input
                  type="text"
                  placeholder="Digite pelo menos 3 letras..."
                  value={ibgeSearchTerm}
                  onChange={(e) => setIbgeSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />

                {/* Lista fixa para não 'pular' */}
                {ibgeSearchTerm.trim().length >= 3 && (
                  <div className="mt-2 border border-slate-200 rounded-lg bg-white max-h-44 min-h-[56px] overflow-y-auto shadow-sm">
                    {ibgeLoading ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        Carregando cidades...
                      </div>
                    ) : ibgeCities.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400 px-3">
                        Nenhuma cidade encontrada.
                      </div>
                    ) : (
                      ibgeCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            onChangeField("municipioId", city.id);
                            setIbgeSearchTerm(`${city.municipio} - ${city.uf}`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                        >
                          {city.municipio} - {city.uf}{" "}
                          {city.fromIbge && (
                            <span className="text-purple-600 text-[10px] ml-1">
                              (IBGE)
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Cartório */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cartório
                </label>
                <select
                  value={filterForm.cartorioId}
                  onChange={(e) =>
                    onChangeField("cartorioId", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Todos</option>
                  {cartoriosFiltrados.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Horário */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Horário inicial
                  </label>
                  <input
                    type="time"
                    value={filterForm.horarioInicio}
                    onChange={(e) =>
                      onChangeField("horarioInicio", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Horário final
                  </label>
                  <input
                    type="time"
                    value={filterForm.horarioFim}
                    onChange={(e) =>
                      onChangeField("horarioFim", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Período rápido */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Período rápido
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      quickRange(quickDates.hoje, quickDates.hoje)
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Hoje
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickRange(quickDates.seteDias, quickDates.hoje)
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Últimos 7 dias
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickRange(quickDates.trintaDias, quickDates.hoje)
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Últimos 30 dias
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickRange(quickDates.firstOfMonth, quickDates.lastOfMonth)
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Este mês
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      quickRange(
                        quickDates.firstPrevMonth,
                        quickDates.lastPrevMonth
                      )
                    }
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-slate-200"
                  >
                    Mês passado
                  </button>
                </div>
              </div>

              {/* Período manual */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Data inicial
                  </label>
                  <input
                    type="date"
                    value={filterForm.dataInicio || ""}
                    onChange={(e) =>
                      onChangeField("dataInicio", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Data final
                  </label>
                  <input
                    type="date"
                    value={filterForm.dataFim || ""}
                    onChange={(e) =>
                      onChangeField("dataFim", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Favoritos */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Salvar filtros como favorito
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do favorito..."
                    id="favName"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("favName");
                      if (!el) return;
                      const name = el.value.trim();
                      if (!name) return;
                      onSaveFilter(name);
                      el.value = "";
                    }}
                    className="px-3 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Salvar
                  </button>
                </div>

                {Object.keys(savedFilters).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {Object.keys(savedFilters).map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => onLoadFilter(name)}
                        className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onClear}
                  className="text-xs text-slate-500 underline hover:text-slate-700"
                >
                  Limpar filtros
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
