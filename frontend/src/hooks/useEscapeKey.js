import { useEffect } from "react";

export function useEscapeKey(onClose) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
}