// src/shared/ui/Toggle.tsx
import React from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-2 gap-4">
      <span className="text-slate-300 font-medium text-sm sm:text-base flex-1">
        {label}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 shrink-0 ${
          enabled ? "bg-amber-500" : "bg-slate-700"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ${
            enabled ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
