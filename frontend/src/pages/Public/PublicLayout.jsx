import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/layout/PublicHeader";

export default function PublicClientLayout() {
  return (
    <>
      <PublicHeader />
      <Outlet />
    </>
  );
}
