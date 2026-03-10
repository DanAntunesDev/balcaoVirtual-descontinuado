import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestPasswordCode } from "../../services/passwordServices";
import { useToast } from "../../components/Toasts/ToastProvider";

export default function PasswordRequest() {
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #fafaff 0%, #f3e8ff 50%, #e9d5ff 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-white shadow-[0_32px_64px_-12px_rgba(127,19,236,0.15)] p-6">
        <h1 className="text-2xl font-bold">Recuperação de senha</h1>
        <p className="text-sm text-[#756189] mt-2">
          Informe seu e-mail e CPF. Vamos enviar um código temporário.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await requestPasswordCode({ email, cpf });
              showToast("success", "Código enviado! Verifique seu e-mail.");
              navigate("/password/codigo", { replace: true });
            } catch (err) {
              showToast("failure", err?.response?.data?.message || "Falha ao solicitar código.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input
            className="w-full px-4 py-3 bg-gray-50 rounded-xl"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full px-4 py-3 bg-gray-50 rounded-xl"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#7f13ec] text-white font-bold rounded-xl disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      </div>
    </main>
  );
}
