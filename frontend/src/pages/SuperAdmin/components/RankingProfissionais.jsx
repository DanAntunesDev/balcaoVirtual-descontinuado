export default function RankingProfissionais({ data }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Profissionais com mais atendimentos
      </h2>

      <div className="space-y-3">
        {data.map((p, i) => (
          <div key={i} className="flex justify-between border rounded-lg px-3 py-2">
            <span className="text-sm text-slate-800">{p.nome}</span>
            <span className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
              {p.qtd} atendimentos
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const rankingProfDummy = [
  { nome: "Dr. Augusto Lima", qtd: 82 },
  { nome: "Dra. Helena Castro", qtd: 75 },
  { nome: "Dr. Murilo Andrade", qtd: 69 },
  { nome: "Dra. Marina Torres", qtd: 58 },
];
