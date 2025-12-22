// src/shared/ui/Toast.tsx
import React from "react";

interface ToastProps {
  show: boolean;
  msg: string;
  desc: string;
  variant?: "success" | "error" | "info";
}

export function Toast({ show, msg, desc, variant = "success" }: ToastProps) {
  if (!show) return null;

  return (
    <div
      className={`fixed top-24 right-4 z-[60] text-white p-4 rounded-xl shadow-2xl animate-in slide-in-from-right fade-in duration-300 max-w-sm ${
        variant === "error"
          ? "bg-red-500"
          : variant === "info"
          ? "bg-blue-500"
          : "bg-emerald-500"
      }`}
    >
      <div className="flex items-start gap-3">
        <i
          className={`ph-bold text-2xl mt-1 ${
            variant === "error" ? "ph-warning" : "ph-paper-plane-right"
          }`}
        ></i>
        <div>
          <h4 className="font-bold">{msg}</h4>
          <p className="text-xs opacity-90 mt-1">{desc}</p>
        </div>
      </div>
    </div>
  );
}
