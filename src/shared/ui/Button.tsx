// src/shared/ui/Button.tsx
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "google" | "admin";
  className?: string;
  disabled?: boolean;
  title?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
}: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 border";

  const variants: Record<string, string> = {
    primary:
      "bg-amber-500 hover:bg-amber-400 border-amber-600 text-slate-900 shadow-lg shadow-amber-500/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-600",
    secondary:
      "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200",
    danger: "bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-400",
    ghost:
      "bg-transparent hover:bg-slate-800 border-transparent text-slate-400 hover:text-white",
    google: "bg-white text-slate-900 hover:bg-slate-100 border-white",
    admin:
      "bg-slate-900 text-purple-400 border-purple-900 hover:border-purple-500 shadow-lg shadow-purple-900/20",
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
