import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center text-white/70 mt-12">
      <Loader2 className="animate-spin w-8 h-8 text-purple-300 mb-3" />
      <p>Carregando resultados...</p>
    </div>
  );
}
