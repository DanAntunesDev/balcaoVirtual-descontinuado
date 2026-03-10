import { useState } from "react";
import { Link } from "react-router-dom";
import "./auth-card.css";
import "./auth-flip.css";

export default function AuthCard({ onLogin, onRegister }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({
    cpf: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    nome: "",
    cpf: "",
    email: "",
    password: "",
  });

  const toggleFlip = () => {
    if (!isSubmitting) setIsFlipped((prev) => !prev);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!onLogin || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onLogin(loginData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!onRegister || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onRegister(registerData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #fafaff 0%, #f3e8ff 50%, #e9d5ff 100%)",
        backgroundAttachment: "fixed",
        fontFamily: "'Public Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-40 flex justify-center py-4 sm:py-5">
        <div className="flex flex-col w-full max-w-[960px]">
          <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 py-3 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm gap-4">
            <div className="flex items-center gap-2 sm:gap-3 text-[#7f13ec] flex-shrink-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 relative flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                </svg>
              </div>
              <h2 className="text-[#141118] text-lg sm:text-xl font-bold hidden sm:block">
                Rastrum
              </h2>
            </div>
          </header>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-[440px] min-h-[700px]"
          style={{ perspective: "1000px" }}
        >
          <div
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* LOGIN */}
            <div
              style={{ backfaceVisibility: "hidden" }}
              className="w-full bg-white rounded-3xl shadow-lg overflow-hidden border border-white"
            >
              <div className="pt-10 pb-4 px-4 text-center">
                <h1 className="text-2xl font-bold">Balcão Virtual</h1>
                <p className="text-sm text-[#756189] mt-2">
                  Bem-vindo de volta!
                </p>
              </div>

              <div className="px-4 pb-8">
                <form className="space-y-5" onSubmit={handleLoginSubmit}>
                  <input
                    type="text"
                    placeholder="CPF"
                    value={loginData.cpf}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        cpf: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <div className="flex justify-end">
                    <Link
                      to="/password/solicitar"
                      className="text-xs font-semibold text-[#7f13ec] hover:underline"
                    >
                      Esqueci minha senha
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#7f13ec] text-white font-bold rounded-xl disabled:opacity-60"
                  >
                    {isSubmitting ? "Entrando..." : "Acessar Plataforma"}
                  </button>
                </form>
              </div>

              <div className="bg-gray-50 py-6 text-center">
                <p className="text-sm text-[#756189]">
                  Não tem uma conta?
                  <button
                    type="button"
                    onClick={toggleFlip}
                    className="ml-1 text-[#7f13ec] font-bold hover:underline"
                  >
                    Registre-se
                  </button>
                </p>
              </div>
            </div>

            {/* CADASTRO */}
            <div
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
              className="w-full bg-white rounded-3xl shadow-lg overflow-hidden border border-white absolute top-0 left-0"
            >
              <div className="pt-10 pb-4 px-4 text-center">
                <h1 className="text-2xl font-bold">Criar conta</h1>
                <p className="text-sm text-[#756189] mt-2">
                  Preencha os dados abaixo
                </p>
              </div>

              <div className="px-4 pb-8">
                <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                  <input
                    placeholder="Nome completo"
                    value={registerData.nome}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        nome: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <input
                    placeholder="CPF"
                    value={registerData.cpf}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        cpf: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <input
                    type="email"
                    placeholder="E-mail"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <input
                    type="password"
                    placeholder="Senha"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#7f13ec] text-white font-bold rounded-xl disabled:opacity-60"
                  >
                    {isSubmitting ? "Cadastrando..." : "Cadastrar Agora"}
                  </button>
                </form>
              </div>

              <div className="bg-gray-50 py-6 text-center">
                <p className="text-sm text-[#756189]">
                  Já tem uma conta?
                  <button
                    type="button"
                    onClick={toggleFlip}
                    className="ml-1 text-[#7f13ec] font-bold hover:underline"
                  >
                    Faça login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-[#756189]">
          © 2024 Rastrum Tecnologias.
        </footer>
      </main>
    </div>
  );
}
