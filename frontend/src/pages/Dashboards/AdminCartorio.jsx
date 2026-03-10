import React from "react";
import { motion } from "framer-motion";
import { Plus, LogOut, Home, FileText, Settings } from "lucide-react";
import logo from "../../assets/Rastrum.png";

export default function AdminCartorio() {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#3b0ca0] to-[#7a28ff] text-white flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center justify-center py-8">
            <img src={logo} alt="Rastrum" className="w-32" />
          </div>

          <nav className="flex flex-col px-6 space-y-2">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
              <Home size={20} /> <span>Dashboard</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-all">
              <FileText size={20} /> <span>Cartórios</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/20 transition-all">
              <Settings size={20} /> <span>Configurações</span>
            </button>
          </nav>
        </div>

        <div className="p-6 border-t border-white/20">
          <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl hover:bg-white/20 transition-all">
            <LogOut size={20} /> <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-700">
            Painel Administrativo
          </h1>
          <button className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all">
            <Plus size={18} /> Novo Cartório
          </button>
        </header>

        {/* Content */}
        <section className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(null)
            .map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <h2 className="font-semibold text-lg text-gray-800 mb-2">
                  Cartório {i + 1}
                </h2>
                <p className="text-sm text-gray-500">Itaberaba - BA</p>
                <p className="text-sm text-gray-500 mt-1">
                  Rua Francisco Serra, 5227 - Centro
                </p>

                <div className="mt-4 flex justify-end">
                  <button className="text-sm px-3 py-1 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all">
                    Editar
                  </button>
                </div>
              </motion.div>
            ))}
        </section>
      </main>
    </div>
  );
}
