// src/features/dashboard/MachineSelector.tsx
import React from "react";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Machine, Language } from "../../shared/types/domain";

interface MachineSelectorProps {
  machines: Machine[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  lang: Language;
}

export function MachineSelector({
  machines,
  selectedMachineId,
  onSelectMachine,
  lang,
}: MachineSelectorProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <i className="ph-bold ph-target"></i> {t.selectMachine}
      </h3>
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {machines.map((machine) => (
          <button
            key={machine.id}
            onClick={() => {
              onSelectMachine(machine.id);
            }}
            className={`px-6 py-3 rounded-xl border flex items-center gap-3 transition-all whitespace-nowrap ${
              selectedMachineId === machine.id
                ? "bg-amber-500 border-amber-500 text-slate-900 shadow-lg shadow-amber-500/20"
                : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white"
            }`}
          >
            <i
              className={`ph-fill ${
                selectedMachineId === machine.id
                  ? "ph-check-circle"
                  : "ph-circle"
              } text-xl`}
            ></i>
            <span className="font-bold text-sm">{machine.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
