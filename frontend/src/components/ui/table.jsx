// ./components/ui/table.jsx  
import React from "react";
import clsx from "clsx";

// Wrapper geral
export function Table({ className, ...props }) {
  return (
    <table
      className={clsx(
        "w-full border-collapse text-sm text-sa-neutral-800",
        className
      )}
      {...props}
    />
  );
}

// Thead (alias + versão padrão)
export function TableHeader({ className, ...props }) {
  return (
    <thead className={clsx("bg-sa-neutral-100", className)} {...props} />
  );
}
export const THead = TableHeader;

// TBody (alias + versão padrão)
export function TableBody({ className, ...props }) {
  return <tbody className={clsx("", className)} {...props} />;
}
export const TBody = TableBody;

// Tr (alias + versão padrão)
export function TableRow({ className, ...props }) {
  return (
    <tr
      className={clsx(
        "border-b border-sa-neutral-200 hover:bg-sa-primary-light/10 transition",
        className
      )}
      {...props}
    />
  );
}
export const Tr = TableRow;

// Th (alias + versão padrão)
export function TableHead({ className, ...props }) {
  return (
    <th
      className={clsx(
        "py-3 px-4 font-semibold text-sa-primary text-left whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}
export const Th = TableHead;

// Td (alias + versão padrão)
export function TableCell({ className, ...props }) {
  return (
    <td
      className={clsx(
        "py-3 px-4 text-sa-neutral-800 whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}
export const Td = TableCell;
