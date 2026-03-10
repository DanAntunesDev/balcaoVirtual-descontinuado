import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../services/passwordServices";
import { useToast } from "../../components/Toasts/ToastProvider";
import { useAuth } from "@/domain/auth/useAuth";

export default function PasswordNew() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #fafaff 0%, #f3e8ff 50%, #e9d5ff 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full max-w-[440px] bg-white rounded-3xl border border-white shadow-[0_32px_64px_-12px_rgba(127,19,236,0.15)] p-6">
        <h1 className="text-2xl font-bold">Criar nova senha</h1>
        <p className="text-sm text-[#756189] mt-2">
          Defina uma senha nova para concluir o processo.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();

            if (newPassword.length < 8) {
              showToast("failure", "A senha deve ter pelo menos 8 caracteres.");
              return;
            }
            if (newPassword !== confirm) {
              showToast("failure", "As senhas não coincidem.");
              return;
            }

            setLoading(true);
            try {
              await resetPassword({
                new_password: newPassword,
                confirm_password: confirm,
              });

              showToast("success", "Senha alterada! Faça login novamente.");
              // por segurança: limpa o token temporário
              logout();
              navigate("/login", { replace: true });
            } catch (err) {
              showToast("failure", err?.response?.data?.message || "Falha ao redefinir senha.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-50 rounded-xl"
            placeholder="Nova senha"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-3 bg-gray-50 rounded-xl"
            placeholder="Confirmar senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#7f13ec] text-white font-bold rounded-xl disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </main>
  );
}
