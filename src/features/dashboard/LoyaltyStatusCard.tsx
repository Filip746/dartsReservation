// src/features/dashboard/LoyaltyStatusCard.tsx
import React from "react";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Language, LoyaltyTier } from "../../shared/types/domain";

interface LoyaltyStatusCardProps {
  nextBadge: LoyaltyTier | null;
  earnedBadges: LoyaltyTier[];
  userTotalBookings: number;
  lang: Language;
}

export function LoyaltyStatusCard({
  nextBadge,
  earnedBadges,
  userTotalBookings,
  lang,
}: LoyaltyStatusCardProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="p-6 rounded-2xl border bg-slate-900 border-slate-800 relative overflow-hidden flex items-center justify-between">
      <div className="relative z-10">
        <h2 className="text-white font-bold text-lg mb-1">{t.loyaltyStatus}</h2>
        {nextBadge ? (
          <p className="text-slate-400 text-sm">
            <span className="text-white font-bold">
              {nextBadge.bookingsRequired - userTotalBookings}
            </span>{" "}
            {t.bookingsUntil}{" "}
            <span className={`ml-1 font-bold ${nextBadge.color}`}>
              {t.tiers[nextBadge.name as keyof typeof t.tiers] ||
                nextBadge.name}
            </span>{" "}
            {t.status}.
          </p>
        ) : (
          <p className="text-amber-400 text-sm font-bold">{t.tiers.legend!}</p>
        )}
      </div>
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
        {earnedBadges.length > 0 ? (
          <i
            className={`ph-fill ${earnedBadges[0].icon} text-3xl ${earnedBadges[0].color}`}
          ></i>
        ) : (
          <i className="ph-fill ph-star text-3xl text-slate-600"></i>
        )}
      </div>
    </div>
  );
}
