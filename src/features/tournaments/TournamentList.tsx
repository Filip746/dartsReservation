import { TRANSLATIONS } from "@/src/shared/constants/app";
import { Language, Tournament } from "@/src/shared/types/domain";

export const TournamentList = ({
  tournaments,
  onSelect,
  lang,
}: {
  tournaments: Tournament[];
  onSelect: (t: Tournament) => void;
  lang: Language;
}) => {
  const t = TRANSLATIONS[lang];
  const now = new Date();
  const upcoming = tournaments
    .filter((tr) => new Date(tr.end) > now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const past = tournaments
    .filter((tr) => new Date(tr.end) <= now)
    .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

  const renderCard = (tr: Tournament) => (
    <div
      key={tr.id}
      onClick={() => onSelect(tr)}
      className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-xl cursor-pointer transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">
          {tr.name}
        </h4>
        <span
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full 
                    ${
                      tr.status === "open"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : tr.status === "active"
                        ? "bg-amber-500/20 text-amber-400 animate-pulse"
                        : "bg-slate-600/20 text-slate-400"
                    }`}
        >
          {
            t[
              tr.status === "open"
                ? "registrationOpen"
                : tr.status === "active"
                ? "inProgress"
                : "completed"
            ]
          }
        </span>
      </div>
      <div className="flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <i className="ph-bold ph-calendar"></i>{" "}
          {new Date(tr.start).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <i className="ph-bold ph-clock"></i>{" "}
          {new Date(tr.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="flex items-center gap-1">
          <i className="ph-bold ph-users"></i> {tr.participants.length}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs uppercase font-bold text-emerald-400 mb-2">
          {t.upcoming}
        </h3>
        <div className="space-y-2">
          {upcoming.length ? (
            upcoming.map(renderCard)
          ) : (
            <p className="text-slate-600 italic text-sm">
              No upcoming tournaments.
            </p>
          )}
        </div>
      </div>
      <div>
        <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">
          {t.past}
        </h3>
        <div className="space-y-2">
          {past.length ? (
            past.map(renderCard)
          ) : (
            <p className="text-slate-600 italic text-sm">
              No past tournaments.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
