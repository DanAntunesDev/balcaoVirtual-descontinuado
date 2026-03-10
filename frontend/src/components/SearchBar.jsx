import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="flex items-center bg-white shadow-sm rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 transition">
        <Search className="text-purple-600 w-5 h-5 mr-3" />
        <input
          type="text"
          placeholder="Buscar cartório, associação ou cidade..."
          className="w-full text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>
    </div>
  );
}
