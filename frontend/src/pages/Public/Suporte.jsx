import PublicHeader from "@/components/layout/PublicHeader";

export default function Suporte() {
  return (
    <div className="auth-root min-h-screen">
      <PublicHeader variant="suporte" />

      <main className="w-full max-w-[900px] mx-auto px-6 pt-16 pb-16">
        <div
          className="
            rounded-bv p-12 text-center
            border border-[color:var(--input-border)]
            bg-[color:var(--card-bg)]
            shadow-[var(--shadow-soft)]
          "
        >
          <span className="material-symbols-outlined text-5xl text-[color:var(--accent-1)] mb-6">
            support_agent
          </span>

          <h1 className="text-3xl font-bold text-[color:var(--text-main)] mb-4">
            Central de Suporte
          </h1>

          <p className="text-[color:var(--text-sub)] text-lg">
            Estamos desenvolvendo um assistente inteligente para ajudar você.
            Em breve você poderá tirar dúvidas diretamente aqui.
          </p>
        </div>
      </main>
    </div>
  );
}