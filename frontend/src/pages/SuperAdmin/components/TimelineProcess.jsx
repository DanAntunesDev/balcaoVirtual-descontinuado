export default function TimelineProcess({ steps }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Fluxo Geral</h2>

      <div className="relative border-l-2 border-purple-300 ml-4 space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="ml-4">
            <div className="absolute -left-[11px] h-5 w-5 rounded-full bg-purple-500"></div>
            <h3 className="font-medium text-slate-900">{step.title}</h3>
            <p className="text-sm text-slate-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export const timelineDummy = [
  { title: "Agendamento criado", desc: "Cliente solicita atendimento" },
  { title: "Documentos anexados", desc: "Arquivos enviados e conferidos" },
  { title: "Atendimento presencial", desc: "Cliente comparece no cartório" },
  { title: "Finalização", desc: "Serviço concluído" },
];
