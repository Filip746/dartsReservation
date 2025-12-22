// src/shared/ui/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`bg-slate-900 border border-slate-700 rounded-2xl w-full ${maxWidth} p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white z-50 bg-slate-900/50 rounded-full p-1"
        >
          <i className="ph ph-x text-xl" />
        </button>
        <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-wider border-b border-slate-800 pb-2 pr-8">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
