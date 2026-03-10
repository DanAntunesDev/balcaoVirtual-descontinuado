import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="h-full w-64 bg-sidebar text-sidebar-text flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-lg font-bold">Rastrum</h2>

        {user && (
          <p className="text-sm opacity-80 mt-1">
            {user.nome || user.email}
          </p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/cliente">Cartórios</NavLink>
        <NavLink to="/cliente/agendamentos">Agendamentos</NavLink>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-md text-left hover:bg-sidebar-hover transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
