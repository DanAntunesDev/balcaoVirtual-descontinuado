import { createContext, useContext, useCallback } from "react";
import { Toaster, toast } from "sonner";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = useCallback((type, message) => {
    toast.custom(() => (
      <div className={`notification notification--${type}`}>
        <div className="notification__body">
          <span className="notification__message">{message}</span>
        </div>

        <div className="notification__progress" />
      </div>
    ));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <Toaster
        position="top-center"
        expand={false}
        closeButton={false}
        toastOptions={{
          unstyled: true,
          duration: 3000,
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}