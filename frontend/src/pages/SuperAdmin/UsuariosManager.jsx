import React, { useEffect, useState, useMemo } from "react";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Trash2,
  Eye,
  UserCog,
  Shield,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/*
  Eu mantenho helpers locais porque este Manager já existe no projeto e eu
  quero corrigir apenas integrações/erros sem refatorar UX.
*/
const capitalize = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

/*
  Tratamento centralizado de erros da API.
  Eu não mudo UX aqui, apenas mantenho o mesmo padrão já usado no arquivo.
*/
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
            if (field === "non_field_errors") {
              toast.error(msg);
            } else {
              toast.error(`${field}: ${msg}`);
            }
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

/*
  Eu mantenho labels existentes.
  Eu não altero tokens nem decisões visuais.
*/
const ROLE_LABELS = {
  superadmin: "Superadmin",
  admin: "Admin",
  servidor: "Servidor",
  advogado: "Advogado",
  juiz: "Juiz",
  cliente: "Cliente",
  user: "Usuário",
};

const ROLE_COLORS = {
  superadmin: "bg-violet-100 text-violet-700 border-violet-200",
  admin: "bg-blue-100 text-blue-700 border-blue-200",
  servidor: "bg-amber-100 text-amber-700 border-amber-200",
  advogado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  juiz: "bg-rose-100 text-rose-700 border-rose-200",
  cliente: "bg-slate-100 text-slate-700 border-slate-200",
  user: "bg-slate-100 text-slate-700 border-slate-200",
};

const STATUS_LABELS = {
  ativo: "Ativo",
  inativo: "Inativo",
};

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "ativo", label: "Ativo" },
  { value: "inativo", label: "Inativo" },
];

const ROLE_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "superadmin", label: "Superadmin" },
  { value: "admin", label: "Admin" },
  { value: "servidor", label: "Servidor" },
  { value: "advogado", label: "Advogado" },
  { value: "juiz", label: "Juiz" },
  { value: "cliente", label: "Cliente" },
];

const extractListFromResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;

  if (data && data.data) {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data.results)) return data.data.results;
  }

  if (data && Array.isArray(data.usuarios)) return data.usuarios;
  if (data && Array.isArray(data.users)) return data.users;

  return [];
};

const UsuariosManager = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [roleFilter, setRoleFilter] = useState("todos");
  const [cartorioFilter, setCartorioFilter] = useState("todos");

  const [cartorios, setCartorios] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [formMode, setFormMode] = useState("create"); // create | edit
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    email: "",
    password: "",
    acesso: "user",
    status: "ativo",
    cartorio: "nenhum",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usuariosResponse = await api.get("/usuarios/v1/");

      const rawUsers = extractListFromResponse(usuariosResponse.data);

      console.log("RAW USERS:", rawUsers);

      const normalizedUsers = rawUsers.map((u) => {
        const acesso =
          typeof u.role === "string" ? u.role.toLowerCase() : "cliente";

        // LÓGICA DE STATUS ROBUSTA:
        // O Django usa is_active para controle de login.
        // Se is_active for true, o status visual DEVE ser 'ativo'.
        let status = "inativo";
        if (u.is_active === true) {
          status = "ativo";
        } else if (typeof u.status === "string") {
          status = u.status.toLowerCase();
        } else if (typeof u.status === "boolean") {
          status = u.status ? "ativo" : "inativo";
        }

        const nome =
          `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
          u.username ||
          u.email ||
          "-";

        return {
          id: u.id,
          nome,
          email: u.email,
          role: acesso,
          status: status,
          cartorio: u.cartorio ?? null,
          cartorio_id:
            u.cartorio_id !== undefined
              ? u.cartorio_id
              : typeof u.cartorio === "object"
                ? u.cartorio?.id
                : (u.cartorio ?? null),
          data_criacao: u.date_joined || u.created_at,
          is_superuser: u.is_superuser,
          is_staff: u.is_staff,
          is_active: u.is_active,
        };
      });

      console.log("NORMALIZED USERS:", normalizedUsers);

      setUsuarios(normalizedUsers);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      handleApiError(error, "Erro ao carregar usuários.");
      setUsuarios([]);
    }

    try {
      const cartoriosResponse = await api.get("/v1/cartorios/");
      const rawCartorios = extractListFromResponse(cartoriosResponse.data);
      setCartorios(rawCartorios);
    } catch (error) {
      const status = error?.response?.status;
      if (status === 403) {
        console.warn("Sem permissão para listar cartórios (403).");
        setCartorios([]);
      } else {
        console.error("Erro ao carregar cartórios:", error);
        handleApiError(error, "Erro ao carregar cartórios.");
        setCartorios([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCartorioNome = (cartorio) => {
    if (!cartorio) return "-";

    if (typeof cartorio === "object") {
      return cartorio.nome || "-";
    }

    const found = cartorios.find((c) => String(c.id) === String(cartorio));
    return found ? found.nome : "-";
  };

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((user) => {
      const matchesSearch =
        user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "todos" || user.status === statusFilter;

      const matchesRole =
        roleFilter === "todos" ||
        user.role === roleFilter ||
        (roleFilter === "user" &&
          (user.role === "cliente" || user.role === "user"));

      const matchesCartorio =
        cartorioFilter === "todos" ||
        String(user.cartorio_id || "") === String(cartorioFilter) ||
        (cartorioFilter === "nenhum" && !user.cartorio_id);

      return matchesSearch && matchesStatus && matchesRole && matchesCartorio;
    });
  }, [usuarios, searchTerm, statusFilter, roleFilter, cartorioFilter]);

  const stats = useMemo(() => {
    const total = usuarios.length;

    return {
      total,
      superadmins: usuarios.filter((u) => u.role === "superadmin").length,
      admins: usuarios.filter((u) => u.role === "admin").length,
      servidores: usuarios.filter((u) => u.role === "servidor").length,
      advogados: usuarios.filter((u) => u.role === "advogado").length,
      usuariosComuns: usuarios.filter(
        (u) => u.role === "cliente" || u.role === "user",
      ).length,
    };
  }, [usuarios]);

  const handleOpenCreateDialog = () => {
    setFormMode("create");
    setFormData({
      id: null,
      nome: "",
      email: "",
      password: "",
      acesso: "user",
      status: "ativo",
      cartorio: "nenhum",
    });
    setIsUserDialogOpen(true);
  };

  const capitalizeFirst = (value) => {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleOpenEditDialog = (user) => {
    setFormMode("edit");
    setSelectedUser(user);

    setFormData({
      id: user.id,
      nome: user.nome || "",
      email: user.email || "",
      password: "",
      acesso: user.role?.toLowerCase() || "cliente",
      status: user.is_active ? "ativo" : "inativo",

      // Ajuste correto do cartório no modal de edição
      cartorio: user.cartorio_id ? String(user.cartorio_id) : "nenhum",
    });

    setIsUserDialogOpen(true);
  };

  const handleOpenViewDialog = (user) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        field === "acesso" || field === "status" ? value.toLowerCase() : value,
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        first_name: capitalize(formData.nome.split(" ")[0]),
        last_name: capitalize(formData.nome.split(" ").slice(1).join(" ")),
        email: formData.email,
        role: formData.acesso,
        is_active: formData.status === "ativo",
      };

      // Alinhado com o backend: envio explícito de null quando desvincular
      payload.cartorio_id =
        formData.cartorio === "nenhum" ? null : Number(formData.cartorio);

      if (formMode === "create") {
        if (formData.password) payload.password = formData.password;
        await api.post("/usuarios/criar/", payload);
        toast.success("Usuário criado com sucesso!");
      } else if (formMode === "edit" && formData.id) {
        await api.patch(`/usuarios/v1/${formData.id}/`, payload);
        toast.success("Usuário atualizado com sucesso!");
      }

      setIsUserDialogOpen(false);
      await fetchData();
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao salvar usuário.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await api.delete(`/usuarios/v1/${selectedUser.id}/`);
      toast.success("Usuário excluído com sucesso!");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      await fetchData();
    } catch (error) {
      console.error(error);
      handleApiError(error, "Erro ao excluir usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Gestão de Usuários
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Controle centralizado de perfis, acessos e cartórios do Balcão
          Virtual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <ResumoCard
          title="Total de usuários"
          value={stats.total}
          icon={<UserCheck className="h-4 w-4 text-slate-500" />}
        />
        <ResumoCard
          title="Superadmins"
          value={stats.superadmins}
          icon={<Shield className="h-4 w-4 text-violet-500" />}
        />
        <ResumoCard
          title="Admins"
          value={stats.admins}
          icon={<UserCog className="h-4 w-4 text-blue-500" />}
        />
        <ResumoCard
          title="Servidores"
          value={stats.servidores}
          icon={<UserCheck className="h-4 w-4 text-emerald-500" />}
        />
        <ResumoCard
          title="Advogados"
          value={stats.advogados}
          icon={<UserCheck className="h-4 w-4 text-amber-500" />}
        />
        <ResumoCard
          title="Usuários comuns"
          value={stats.usuariosComuns}
          icon={<UserCheck className="h-4 w-4 text-slate-500" />}
        />
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[520px_160px_160px_200px_auto] lg:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11">
              <SelectValue>
                {STATUS_LABELS[statusFilter] || "Status"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-11">
              <SelectValue>{ROLE_LABELS[roleFilter] || "Papel"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cartorioFilter} onValueChange={setCartorioFilter}>
            <SelectTrigger className="h-11">
              <SelectValue>
                {cartorioFilter === "todos"
                  ? "Todos"
                  : cartorioFilter === "nenhum"
                    ? "Nenhum"
                    : getCartorioNome(cartorioFilter)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="nenhum">Nenhum</SelectItem>
              {cartorios.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex lg:justify-end">
            <Button
              type="button"
              className="h-11 w-full lg:w-auto"
              onClick={handleOpenCreateDialog}
              disabled={loading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Novo usuário
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Cartório</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                    Carregando...
                  </td>
                </tr>
              ) : filteredUsuarios.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-sm text-slate-500" colSpan={7}>
                    Nenhum usuário encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 text-sm">
                    <td className="px-4 py-4 text-slate-900">{u.nome}</td>
                    <td className="px-4 py-4 text-slate-600">{u.email}</td>
                    <td className="px-4 py-4">
                      <RoleBadge role={u.role} isSuperuser={u.is_superuser} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {getCartorioNome(u.cartorio_id)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {u.data_criacao
                        ? new Date(u.data_criacao).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenViewDialog(u)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(u)}
                          title="Editar"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(u)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[680px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Novo usuário" : "Editar usuário"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Preencha os dados para criar um novo usuário."
                : "Atualize os dados do usuário selecionado."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitUser} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Nome
                </label>
                <Input
                  value={formData.nome}
                  onChange={(e) =>
                    handleFormChange("nome", capitalizeFirst(e.target.value))
                  }
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              {formMode === "create" && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Senha
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    placeholder="Defina uma senha"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Papel
                </label>
                <Select
                  value={formData.acesso}
                  onValueChange={(v) => handleFormChange("acesso", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.filter((o) => o.value !== "todos").map(
                      (o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleFormChange("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((o) => o.value !== "todos").map(
                      (o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Cartório
                </label>
                <Select
                  value={formData.cartorio}
                  onValueChange={(v) => handleFormChange("cartorio", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Nenhum</SelectItem>
                    {cartorios.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {cartorios.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Cartórios indisponíveis (pode ser falta de permissão).
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUserDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {formMode === "create" ? "Criar usuário" : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader className="space-y-1">
            <DialogTitle>Detalhes do usuário</DialogTitle>
            <DialogDescription>
              Informações cadastradas do usuário selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4 text-sm">
            <InfoRow label="Nome" value={selectedUser?.nome ?? "-"} />

            <InfoRow label="E-mail" value={selectedUser?.email ?? "-"} />

            <InfoRow
              label="Papel"
              value={
                selectedUser ? (
                  <RoleBadge
                    role={selectedUser.role}
                    isSuperuser={selectedUser.is_superuser}
                  />
                ) : (
                  "-"
                )
              }
            />

            {/*
              Aqui eu corrijo o problema sem mexer fora do modal:
              - Primeiro eu tento o campo novo do backend (cartorio_nome).
              - Se ele não existir no selectedUser, eu uso fallback para o que já funciona hoje:
                getCartorioNome(cartorio_id || cartorio).
              Eu faço isso porque, na prática, o "selectedUser" pode estar vindo da lista normalizada
              e nem sempre vai carregar cartorio_nome.
            */}
            <InfoRow
              label="Cartório"
              value={
                selectedUser?.cartorio_nome ??
                getCartorioNome(
                  selectedUser?.cartorio_id || selectedUser?.cartorio,
                )
              }
            />

            <InfoRow
              label="Status"
              value={
                selectedUser ? (
                  <StatusBadge status={selectedUser.status} />
                ) : (
                  "-"
                )
              }
            />

            <InfoRow
              label="Criado em"
              value={
                selectedUser?.data_criacao
                  ? new Date(selectedUser.data_criacao).toLocaleString()
                  : "-"
              }
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Eu vou excluir o usuário
              selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-medium">{selectedUser?.nome ?? "-"}</div>
            <div className="text-slate-500">{selectedUser?.email ?? "-"}</div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ==========================
   Componentes auxiliares
   ========================== */

function ResumoCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">{icon}</div>
      </div>
    </div>
  );
}

function RoleBadge({ role, isSuperuser }) {
  const normalized = (role || "user").toLowerCase();
  const finalRole = isSuperuser ? "superadmin" : normalized;

  return (
    <Badge
      variant="outline"
      className={cn(
        "border text-xs",
        ROLE_COLORS[finalRole] || ROLE_COLORS.user,
      )}
    >
      {ROLE_LABELS[finalRole] || capitalize(finalRole)}
    </Badge>
  );
}

function StatusBadge({ status }) {
  const s = (status || "inativo").toLowerCase();

  const classes =
    s === "ativo"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "pendente"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <Badge variant="outline" className={cn("border text-xs", classes)}>
      {STATUS_LABELS[s] || capitalize(s)}
    </Badge>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="w-32 shrink-0 text-slate-500">{label}</div>
      <div className="flex-1 text-right text-slate-800">{value}</div>
    </div>
  );
}

export default UsuariosManager;
