import { createContext, useCallback, useContext, useMemo, useState } from "react";

/**
 * Estado global do Header:
 * - visible: mostra/esconde a barra
 * - count: quantidade selecionada
 * - actions: botões da barra (label + icon + onClick)
 *
 * Isso deixa o header com "animação padrão" SEM depender de props por página.
 */

const HeaderSelectionContext = createContext(null);

export function HeaderSelectionProvider({ children }) {
  const [state, setState] = useState({
    visible: false,
    count: 0,
    title: "Selecionados",
    actions: [],
  });

  const showSelection = useCallback(({ count, title, actions }) => {
    setState({
      visible: true,
      count: Number(count || 0),
      title: title || "Selecionados",
      actions: Array.isArray(actions) ? actions : [],
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false, count: 0, actions: [] }));
  }, []);

  const value = useMemo(
    () => ({
      selection: state,
      showSelection,
      clearSelection,
    }),
    [state, showSelection, clearSelection]
  );

  return (
    <HeaderSelectionContext.Provider value={value}>
      {children}
    </HeaderSelectionContext.Provider>
  );
}

export function useHeaderSelection() {
  const ctx = useContext(HeaderSelectionContext);
  if (!ctx) {
    throw new Error("useHeaderSelection must be used within HeaderSelectionProvider");
  }
  return ctx;
}