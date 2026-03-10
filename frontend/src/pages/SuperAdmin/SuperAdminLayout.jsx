import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

/*
  Layout SuperAdmin
  - Sidebar fixa (100vh)
  - Scroll SOMENTE no conteúdo
  - Sidebar nunca sobe ao scrollar
  - Botão Sair sempre visível
*/

export default function SuperAdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const SIDEBAR_OPEN_WIDTH = 260;
  const SIDEBAR_CLOSED_WIDTH = 88;

  const pageTitles = {
    "/superadmin": "Dashboard",
    "/superadmin/dashboard": "Dashboard",
    "/superadmin/cartorios": "Cartórios",
    "/superadmin/usuarios": "Usuários",
    "/superadmin/agendamentos": "Agendamentos",
  };

  const currentTitle =
    pageTitles[location.pathname] || "Área SuperAdmin";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-[#f4f5f7] flex">

      {/* ================= SIDEBAR ================= */}
      <motion.aside
        animate={{
          width: isSidebarOpen
            ? SIDEBAR_OPEN_WIDTH
            : SIDEBAR_CLOSED_WIDTH,
        }}
        transition={{ duration: 0.25 }}
        className="
          fixed top-0 left-0 h-screen z-40
          flex flex-col
          bg-gradient-to-b from-purple-600 to-purple-800
          text-white
        "
      >
        {/* TOPO */}
        <div className="h-20 flex items-center justify-center border-b border-white/20 shrink-0">
          {isSidebarOpen ? (
            <span className="text-xl font-bold">SUPERADMIN</span>
          ) : (
            <span className="text-lg font-bold">SA</span>
          )}
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <SidebarLink
            to="/superadmin/dashboard"
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            open={isSidebarOpen}
            end
          />

          <SidebarLink
            to="/superadmin/cartorios"
            icon={<Building2 size={20} />}
            label="Cartórios"
            open={isSidebarOpen}
          />

          <SidebarLink
            to="/superadmin/usuarios"
            icon={<Users size={20} />}
            label="Usuários"
            open={isSidebarOpen}
          />

          <SidebarLink
            to="/superadmin/agendamentos"
            icon={<CalendarCheck size={20} />}
            label="Agendamentos"
            open={isSidebarOpen}
          />
        </nav>

        {/* BOTÃO TOGGLE */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="
            absolute -right-3 top-24
            bg-white text-purple-700
            p-1 rounded-full shadow
          "
        >
          {isSidebarOpen ? (
            <ChevronLeft size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {/* SAIR */}
        <div className="p-4 border-t border-white/20 shrink-0">
          <button
            onClick={handleLogout}
            className="
              w-full flex items-center justify-center gap-2
              bg-purple-900/40 hover:bg-purple-900/60
              p-3 rounded-lg transition
            "
          >
            <LogOut size={18} />
            {isSidebarOpen && "Sair"}
          </button>
        </div>
      </motion.aside>

      {/* ================= CONTEÚDO ================= */}
      <div
        className="flex flex-col flex-1 min-h-screen"
        style={{
          marginLeft: isSidebarOpen
            ? SIDEBAR_OPEN_WIDTH
            : SIDEBAR_CLOSED_WIDTH,
        }}
      >
        {/* HEADER */}
        <header className="
          h-20 bg-white border-b px-6
          flex items-center justify-between
          shrink-0
        ">
          <h2 className="text-xl font-semibold">{currentTitle}</h2>
          <button className="border px-3 py-2 rounded text-sm">
            Tema (breve)
          </button>
        </header>

        {/* MAIN — ÚNICO SCROLL */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ========== LINK SIDEBAR ========== */
function SidebarLink({ to, icon, label, open, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `
        relative flex items-center gap-3 px-3 py-2 rounded-md transition
        ${
          isActive
            ? "bg-white/20 text-white"
            : "text-purple-100 hover:bg-white/10"
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-md" />
          )}
          {icon}
          {open && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}
