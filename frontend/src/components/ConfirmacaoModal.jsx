import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmacaoModal({ isOpen, onClose, nomeCartorio }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-[90%] text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-3">
            Confirmar Agendamento
          </h2>
          <p className="text-gray-600 mb-6">
            Deseja confirmar o agendamento para{" "}
            <span className="font-bold text-gray-800">{nomeCartorio}</span>?
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
