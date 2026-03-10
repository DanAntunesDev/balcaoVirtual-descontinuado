import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";
import { formatDateBR } from "../hooks/useDashboardFilters";

function formatLabel(value) {
  if (!value) return "";
  if (typeof value === "string" && value.includes("-")) {
    return formatDateBR(value);
  }
  return value;
}

export default function ChartBox({ data, loading }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Agendamentos por dia (últimos 14 dias)
      </h2>

      {loading ? (
        <div className="flex h-72 items-center justify-center text-slate-400 text-sm">
          Carregando dados...
        </div>
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="dia" stroke="#6b7280" tickFormatter={formatLabel} />
              <Tooltip
                labelFormatter={formatLabel}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  padding: 10,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="quantidade"
                stroke="#7c3aed"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#7c3aed" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
