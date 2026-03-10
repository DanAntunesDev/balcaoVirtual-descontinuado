import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function ModalCancelarAgendamento({ onClose, onConfirm }) {
  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const confirmar = () => {
    toast.success("Agendamento cancelado com sucesso!");
    onConfirm?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-lg text-center"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            Deseja realmente cancelar?
          </h2>
          <p className="text-gray-600 mb-6">
            Essa ação não poderá ser desfeita.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
            >
              Fechar
            </button>
            <button
              onClick={confirmar}
              className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
