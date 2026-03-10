import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Senha",
  className = "",
  name,
  required = false,
}) {
  const [show, setShow] = useState(false);

  const hasValue = value && value.length > 0;

  return (
    <div className="relative w-full">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${className} pr-12`}
      />

      <AnimatePresence>
        {hasValue && (
          <motion.div
            className="absolute right-3 inset-y-0 flex items-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15 }}
          >
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="flex items-center justify-center text-[#756189] hover:text-[#7f13ec] transition"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
