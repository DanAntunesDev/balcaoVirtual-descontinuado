import { useEffect, useMemo, useRef, useState } from "react";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useToast } from "@/components/Toasts/ToastProvider";

import {
  requestPasswordReset,
  validatePasswordResetCode,
  resetPasswordWithCode,
} from "@/services/passwordResetService";

import "./agendamentoModal.css";
import "./forgotPasswordModal.css";

function getThemeClass() {
  const t = document.documentElement?.getAttribute("data-theme");
  if (t && t.toLowerCase() === "light") return "is-light";
  return "is-dark";
}

function onlyDigits(v = "") {
  return String(v || "").replace(/\D/g, "");
}

function normalizeCode(v = "") {
  return String(v || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function splitCode(str) {
  const s = normalizeCode(str);
  return Array.from({ length: 6 }).map((_, i) => (s[i] ? s[i] : ""));
}

function joinCode(arr) {
  return normalizeCode((arr || []).join(""));
}

function CodeBoxes({ value, onChange, disabled }) {
  const inputsRef = useRef([]);
  const codeArr = useMemo(() => splitCode(value), [value]);

  const setAt = (idx, char) => {
    const next = [...codeArr];
    next[idx] = char;
    onChange(joinCode(next));
  };

  const focusAt = (idx) => {
    const el = inputsRef.current?.[idx];
    if (el) el.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      if (codeArr[idx]) {
        setAt(idx, "");
      } else {
        const prev = Math.max(0, idx - 1);
        setAt(prev, "");
        focusAt(prev);
      }
      return;
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(Math.max(0, idx - 1));
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(Math.min(5, idx + 1));
      return;
    }

    const char = normalizeCode(e.key);
    if (char && char.length === 1) {
      e.preventDefault();
      setAt(idx, char);
      focusAt(Math.min(5, idx + 1));
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;

    const text = normalizeCode(e.clipboardData.getData("text"));
    if (!text) return;

    e.preventDefault();
    const next = splitCode(text);
    onChange(joinCode(next));

    const lastFilled = Math.min(5, text.length - 1);
    focusAt(Math.max(0, lastFilled));
  };

  return (
    <div className="fp-code" onPaste={handlePaste}>
      {codeArr.map((ch, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          className="fp-code-box"
          inputMode="text"
          autoComplete="one-time-code"
          maxLength={1}
          value={ch}
          onChange={(e) => {
            const val = normalizeCode(e.target.value);
            setAt(idx, val.slice(-1));
            if (val) focusAt(Math.min(5, idx + 1));
          }}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

export default function ForgotPasswordModal({ open, onClose, cpfInitial = "" }) {
  const { showToast } = useToast();

  const [themeClass, setThemeClass] = useState("is-dark");
  const [step, setStep] = useState("request"); // request | code | new | done
  const [loading, setLoading] = useState(false);

  const [cpf, setCpf] = useState(onlyDigits(cpfInitial));
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEscapeKey(() => {
    if (open) onClose();
  });

  useEffect(() => {
    if (!open) return;
    setThemeClass(getThemeClass());
    setStep("request");
    setLoading(false);
    setCpf(onlyDigits(cpfInitial));
    setEmail("");
    setCode("");
    setPassword("");
    setPasswordConfirm("");
  }, [open, cpfInitial]);

  async function handleRequest() {
    setLoading(true);
    try {
      await requestPasswordReset({ cpf, email });
      showToast("success", "Código enviado. Verifique seu e-mail.");
      setStep("code");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Não foi possível enviar o código.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleValidateCode() {
    setLoading(true);
    try {
      await validatePasswordResetCode({ cpf, email, code });
      showToast("success", "Código validado.");
      setStep("new");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Código inválido.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset() {
    setLoading(true);
    try {
      await resetPasswordWithCode({
        cpf,
        email,
        code,
        password,
        password_confirm: passwordConfirm,
      });
      showToast("success", "Senha alterada com sucesso.");
      setStep("done");
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.message || "Não foi possível alterar a senha.";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const title =
    step === "request" ? "Recuperar senha"
    : step === "code" ? "Informe o código"
    : step === "new" ? "Definir nova senha"
    : "Pronto";

  const subtitle =
    step === "request" ? "Vamos enviar um código para o seu e-mail."
    : step === "code" ? "Digite o código de 6 caracteres recebido."
    : step === "new" ? "Crie uma nova senha para sua conta."
    : "Sua senha foi alterada.";

  return (
    <div className={`bv-modal-theme ${themeClass}`}>
      <div className="bv-modal-overlay" onMouseDown={onClose}>
        <div className="bv-modal fp-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
          <div className="bv-modal-inner">
            <div className="bv-modal-header">
              <div className="bv-modal-title">
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>

              <button className="bv-close" type="button" onClick={onClose}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="fp-body">
              {step === "request" && (
                <>
                  <div className="fp-grid">
                    <div className="fp-field">
                      <label>CPF</label>
                      <input
                        value={cpf}
                        onChange={(e) => setCpf(onlyDigits(e.target.value))}
                        inputMode="numeric"
                        placeholder="Digite seu CPF"
                      />
                    </div>

                    <div className="fp-field">
                      <label>E-mail</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu e-mail"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="fp-actions">
                    <button className="btn-secondary" type="button" onClick={onClose} disabled={loading}>
                      Cancelar
                    </button>

                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleRequest}
                      disabled={loading || cpf.length < 11 || !email}
                    >
                      {loading ? "Enviando..." : "Enviar código"}
                    </button>
                  </div>
                </>
              )}

              {step === "code" && (
                <>
                  <div className="fp-code-wrap">
                    <CodeBoxes value={code} onChange={setCode} disabled={loading} />
                    <div className="fp-hint">Você pode colar o código completo.</div>
                  </div>

                  <div className="fp-actions">
                    <button className="btn-secondary" type="button" onClick={() => setStep("request")} disabled={loading}>
                      Voltar
                    </button>

                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleValidateCode}
                      disabled={loading || normalizeCode(code).length !== 6}
                    >
                      {loading ? "Validando..." : "Confirmar código"}
                    </button>
                  </div>
                </>
              )}

              {step === "new" && (
                <>
                  <div className="fp-grid">
                    <div className="fp-field">
                      <label>Nova senha</label>
                      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Nova senha" />
                    </div>

                    <div className="fp-field">
                      <label>Confirmar nova senha</label>
                      <input value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} type="password" placeholder="Confirmar nova senha" />
                    </div>
                  </div>

                  <div className="fp-actions">
                    <button className="btn-secondary" type="button" onClick={onClose} disabled={loading}>
                      Cancelar
                    </button>

                    <button
                      className="btn-primary"
                      type="button"
                      onClick={handleReset}
                      disabled={loading || !password || password !== passwordConfirm}
                    >
                      {loading ? "Confirmando..." : "Confirmar"}
                    </button>
                  </div>
                </>
              )}

              {step === "done" && (
                <>
                  <div className="fp-done">
                    <span className="material-symbols-outlined">check_circle</span>
                    <h3>Senha atualizada</h3>
                    <p>Você já pode fazer login com a nova senha.</p>
                  </div>

                  <div className="fp-actions fp-actions--center">
                    <button className="btn-primary" type="button" onClick={onClose}>
                      Fechar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}