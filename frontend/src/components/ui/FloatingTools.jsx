import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/app/providers/useTheme";

const STORAGE_KEY = "cartorio-font-scale";
const MIN = -3;
const MAX = 3;

export default function FloatingTools() {
  const { theme, toggleTheme } = useTheme();
  const [scale, setScale] = useState(0);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY)) || 0;
    const safe = Math.max(MIN, Math.min(MAX, saved));
    setScale(safe);
    document.documentElement.setAttribute("data-font-scale", safe);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateScale = (value) => {
    const safe = Math.max(MIN, Math.min(MAX, value));
    setScale(safe);
    localStorage.setItem(STORAGE_KEY, safe);
    document.documentElement.setAttribute("data-font-scale", safe);
  };

  const popupClass =
    theme === "dark"
      ? "bg-[#1B1C2B] border border-white/10 text-white"
      : "bg-white border border-neutral-200 text-black";

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">

      {/* FONT CONTROL */}
      <div className="relative" ref={menuRef}>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="h-10 w-10 rounded-full bg-[#1B1C2B] text-white shadow-md flex items-center justify-center"
        >
          A+
        </button>

        {open && (
          <div
            className={`absolute right-14 top-1/2 -translate-y-1/2 rounded-xl shadow-xl p-2 flex flex-col gap-2 ${popupClass}`}
          >
            <button
              onClick={() => updateScale(scale + 1)}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              A+
            </button>

            <button
              onClick={() => updateScale(0)}
              className="px-4 py-2 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center"
              title="Tamanho padrão"
            >
              <span className="material-symbols-outlined">
                restart_alt
              </span>
            </button>

            <button
              onClick={() => updateScale(scale - 1)}
              className="px-4 py-2 rounded-lg hover:bg-white/10 transition"
            >
              A-
            </button>
          </div>
        )}
      </div>

      {/* THEME */}
      <button
        onClick={toggleTheme}
        className="h-10 w-10 rounded-full bg-[#1B1C2B] text-white shadow-md flex items-center justify-center"
      >
        <span className="material-symbols-outlined">
          {theme === "light" ? "dark_mode" : "light_mode"}
        </span>
      </button>

      {/* TOP */}
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="h-10 w-10 rounded-full bg-[#7C3AED] text-white shadow-md flex items-center justify-center"
      >
        ↑
      </button>
    </div>
  );
}