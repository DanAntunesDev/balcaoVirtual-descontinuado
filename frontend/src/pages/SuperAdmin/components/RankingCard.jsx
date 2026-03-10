export default function RankingCard({ topCartorios }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Cartórios com mais agendamentos
      </h2>

      <div className="space-y-2">
        {topCartorios?.length > 0 ? (
          topCartorios.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <span className="text-sm font-medium text-slate-800">
                {item.nome}
              </span>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
                {item.quantidade} atendimentos
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">
            Nenhum resultado para os filtros atuais.
          </p>
        )}
      </div>
    </div>
  );
}
