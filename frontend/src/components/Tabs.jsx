import React, { useState } from "react";

export default function Tabs() {
  const [active, setActive] = useState("Cidade");
  const tabs = ["Cidade", "Cartório", "Status"];

  return (
    <div className="flex gap-3 bg-white/20 p-2 rounded-full shadow-inner backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
            active === tab
              ? "bg-white text-purple-700 shadow-md"
              : "text-white hover:bg-white/10"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
