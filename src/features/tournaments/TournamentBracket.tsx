import React from "react";
import { TRANSLATIONS } from "../../shared/constants/app";
import type {
  Tournament,
  TournamentMatch,
  Language,
} from "../../shared/types/domain";

interface TournamentBracketProps {
  tournament: Tournament;
  onAdvance: (matchId: string, winnerId: string) => void;
  isAdmin: boolean;
  lang: Language;
}

export function TournamentBracket({
  tournament,
  onAdvance,
  isAdmin,
  lang,
}: TournamentBracketProps) {
  const t = TRANSLATIONS[lang];

  // ← EKSPLICITNO TIPIZIRAJ RETURN TYPE:
  const rounds: Record<number, TournamentMatch[]> = (() => {
    const r: Record<number, TournamentMatch[]> = {};
    tournament.matches.forEach((m) => {
      if (!r[m.round]) r[m.round] = [];
      r[m.round].push(m);
    });
    return r;
  })();

  const roundIndices = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  const getParticipantName = (id: string | null) => {
    if (!id) return "TBD";
    return tournament.participants.find((p) => p.id === id)?.name || "Unknown";
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max px-4">
        {roundIndices.map((roundIdx) => (
          <div
            key={roundIdx}
            className="flex flex-col justify-around gap-4 min-w-[200px]"
          >
            <h4 className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Round {roundIdx + 1}
            </h4>
            {rounds[roundIdx]
              ?.sort((a, b) => a.matchIndex - b.matchIndex)
              .map((match) => (
                <div
                  key={match.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 flex flex-col gap-2 relative"
                >
                  <div
                    className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                      match.winnerId === match.p1Id
                        ? "bg-amber-500/20 text-amber-400 font-bold"
                        : "bg-slate-900 text-slate-300"
                    } ${
                      isAdmin && match.p1Id && match.p2Id
                        ? "hover:bg-slate-800"
                        : ""
                    }`}
                    onClick={() =>
                      isAdmin &&
                      match.p1Id &&
                      match.p2Id &&
                      onAdvance(match.id, match.p1Id)
                    }
                  >
                    <span className="truncate text-xs">
                      {getParticipantName(match.p1Id)}
                    </span>
                    {match.winnerId === match.p1Id && (
                      <i className="ph-fill ph-check-circle"></i>
                    )}
                  </div>
                  <div className="h-px bg-slate-700 w-full"></div>
                  <div
                    className={`flex justify-between items-center p-2 rounded cursor-pointer transition-colors ${
                      match.winnerId === match.p2Id
                        ? "bg-amber-500/20 text-amber-400 font-bold"
                        : "bg-slate-900 text-slate-300"
                    } ${
                      isAdmin && match.p1Id && match.p2Id
                        ? "hover:bg-slate-800"
                        : ""
                    }`}
                    onClick={() =>
                      isAdmin &&
                      match.p1Id &&
                      match.p2Id &&
                      onAdvance(match.id, match.p2Id)
                    }
                  >
                    <span className="truncate text-xs">
                      {getParticipantName(match.p2Id)}
                    </span>
                    {match.winnerId === match.p2Id && (
                      <i className="ph-fill ph-check-circle"></i>
                    )}
                  </div>
                  {isAdmin && !match.winnerId && match.p1Id && match.p2Id && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-[10px] px-1 rounded text-white shadow">
                      Pick Winner
                    </div>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function useMemo(
  arg0: () => { [key: number]: TournamentMatch[] },
  arg1: Tournament[]
) {
  throw new Error("Function not implemented.");
}
