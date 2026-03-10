import { X } from "lucide-react";

export default function FilterTag({ label, onRemove }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs text-purple-700">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="text-purple-500 hover:text-purple-700"
      >
        <X size={12} />
      </button>
    </div>
  );
}