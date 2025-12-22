// src/features/dashboard/ActiveTournamentCard.tsx
import React from "react";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Tournament, Language } from "../../shared/types/domain";

interface ActiveTournamentCardProps {
  tournament: Tournament;
  lang: Language;
  onViewTournament: () => void;
}

export function ActiveTournamentCard({
  tournament,
  lang,
  onViewTournament,
}: ActiveTournamentCardProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="mb-8">
      <div
        onClick={onViewTournament}
        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 p-6 rounded-2xl cursor-pointer relative overflow-hidden group hover:border-purple-500/50 transition-all"
      >
        <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
          <i className="ph-fill ph-trophy text-8xl text-purple-400"></i>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase animate-pulse">
              {t.activeTournament}
            </span>
            <span className="text-purple-300 text-xs font-bold">
              {new Date(tournament.start).toLocaleDateString()}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mb-1">
            {tournament.name}
          </h2>
          <p className="text-slate-400 text-sm mb-2 max-w-md">
            Format: {tournament.format.toUpperCase()} •{" "}
            {tournament.participants.length} Participants
          </p>
          {tournament.prizes && tournament.prizes.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {tournament.prizes.slice(0, 3).map((p, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-purple-950/60 border border-purple-500/30 text-purple-200 px-2 py-1 rounded-lg backdrop-blur-sm"
                >
                  <b className="text-yellow-400">#{p.rank}</b>{" "}
                  {p.type === "free_drink"
                    ? p.value
                    : p.type === "discount_percent"
                    ? `${p.value}%`
                    : `${p.value} Slots`}
                </span>
              ))}
            </div>
          )}
          <Button
            variant="secondary"
            className="text-xs mt-4"
            onClick={onViewTournament}
          >
            {t.viewTournament}
          </Button>
        </div>
      </div>
    </div>
  );
}
