import { useEffect } from "react";

/*
  Este componente representa UMA notificação.
  Eu replico fielmente a estrutura do HTML fornecido,
  apenas transformando em JSX e controlando a montagem.
*/

export default function Toast({
  type = "info",
  message,
  onClose,
}) {
  /*
    Assim que o Toast é montado, eu disparo um timeout
    para removê-lo após o término da animação CSS.
    Não invento duração: uso o tempo implícito do CSS.
  */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`notification notification--${type}`}
      role={type === "success" || type === "info" ? "status" : "alert"}
      aria-live={type === "success" || type === "info" ? "polite" : "assertive"}
    >
      <div className="notification__body">
        {/* 
          Ícones não são gerados aqui ainda.
          Estou respeitando sua decisão visual original.
          A integração com SVG ou assets vem depois, se você quiser.
        */}
        <span className="notification__icon" aria-hidden="true" />
        {message}
      </div>

      <div className="notification__progress" />
    </div>
  );
}
