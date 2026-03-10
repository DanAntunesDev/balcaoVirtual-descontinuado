import React from "react";
import clsx from "clsx";

const Checkbox = React.forwardRef(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="inline-flex items-center gap-2 text-sm text-sa-neutral-800">
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            "h-4 w-4 rounded border border-sa-neutral-300",
            "text-sa-primary focus:ring-sa-primary-light focus:ring-2 focus:outline-none",
            className
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
