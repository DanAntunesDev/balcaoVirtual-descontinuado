import React from "react";
import clsx from "clsx";

const Card = ({ className, ...props }) => (
  <div
    className={clsx(
      "bg-white border border-sa-neutral-200 rounded-xl shadow-soft",
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={clsx("p-4 pb-2 flex flex-col gap-1", className)} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    className={clsx(
      "text-base font-semibold text-sa-neutral-900",
      className
    )}
    {...props}
  />
);

const CardDescription = ({ className, ...props }) => (
  <p
    className={clsx(
      "text-sm text-sa-neutral-700/80",
      className
    )}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={clsx("p-4 pt-0", className)} {...props} />
);

const CardFooter = ({ className, ...props }) => (
  <div className={clsx("px-4 pb-4 pt-2 flex items-center gap-2", className)} {...props} />
);

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
