import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/domain/auth/useAuth";

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserAvatar({ user }) {
  const photo = user?.foto || user?.avatarUrl || user?.photoUrl || null;
  const name = user?.nome || user?.name || "Usuário";
  const initials = getInitials(name);

  if (photo) {
    return (
      <img
        src={photo}
        alt="Avatar"
        className="w-10 h-10 rounded-full object-cover border border-[#eceaf0]"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-[#583080] text-white flex items-center justify-center font-semibold">
      {initials}
    </div>
  );
}

export default function AppHeader({ mode = "public" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (mode !== "client") return null;

  const displayName = user?.nome || user?.name || "Usuário";

  return (
    <header className="flex items-center justify-between border-b border-[#eceaf0] bg-white px-10 py-3 sticky top-0 z-50">
      
      {/* LOGO */}
      <div
        className="flex items-center gap-3 text-[#583080] cursor-pointer"
        onClick={() => navigate("/cliente")}
      >
        <div className="w-6 h-6">
          <svg viewBox="0 0 48 48" fill="currentColor">
            <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" />
          </svg>
        </div>

        <span className="text-lg font-bold text-[#1F2937]">
          Balcão Virtual
        </span>
      </div>

      {/* MENU */}
      <nav className="flex items-center gap-10">
        {[
          { label: "Cartórios", to: "/cliente" },
          { label: "Agendamentos", to: "/cliente/agendamentos" },
          { label: "Meu Perfil", to: "/cliente/meu-perfil" },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/cliente"}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive
                  ? "text-[#583080] font-bold border-b-2 border-[#583080] pb-1"
                  : "text-[#1F2937] hover:text-[#583080]"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* USER */}
      <div className="relative group flex items-center gap-4">
        <span className="text-sm text-[#6B7280]">
          {displayName}
        </span>

        <UserAvatar user={user} />

        {/* Dropdown */}
        <div className="absolute right-0 top-14 w-52 bg-white border border-[#eceaf0] rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition">
          <button
            className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50"
            onClick={() => navigate("/cliente/meu-perfil")}
          >
            Meu perfil
          </button>

          <button
            className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-50 text-red-600"
            onClick={logout}
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}