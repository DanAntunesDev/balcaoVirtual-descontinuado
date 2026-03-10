import { useRoutes, Navigate } from "react-router-dom";
import { ROLES } from "../constants/roles";

import ProtectedRoute from "@/app/ProtectedRoute";
import RedirectByRole from "@/app/RedirectByRole";

// Layouts
import PrivateLayout from "@/layout/PrivateLayout";

// Públicas
import CartoriosPage from "../pages/Public/Cartorios/CartoriosPage";
import AuthPage from "../pages/Public/Auth";
import PrivacidadePage from "../pages/Public/Privacidade/PrivacidadePage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import Suporte from "@/pages/Public/Suporte";

// Cliente
import ClientCartoriosPage from "../pages/Client/ClientCartoriosPage";
import ClientAgendamentos from "../pages/Client/ClientAgendamentos";
import MeuPerfil from "../pages/Client/MeuPerfil";
import ClientConfiguracoes from "../pages/Client/ClientConfiguracoes";

// SuperAdmin
import SuperAdminDashboards from "../pages/SuperAdmin/Dashboard/SuperAdminDashboards";
import SuperAdminLayout from "../pages/SuperAdmin/SuperAdminLayout";

// Admin
import AdminLayout from "../pages/Admin/AdminLayout";

const routes = [
  { path: "/", element: <CartoriosPage /> },
  { path: "/login", element: <AuthPage /> },
  { path: "/register", element: <AuthPage /> },
  { path: "/privacidade", element: <PrivacidadePage /> },
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "/suporte", element: <Suporte /> },

  {
    path: "/cliente/*",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.CLIENTE]}>
        <PrivateLayout />
      </ProtectedRoute>
    ),
    children: [
      // mantém /cliente como entrada
      { index: true, element: <ClientCartoriosPage /> },

      // rota explícita para o menu
      { path: "cartorios", element: <ClientCartoriosPage /> },

      { path: "agendamentos", element: <ClientAgendamentos /> },
      { path: "configuracoes", element: <ClientConfiguracoes /> },
      { path: "meu-perfil", element: <MeuPerfil /> },
    ],
  },

  {
    path: "/superadmin/*",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.SUPERADMIN]}>
        <SuperAdminLayout />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <SuperAdminDashboards /> }],
  },

  {
    path: "/admin/*",
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.CARTORIO]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
  },

  { path: "/redirect", element: <RedirectByRole /> },
  { path: "*", element: <Navigate to="/" replace /> },
];

export default function AppRoutes() {
  return useRoutes(routes);
}