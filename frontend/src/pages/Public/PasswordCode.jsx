import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toasts/ToastProvider";
import { useAuth } from "@/domain/auth/useAuth";

export default function PasswordCode() {
  const [cpf, setCpf] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { loginWithResetCode } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #fafaff 0%, #f3e8ff 50%, #e9d5ff 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-white shadow-[0_32px_64px_-12px_rgba(127,19,236,0.15)] p-6">
        <h1 className="text-2xl font-bold">Digite o código</h1>
        <p className="text-sm text-[#756189] mt-2">
          Cole o código recebido por e-mail para entrar em modo de redefinição.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            const result = await loginWithResetCode({ cpf, code });
            setLoading(false);

            if (!result?.success) {
              showToast("failure", result?.message || "Código inválido.");
              return;
            }

            showToast("success", "Código validado! Crie sua nova senha.");
            navigate("/password/nova", { replace: true });
          }}
        >
          <input
            className="w-full px-4 py-3 bg-gray-50 rounded-xl"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 bg-gray-50 rounded-xl tracking-widest text-center"
            placeholder="CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#7f13ec] text-white font-bold rounded-xl disabled:opacity-60"
          >
            {loading ? "Validando..." : "Validar código"}
          </button>
        </form>
      </div>
    </main>
  );
}
