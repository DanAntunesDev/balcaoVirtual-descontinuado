import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#7c3aed", "#4f46e5", "#6366f1", "#a78bfa"];

export default function CategoryDistribution({ data }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Distribuição por Categoria
      </h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export const categoryDummy = [
  { name: "Reconhecimento de Firma", value: 45 },
  { name: "Procurações", value: 22 },
  { name: "Atas Notariais", value: 13 },
  { name: "Certidões", value: 20 },
];
