import React from "react";
import clsx from "clsx";

const Badge = ({ children, variant = "primary", className }) => {
  const variants = {
    primary: "bg-sa-primary-light text-sa-primary",
    neutral: "bg-sa-neutral-200 text-sa-neutral-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    outline: "border border-sa-primary text-sa-primary bg-transparent",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant] || variants.primary,
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
