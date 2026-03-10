import { useEffect, useState, useCallback, useRef } from "react";
import api from "../../../services/api";

// tempo de cache (15 segundos)
const CACHE_TTL = 15000;

export function useDashboardData(filters = null) {
  const [stats, setStats] = useState(null);
  const [graficoDias, setGraficoDias] = useState([]);
  const [topCartorios, setTopCartorios] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [cartorios, setCartorios] = useState([]);
  const [loading, setLoading] = useState(true);

  // cache em memória (não reseta entre navegações)
  const cacheRef = useRef({
    timestamp: 0,
    stats: null,
    graficoDias: [],
    topCartorios: [],
    municipios: [],
    cartorios: [],
  });

  const loadBaseLists = useCallback(async () => {
    try {
      const cache = cacheRef.current;

      // se já temos municípios/cartórios no cache → usa eles
      if (cache.municipios.length > 0 && cache.cartorios.length > 0) {
        setMunicipios(cache.municipios);
        setCartorios(cache.cartorios);
        return;
      }

      const [munRes, cartRes] = await Promise.all([
        api.get("/municipios/"),
        api.get("/cartorios/"),
      ]);

      setMunicipios(munRes.data || []);
      setCartorios(cartRes.data || []);

      // salva no cache
      cache.municipios = munRes.data || [];
      cache.cartorios = cartRes.data || [];

    } catch (e) {
      console.error("Erro carregando municípios/cartórios:", e);
    }
  }, []);

  const loadDashboardStats = useCallback(async () => {
    try {
      const cache = cacheRef.current;
      const now = Date.now();
      const isFiltered = filters && Object.values(filters).some(Boolean);

      // se NÃO há filtros → usa cache
      if (!isFiltered && now - cache.timestamp < CACHE_TTL) {
        setStats(cache.stats);
        setGraficoDias(cache.graficoDias);
        setTopCartorios(cache.topCartorios);
        setLoading(false);
        return;
      }

      setLoading(true);

      const params = filters ? { ...filters } : {};

      const [statsRes, graficoRes, topRes] = await Promise.all([
        api.get("/superadmin/stats/", { params }),
        api.get("/superadmin/stats/agendamentos-dia/", { params }),
        api.get("/superadmin/stats/top-cartorios/", { params }),
      ]);

      const s = statsRes.data || {};
      const g = graficoRes.data || [];
      const t = topRes.data || [];

      setStats(s);
      setGraficoDias(g);
      setTopCartorios(t);

      // ⚠️ só salva no cache se não tem filtros
      if (!isFiltered) {
        cache.timestamp = now;
        cache.stats = s;
        cache.graficoDias = g;
        cache.topCartorios = t;
      }

    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBaseLists();
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  // retorno estável sempre igual
  return {
    stats,
    graficoDias,
    topCartorios,
    municipios,
    cartorios,
    loading,
    appliedFiltersData: {
      stats,
      graficoDias,
      topCartorios,
      loading,
      filters,
    },
  };
}
