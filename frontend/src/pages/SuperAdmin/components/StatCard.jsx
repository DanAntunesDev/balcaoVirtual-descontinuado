export default function StatCard({ title, subtitle, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase">{title}</p>
          <h2 className="text-3xl font-semibold text-slate-900">{value}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="p-2 rounded-full bg-purple-50 text-purple-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
