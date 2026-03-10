import React from "react";
import { cn } from "@/lib/utils";

/**
 * StatusBadge - único lugar que define:
 * - texto (sempre MAIÚSCULO)
 * - cores (preenchidas e "foscas"/pastel)
 * Use em TODAS as telas/modais.
 */
export default function StatusBadge({ status, className }) {
  const normalized = String(status || "").toLowerCase();

  const map = {
    confirmado: {
      label: "CONFIRMADO",
      className: "bg-emerald-100 text-emerald-800",
    },
    pendente: {
      label: "PENDENTE",
      className: "bg-amber-100 text-amber-800",
    },
    cancelado: {
      label: "CANCELADO",
      className: "bg-rose-100 text-rose-800",
    },
  };

  const cfg = map[normalized] || {
    label: String(status || "-").toUpperCase(),
    className: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
