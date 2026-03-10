import AuthProvider from "@/domain/auth/authProvider";
import { ToastProvider } from "@/components/Toasts/ToastProvider";
import ThemeProvider  from "./ThemeProvider";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}