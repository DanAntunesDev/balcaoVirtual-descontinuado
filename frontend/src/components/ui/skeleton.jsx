import React from "react";
import clsx from "clsx";

const Skeleton = ({ className }) => {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-sa-neutral-200/80",
        className
      )}
    />
  );
};

export { Skeleton };
