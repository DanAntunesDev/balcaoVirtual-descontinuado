import { useEffect, useState } from "react";
import { createSolicitarRetorno } from "@/services/agendamentoService";
import "./agendamentoModal.css";

export default function SolicitarRetornoModal({ open, onClose, cartorio }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  useEffect(() => {
    if (!open) return;
    setNome("");
    setTelefone("");
    setMensagem("");
    setLoading(false);
    setErrorMsg("");
    setSuccessInfo(null);
  }, [open]);

  if (!open) return null;

  const cartorioNome = cartorio?.nome || "Cartório";
  const cidadeUf = cartorio?.cidade && cartorio?.uf ? `${cartorio.cidade} - ${cartorio.uf}` : null;
  const telCartorio = cartorio?.telefone || null;

  async function handleConfirm() {
    if (!cartorio?.id) {
      setErrorMsg("Cartório inválido.");
      return;
    }
    if (!nome.trim()) {
      setErrorMsg("Informe seu nome.");
      return;
    }
    if (!telefone.trim()) {
      setErrorMsg("Informe seu telefone.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const created = await createSolicitarRetorno({
        cartorioId: cartorio.id,
        nome,
        telefone,
        diaPreferido: null, // depois, se quiser, colocamos seleção de dia igual no print
        mensagem,
      });

      setSuccessInfo({ id: created?.id ?? null });
    } catch (e) {
      setErrorMsg("Não foi possível registrar a solicitação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bv-modal-overlay" role="dialog" aria-modal="true">
      <div className="bv-modal">
        <div className="bv-modal-inner">
          <div className="bv-modal-header">
            <div className="bv-modal-title">
              <h2>Solicitar Retorno</h2>
              <p>{cartorioNome}</p>
            </div>

            <button className="bv-close" onClick={onClose} aria-label="Fechar">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="bv-pill-row">
            <div className="bv-pill">
              <span className="material-symbols-outlined">location_on</span>
              <span>{cidadeUf || "—"}</span>
            </div>

            {telCartorio && (
              <div className="bv-phone">
                <span className="material-symbols-outlined">call</span>
                <span>{telCartorio}</span>
              </div>
            )}
          </div>

          {successInfo ? (
            <div className="bv-notice success" style={{ marginTop: 18 }}>
              <strong>Solicitação registrada!</strong>
              {successInfo.id ? <div>Código: #{successInfo.id}</div> : null}
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Seu nome</div>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.9)",
                      padding: "0 12px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Telefone</div>
                  <input
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="Ex: (31) 9xxxx-xxxx"
                    style={{
                      width: "100%",
                      height: 44,
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.9)",
                      padding: "0 12px",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Mensagem (opcional)</div>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={3}
                    placeholder="Conte rapidamente o que você precisa..."
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.9)",
                      padding: "10px 12px",
                      outline: "none",
                      resize: "none",
                    }}
                  />
                </div>
              </div>

              {errorMsg ? <div className="bv-notice error">{errorMsg}</div> : null}
            </div>
          )}

          <div className="bv-footer">
            <button className="bv-link-btn" onClick={onClose} disabled={loading}>
              Cancelar
            </button>

            {!successInfo && (
              <button className="bv-primary-btn" onClick={handleConfirm} disabled={loading}>
                {loading ? "Enviando..." : "Confirmar Solicitação"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}