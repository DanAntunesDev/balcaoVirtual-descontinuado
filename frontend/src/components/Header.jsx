import { useState, useEffect, useRef } from "react";
import { BsSearch } from "react-icons/bs";
import { LogOut } from "lucide-react";
import logo from "../assets/Rastrum.png";
import { useAuth } from "@/domain/auth/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

// Helper para capitalizar nome e sobrenome
function formatName(str = "") {
  return String(str)
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

export default function Header({ onSearch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [greeting, setGreeting] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [selectedFilter, setSelectedFilter] = useState("Cidade");
  const [searchTerm, setSearchTerm] = useState("");

  const buttonRef = useRef(null);
  const filters = ["Cidade", "Cartório", "Status"];

  // Saudação dinâmica
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");
  }, []);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!buttonRef.current?.contains(e.target)) setDropdownOpen(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Calcula posição do dropdown
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    }
  }, [dropdownOpen]);

  // Atualiza busca enquanto digita
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value, selectedFilter);
  };

  // Busca ao pressionar Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchTerm, selectedFilter);
    }
  };

  const rawName =
    user?.name ||
    user?.username ||
    user?.nome ||
    (user?.email ? user.email.split("@")[0] : "Usuário");
  const nomeFormatado = formatName(rawName);

  const navItems = [
    { label: "Home", path: "/home" },
    { label: "Meus Agendamentos", path: "/agendamentos" },
  ];

  return (
    <>
      <header className="relative text-white rounded-b-3xl shadow-lg overflow-hidden pb-10">
        {/* Degradê animado */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6f3ad9] via-[#804fd8] to-[#9b6eff] animate-gradient-x" />

        {/* Saudação e botão sair */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center">
          <p className="text-lg font-semibold whitespace-nowrap drop-shadow-sm">
            {`${greeting}, ${nomeFormatado}!`}
          </p>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-white text-[#804fd8] font-semibold px-5 py-2 rounded-full shadow hover:bg-purple-100 transition whitespace-nowrap"
          >
            <LogOut size={18} /> Sair
          </button>
        </div>

        {/* Logo e título */}
        <div className="relative z-10 flex flex-col items-center mt-6 -mb-2">
          <img
            src={logo}
            alt="Rastrum"
            className="w-36 mb-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] select-none"
          />
          <h1 className="text-3xl font-semibold tracking-tight drop-shadow-sm">
            Balcão Virtual
          </h1>
        </div>

        {/* Barra de busca */}
        <div className="relative z-10 flex justify-center mt-6 px-4">
          <div className="flex items-center bg-white shadow-md rounded-full px-5 py-3 w-full max-w-2xl relative">
            <BsSearch size={18} className="text-[#804fd8] mr-3" />
            <input
              type="text"
              placeholder={`Buscar por ${selectedFilter.toLowerCase()}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="flex-1 text-gray-700 placeholder-gray-400 outline-none"
            />
            <button
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setDropdownOpen(!dropdownOpen);
              }}
              className="ml-3 bg-[#804fd8] text-white px-4 py-2 rounded-full font-medium hover:opacity-90 transition"
            >
              {selectedFilter}
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="relative z-10 flex justify-center mt-6 space-x-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-8 py-2 rounded-full font-medium text-sm transition-all ${isActive
                    ? "bg-white text-[#804fd8] shadow-lg"
                    : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Dropdown de filtro */}
      {dropdownOpen && (
        <div
          className="fixed z-50 w-40 bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {filters.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSelectedFilter(item);
                setDropdownOpen(false);
                // Atualiza busca automaticamente ao trocar o filtro
                if (onSearch) onSearch(searchTerm, item);
              }}
              className={`block w-full text-left px-4 py-2 text-sm font-medium transition ${selectedFilter === item
                  ? "bg-purple-100 text-[#804fd8]"
                  : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
