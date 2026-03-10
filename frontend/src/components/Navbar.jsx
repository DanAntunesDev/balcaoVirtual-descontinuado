import React from "react";
import { useAuth } from "@/domain/auth/useAuth";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full bg-[#3b0ca0] text-white flex justify-between items-center px-6 py-3 shadow-md">
      <h1 className="font-semibold text-lg tracking-wide">Rastrum Dashboard</h1>

      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm text-white/80">
              {user.username || user.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all"
            >
              <LogOut size={18} />
              Sair
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
