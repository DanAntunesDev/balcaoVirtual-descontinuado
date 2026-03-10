import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "@/domain/auth/useAuth";
import { Loader2 } from "lucide-react";

export default function SuperAdminHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("superadmin/stats/");
        setStats(response.data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">

      </h1>
      <p className="text-gray-600 mb-10">
        Bem-vindo, {user?.nome || user?.email}! Aqui estão as informações gerais:
      </p>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-gray-500 text-sm">Usuários cadastrados</h2>
          <p className="text-4xl font-bold text-indigo-700">
            {stats?.total_usuarios || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-gray-500 text-sm">Cartórios</h2>
          <p className="text-4xl font-bold text-indigo-700">
            {stats?.total_cartorios || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
          <h2 className="text-gray-500 text-sm">Atendimentos</h2>
          <p className="text-4xl font-bold text-indigo-700">
            {stats?.total_agendamentos || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
