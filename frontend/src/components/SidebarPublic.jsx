import { useState } from "react";
import {
  CalendarDays,
  Building2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function SidebarPublic({ onToggle }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle(newState); // comunica ao Header pra se mover
  };

  const menuItems = [
    { name: "Cartórios", icon: <Building2 size={20} /> },
    { name: "Meus Agendamentos", icon: <CalendarDays size={20} /> },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-[#9b8cff] to-[#5a2fcf] text-white flex flex-col justify-between p-5 transition-all duration-300 shadow-xl rounded-r-3xl ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Botão de expandir */}
      <div className="flex items-center justify-end mb-8">
        <button
          onClick={toggleSidebar}
          className="text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Itens de navegação */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <button
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition"
                title={isOpen ? "" : item.name}
              >
                {item.icon}
                {isOpen && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
