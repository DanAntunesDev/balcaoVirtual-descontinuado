import React from "react";
import clsx from "clsx";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={clsx(
        "flex h-10 w-full rounded-lg border border-sa-neutral-200 bg-white px-3 py-2",
        "text-sm text-sa-neutral-900 placeholder:text-sa-neutral-700/60",
        "focus:outline-none focus:ring-2 focus:ring-sa-primary-light focus:border-sa-primary",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
