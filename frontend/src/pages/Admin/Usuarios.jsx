import { useEffect, useState } from "react";
import api from "../../services/api";

// COMPONENTES UI
import Loader from "../../components/ui/Loader";
import { Badge } from "../../components/ui/badge";

// NOVA TABELA (padrão shadcn, opção B)
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchUsuarios() {
    try {
      setLoading(true);
      const response = await api.get("/usuarios/");
      setUsuarios(response.data);
    } catch (err) {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-sa-primary mb-6">
        Gerenciamento de Usuários
      </h1>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader />
        </div>
      )}

      {/* ERRO */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* TABELA */}
      {!loading && !error && (
        <div className="border rounded-xl p-4 bg-white shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {usuarios.map((user) => (
                <TableRow key={user.id} className="hover:bg-sa-primary/5">
                  <TableCell className="font-medium text-sa-neutral-800">
                    {user.first_name} {user.last_name}
                  </TableCell>

                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.acesso}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.is_active ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {user.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>

                  <TableCell>{user.last_login || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
