import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

/**
 * CONTEXTO DO SELECT
 * - value atual
 * - handler de mudança (compatível com shadcn)
 * - estado de abertura
 * - refs do trigger/content
 * - posição (top/bottom)
 * - mapa value -> label (pra não mostrar ID/minúsculo no trigger)
 */
const SelectContext = createContext({});

function textFromChildren(children) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  // tenta extrair texto simples quando children é array (ex: ["Admin"])
  if (Array.isArray(children)) {
    const flat = children
      .map((c) => (typeof c === "string" || typeof c === "number" ? String(c) : ""))
      .join("")
      .trim();
    return flat || null;
  }

  return null;
}

export function Select({
  value,
  onValueChange,
  onChange, // fallback
  placeholder,
  children,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState("bottom");

  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  // value->label (ex: "1" -> "Cartório Oliveira")
  const labelsRef = useRef(new Map());
  const [, force] = useState(0); // força re-render quando registrar labels

  const handleChange = onValueChange || onChange;

  // registra opção (SelectItem chama isso)
  const registerOption = useCallback((val, label) => {
    if (val == null) return;
    const key = String(val);

    // evita re-render infinito se for o mesmo texto
    const prev = labelsRef.current.get(key);
    if (prev === label) return;

    labelsRef.current.set(key, label);
    force((x) => x + 1);
  }, []);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Decide abrir para cima ou para baixo
  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();

    if (window.innerHeight - triggerRect.bottom < contentRect.height + 10) {
      setPosition("top");
    } else {
      setPosition("bottom");
    }
  }, [open]);

  const selectedLabel =
    value != null ? labelsRef.current.get(String(value)) : undefined;

  return (
    <SelectContext.Provider
      value={{
        value,
        onChange: handleChange,
        placeholder,
        open,
        setOpen,
        triggerRef,
        contentRef,
        position,
        registerOption,
        selectedLabel,
      }}
    >
      <div className={clsx("relative w-full", className)}>{children}</div>
    </SelectContext.Provider>
  );
}

/**
 * TRIGGER
 * - Agora respeita children (ex: <SelectValue />)
 * - E também usa selectedLabel automaticamente (pra não mostrar id/minúsculo)
 */
export function SelectTrigger({ className, children }) {
  const { value, placeholder, open, setOpen, triggerRef, selectedLabel } =
    useContext(SelectContext);

  const display = selectedLabel || value || placeholder;

  return (
    <button
      ref={triggerRef}
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      className={clsx(
        "h-10 w-full rounded-lg border border-sa-neutral-200 bg-white px-3",
        "flex items-center justify-between text-sm",
        "focus:outline-none focus:ring-2 focus:ring-sa-primary-light",
        open && "border-sa-primary bg-sa-primary-light/10",
        className
      )}
    >
      <span className={clsx(!value && !selectedLabel && "text-sa-neutral-700/60")}>
        {/* Se você passou children (ex: <SelectValue/>), renderiza */}
        {children ? children : display}
      </span>

      <ChevronDown
        size={16}
        className={clsx("transition-transform", open && "rotate-180")}
      />
    </button>
  );
}

/**
 * VALUE (compatibilidade shadcn)
 * - Se tiver children, ele mostra children
 * - Senão, mostra selectedLabel/value/placeholder
 */
export function SelectValue({ placeholder: ph, children }) {
  const { value, placeholder, selectedLabel } = useContext(SelectContext);

  if (children) return <span>{children}</span>;

  return <span>{selectedLabel || value || ph || placeholder}</span>;
}

/**
 * CONTENT
 */
export function SelectContent({ className, children }) {
  const { open, contentRef, triggerRef, position } = useContext(SelectContext);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={clsx(
        "absolute z-50 w-full rounded-lg border border-sa-neutral-200",
        "bg-white shadow-xl px-1 py-1 animate-fadeIn",
        position === "top" ? "bottom-12" : "top-12",
        className
      )}
      style={{ minWidth: triggerRef.current?.offsetWidth }}
    >
      <div className="max-h-60 overflow-y-auto">{children}</div>
    </div>
  );
}

/**
 * ITEM
 * - registra automaticamente o label no mapa value->label
 */
export function SelectItem({ value: itemValue, children, className }) {
  const { value, onChange, setOpen, registerOption } = useContext(SelectContext);

  const selected = String(value) === String(itemValue);

  useEffect(() => {
    const label = textFromChildren(children) || String(itemValue);
    registerOption?.(itemValue, label);
  }, [children, itemValue, registerOption]);

  return (
    <button
      type="button"
      onClick={() => {
        if (!onChange) return;
        onChange(itemValue);
        setOpen(false);
      }}
      className={clsx(
        "w-full text-left px-3 py-2 rounded-md text-sm",
        "hover:bg-sa-primary-light/20 transition-colors",
        selected && "bg-sa-primary-light/40 text-sa-primary font-medium",
        className
      )}
    >
      {children}
    </button>
  );
}
