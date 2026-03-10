import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function MonthlyComparison({ data }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Comparativo Mensal
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="mes" stroke="#6b7280" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#7c3aed" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const monthlyDummy = [
  { mes: "Janeiro", quantidade: 320 },
  { mes: "Fevereiro", quantidade: 280 },
  { mes: "Março", quantidade: 420 },
  { mes: "Abril", quantidade: 390 },
];
