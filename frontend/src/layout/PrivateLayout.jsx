import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";
import FloatingTools from "@/components/ui/FloatingTools";

export default function PrivateLayout() {
  return (
    <div className="auth-root min-h-screen flex flex-col">
      <PublicHeader variant="client" />

      <div className="flex-1">
        <main className="layout-limit py-10">
          <Outlet />
        </main>
      </div>

      <FloatingTools />
    </div>
  );
}