import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/domain/auth/useAuth";
import PublicHeader from "@/components/layout/PublicHeader";
import { setPendingIntent } from "@/domain/navigation/pendingIntentService";
import ForgotPasswordModal from "@/components/modals/ForgotPasswordModal";
import { useToast } from "@/components/Toasts/ToastProvider";

const onlyDigits = (v = "") => v.replace(/\D/g, "");

export default function Auth() {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterRoute = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    return location.pathname === "/register" || mode === "register";
  }, [location.pathname, location.search]);

  const [isLogin, setIsLogin] = useState(!isRegisterRoute);

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    setIsLogin(!isRegisterRoute);
  }, [isRegisterRoute]);

  const goLogin = () => {
    setIsLogin(true);

    if (location.pathname === "/login" && location.search) {
      navigate("/login", { replace: true, state: location.state });
      return;
    }

    if (location.pathname === "/register") {
      navigate("/login", { replace: true, state: location.state });
    }
  };

  const goRegister = () => {
    setIsLogin(false);

    if (location.pathname === "/login" && location.search !== "?mode=register") {
      navigate("/login?mode=register", {
        replace: true,
        state: location.state,
      });
      return;
    }

    if (location.pathname !== "/register" && location.pathname !== "/login") {
      navigate("/login?mode=register", {
        replace: true,
        state: location.state,
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        cpf: onlyDigits(cpf),
        password,
      });

      showToast("success", "Login realizado com sucesso.");

      const next = location.state?.next;
      const intent = location.state?.intent;

      if (intent) setPendingIntent(intent);

      if (next) {
        navigate(next, { replace: true });
      } else {
        navigate("/redirect", { replace: true });
      }
    } catch (error) {
      const msg = error?.message || "Falha ao fazer login.";
      showToast("error", msg);
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register({
        nome,
        cpf: onlyDigits(cpfCnpj),
        email,
        password: regPassword,
      });

      showToast("success", "Conta criada com sucesso.");

      const next = location.state?.next;
      const intent = location.state?.intent;

      if (intent) setPendingIntent(intent);

      if (next) {
        navigate(next, { replace: true });
      } else {
        navigate("/redirect", { replace: true });
      }
    } catch (error) {
      const msg = error?.message || "Erro ao criar conta.";
      showToast("error", msg);
      console.error("Erro no cadastro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <PublicHeader
        variant="login"
        links={[
          { to: "/suporte", label: "Suporte" },
          { to: "/privacidade", label: "Privacidade" },
        ]}
      />

      <main className="auth-main">
        <div className="card-container">
          <div className="auth-scene">
            <div className={`auth-flip ${isLogin ? "" : "is-register"}`}>
              <div className="auth-face auth-face--front">
                <div className="auth-card">
                  <div className="card-accent" />

                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        lock_person
                      </span>
                    </div>

                    <h1>Balcão Virtual</h1>
                    <p>Acesse a plataforma institucional com segurança.</p>

                    <form onSubmit={handleLogin}>
                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          badge
                        </span>
                        <input
                          placeholder="Digite seu CPF"
                          type="text"
                          inputMode="numeric"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          key
                        </span>
                        <input
                          placeholder="••••••••"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="forgot">
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => setForgotOpen(true)}
                        >
                          Esqueci minha senha?
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                      >
                        {loading ? "Entrando..." : "Acessar Plataforma"}
                      </button>
                    </form>
                  </div>

                  <div className="card-footer">
                    Não tem uma conta?
                    <button type="button" onClick={goRegister}>
                      Registre-se
                    </button>
                  </div>
                </div>
              </div>

              <div className="auth-face auth-face--back">
                <div className="auth-card">
                  <div className="card-accent" />

                  <div className="card-content">
                    <div className="icon-box">
                      <span className="material-symbols-outlined">
                        person_add
                      </span>
                    </div>

                    <h1>Crie sua conta</h1>
                    <p>Preencha os dados abaixo para acessar o Balcão Virtual</p>

                    <form onSubmit={handleRegister}>
                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          person
                        </span>
                        <input
                          placeholder="Nome completo"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          badge
                        </span>
                        <input
                          placeholder="CPF"
                          value={cpfCnpj}
                          onChange={(e) => setCpfCnpj(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          mail
                        </span>
                        <input
                          placeholder="E-mail"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="input-group">
                        <span className="material-symbols-outlined icon">
                          key
                        </span>
                        <input
                          placeholder="Senha"
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading}
                      >
                        {loading ? "Criando..." : "Finalizar Cadastro"}
                      </button>
                    </form>
                  </div>

                  <div className="card-footer">
                    Já possui uma conta?
                    <button type="button" onClick={goLogin}>
                      Fazer login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="auth-footer">
        © 2024 Rastrum Tecnologias. Todos os direitos reservados.
      </footer>

      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
        cpfInitial={cpf}
      />
    </div>
  );
}