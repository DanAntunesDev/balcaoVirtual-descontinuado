import React from "react";
import clsx from "clsx";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={clsx(
        "w-full min-h-[90px] rounded-lg border border-sa-neutral-200 bg-white px-3 py-2",
        "text-sm text-sa-neutral-900 placeholder:text-sa-neutral-700/60",
        "focus:outline-none focus:ring-2 focus:ring-sa-primary-light focus:border-sa-primary",
        "resize-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
