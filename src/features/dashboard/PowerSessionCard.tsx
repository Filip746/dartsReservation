// src/features/dashboard/PowerSessionCard.tsx
import React from "react";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Language, DiscountTier } from "../../shared/types/domain";

interface PowerSessionCardProps {
  hasConsecutiveDiscount: DiscountTier | null;
  consecutiveDiscountTiers: DiscountTier[];
  lang: Language;
}

export function PowerSessionCard({
  hasConsecutiveDiscount,
  consecutiveDiscountTiers,
  lang,
}: PowerSessionCardProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div
      className={`p-6 rounded-2xl border relative overflow-hidden flex flex-col justify-center min-h-[120px] transition-colors ${
        hasConsecutiveDiscount
          ? "bg-amber-500 border-amber-400 shadow-lg shadow-amber-500/20"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      {hasConsecutiveDiscount ? (
        <>
          <div className="absolute top-0 right-0 p-4 opacity-20 text-black mix-blend-overlay">
            <i className="ph-fill ph-lightning text-8xl"></i>
          </div>
          <h2 className="text-slate-900 font-black text-xl flex items-center gap-2 mb-1 uppercase tracking-tight">
            <i className="ph-fill ph-lightning-a"></i> {t.powerSessionActive}
          </h2>
          <p className="text-slate-900 font-bold text-sm opacity-80">
            -{hasConsecutiveDiscount.discount}% OFF on all slots for today!
          </p>
        </>
      ) : (
        <>
          <h2 className="text-slate-400 font-bold text-lg flex items-center gap-2 mb-1">
            <i className="ph ph-lightning-slash"></i> {t.powerSession}
          </h2>
          <p className="text-slate-500 text-sm">
            {consecutiveDiscountTiers
              .map((tier) => `${tier.threshold} slots = ${tier.discount}%`)
              .join(" • ")}
          </p>
        </>
      )}
    </div>
  );
}
