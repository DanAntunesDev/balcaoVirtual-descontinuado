import { Toaster } from "sonner";
import { useEffect } from "react";
import { installToastAdapter } from "../Toasts/toast-adapter";
import "./auth-toast.css";

export default function AuthToast() {
  useEffect(() => {
    installToastAdapter();
  }, []);

  return (
    <Toaster
      position="top-center"
      expand={false}
      closeButton={false}
      toastOptions={{
        unstyled: true,
        duration: 3000,
      }}
    />
  );
}
