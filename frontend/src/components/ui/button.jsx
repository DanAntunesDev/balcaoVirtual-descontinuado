import React from "react";
import clsx from "clsx";

const baseClasses =
  "inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sa-primary-light gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses = {
  default:
    "bg-sa-primary text-white hover:bg-sa-primary-dark shadow-md hover:shadow-lg",
  primary:
    "bg-sa-primary text-white hover:bg-sa-primary-dark shadow-md hover:shadow-lg",
  outline:
    "border border-sa-primary text-sa-primary bg-transparent hover:bg-sa-primary-light/15",
  ghost:
    "bg-transparent text-sa-primary hover:bg-sa-primary-light/15",
  secondary:
    "bg-sa-primary-light text-sa-primary hover:bg-sa-primary-light/60",
  danger:
    "bg-danger text-white hover:bg-red-600",
};

const sizeClasses = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-5 py-3 text-base",
  icon: "p-2",
};

const buttonVariants = ({ variant = "default", size = "default", className }) =>
  clsx(
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.default,
    className
  );

const Button = React.forwardRef(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonVariants({ variant, size, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
