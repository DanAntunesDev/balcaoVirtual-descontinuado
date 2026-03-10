import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Tooltip, Scatter } from "recharts";

export default function HeatmapDias({ data }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Intensidade de Agendamentos por Dia da Semana
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <XAxis dataKey="dia" name="Dia" />
            <YAxis dataKey="hora" name="Hora" />
            <ZAxis dataKey="qtd" range={[30, 200]} name="Agendamentos" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="#7c3aed" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const heatmapDummy = [
  { dia: "Seg", hora: 8, qtd: 4 },
  { dia: "Seg", hora: 10, qtd: 12 },
  { dia: "Seg", hora: 14, qtd: 7 },
  { dia: "Ter", hora: 9, qtd: 9 },
  { dia: "Qua", hora: 11, qtd: 16 },
  { dia: "Qui", hora: 15, qtd: 20 },
  { dia: "Sex", hora: 10, qtd: 5 },
];
