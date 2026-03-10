// src/pages/SuperAdmin/Dashboard/hooks/useIbgeAutocomplete.js
import { useEffect, useState } from "react";

export function useIbgeAutocomplete() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setCities([]);
      return;
    }

    const handler = setTimeout(async () => {
      const term = searchTerm.trim().toLowerCase();
      if (term === lastQuery) return;

      setLastQuery(term);
      setIsLoading(true);

      try {
        const res = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
        );
        const data = await res.json();

        const filtered = data
          .filter((c) => c.nome.toLowerCase().includes(term))
          .slice(0, 40)
          .map((c) => ({
            id: c.id,
            nome: c.nome,
            uf: c.microrregiao.mesorregiao.UF.sigla,
          }));

        setCities(filtered);
      } catch (err) {
        console.error("Erro ao buscar cidades no IBGE:", err);
      } finally {
        setIsLoading(false);
      }
    }, 350); // debounce ~350ms

    return () => clearTimeout(handler);
  }, [searchTerm, lastQuery]);

  return {
    searchTerm,
    setSearchTerm,
    cities,
    isLoading,
  };
}
