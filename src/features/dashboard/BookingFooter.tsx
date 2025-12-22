// src/features/dashboard/BookingFooter.tsx
import React from "react";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Language, AppSettings } from "../../shared/types/domain";

interface BookingFooterProps {
  selectedSlots: Array<{ dayIndex: number; hour: number }>;
  totalPrice: number;
  basePrice: number;
  selectedOfferId: string;
  settings: AppSettings;
  lang: Language;
  onSelectCoupon: () => void;
  onClearSlots: () => void;
  onReserve: () => void;
}

export function BookingFooter({
  selectedSlots,
  totalPrice,
  basePrice,
  selectedOfferId,
  settings,
  lang,
  onSelectCoupon,
  onClearSlots,
  onReserve,
}: BookingFooterProps) {
  const t = TRANSLATIONS[lang];

  if (selectedSlots.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between z-40 animate-in slide-in-from-bottom-5 gap-4 sm:gap-0">
      <div className="flex-1 w-full sm:w-auto">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
          {selectedSlots.length} slots selected
        </span>
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold text-white">€{totalPrice}</div>
          {totalPrice < basePrice * selectedSlots.length && (
            <span className="text-xs bg-emerald-500 text-slate-900 px-2 rounded-full line-through opacity-70">
              €{Math.round(basePrice * selectedSlots.length * 100) / 100}
            </span>
          )}
          {selectedOfferId && (
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30">
              <i className="ph-fill ph-tag"></i> Coupon Applied
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          variant="secondary"
          className="flex-1 sm:flex-none justify-center whitespace-nowrap text-xs"
          onClick={onSelectCoupon}
        >
          <i className="ph-bold ph-ticket"></i> {t.applyCoupon}
        </Button>
        <Button variant="ghost" onClick={onClearSlots} className="px-3">
          {t.clear}
        </Button>
        <Button
          onClick={onReserve}
          className="flex-1 sm:flex-none justify-center"
        >
          {t.reserveNow}
        </Button>
      </div>
    </div>
  );
}
