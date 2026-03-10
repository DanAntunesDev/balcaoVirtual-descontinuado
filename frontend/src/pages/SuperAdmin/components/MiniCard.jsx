export default function MiniCard({ title, value, icon }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase text-slate-500">
          {title}
        </p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
