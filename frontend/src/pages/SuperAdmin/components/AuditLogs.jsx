export default function AuditLogs({ logs }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Auditoria</h2>

      <div className="space-y-3">
        {logs.map((log, i) => (
          <div key={i} className="rounded-lg border px-3 py-2">
            <p className="text-sm text-slate-900">{log.msg}</p>
            <p className="text-xs text-slate-500">{log.data}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const auditDummy = [
  { msg: "SuperAdmin aprovou novo usuário.", data: "12/03/2025 14:22" },
  { msg: "Cartório Central atualizou horário de funcionamento.", data: "11/03/2025 09:15" },
  { msg: "Cliente enviou documentos no agendamento #442.", data: "10/03/2025 16:40" },
];
