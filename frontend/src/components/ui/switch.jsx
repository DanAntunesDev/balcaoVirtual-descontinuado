import * as React from "react";

export function Switch({ checked = false, onCheckedChange, disabled = false }) {
  function toggle() {
    if (!disabled && onCheckedChange) {
      onCheckedChange(!checked);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`
        relative inline-flex h-5 w-10 items-center rounded-full transition 
        ${checked ? "bg-sa-primary" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition
          ${checked ? "translate-x-5" : "translate-x-1"}
        `}
      />
    </button>
  );
}
