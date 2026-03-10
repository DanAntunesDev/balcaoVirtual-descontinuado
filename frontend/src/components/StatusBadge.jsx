/*
  Eu sou o componente StatusBadge.
  Minha responsabilidade é exibir visualmente o status
  de qualquer entidade do sistema baseada em ENUM.
*/

export default function StatusBadge({ status }) {
  /*
    Aqui eu normalizo o status recebido.
    O backend sempre envia ENUM em string,
    mas eu garanto que não quebre caso venha undefined.
  */
  const normalizedStatus = status || "INDEFINIDO";

  /*
    Mapeamento de status para classes visuais.
    Eu NÃO crio cores novas aqui.
    Uso apenas classes que já existem no Design System.
  */
  const statusClasses = {
    ATIVO: "bg-green-100 text-green-800",
    INATIVO: "bg-gray-100 text-gray-600",
    SUSPENSO: "bg-yellow-100 text-yellow-800",
    ARQUIVADO: "bg-red-100 text-red-800",
    INDEFINIDO: "bg-gray-100 text-gray-500",
  };

  /*
    Caso o backend envie um status novo no futuro,
    eu caio em um fallback visual neutro,
    evitando quebra de layout.
  */
  const badgeClass =
    statusClasses[normalizedStatus] ||
    "bg-gray-100 text-gray-600";

  return (
    <span
      className={`
        inline-flex items-center
        px-2 py-1 rounded-full
        text-xs font-medium
        ${badgeClass}
      `}
    >
      {normalizedStatus}
    </span>
  );
}
