import Sidebar from "@/shared/components/Sidebar";

export default function LayoutBase({ children, menuConfig }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar config={menuConfig} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
