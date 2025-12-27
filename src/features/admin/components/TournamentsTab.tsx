import React from "react";
import { Button } from "../../../shared/ui/Button";
import type { Tournament, TournamentPrize } from "../../../shared/types/domain";
import { TournamentBracket } from "../../tournaments/TournamentBracket";
import { DRINK_MENU } from "../../../shared/constants/app";

type Props = {
  t: any;
  lang: any;

  // tournaments state
  localTournaments: Tournament[];
  selectedTourneyId: string | null;
  setSelectedTourneyId: (v: string | null) => void;
  selectedTourney: Tournament | null;

  // create state
  newTourneyName: string;
  setNewTourneyName: (v: string) => void;
  newTourneyStart: string;
  setNewTourneyStart: (v: string) => void;
  newTourneyDuration: number;
  setNewTourneyDuration: (v: number) => void;
  newTourneyFormat: "single" | "double";
  setNewTourneyFormat: (v: "single" | "double") => void;
  newTourneyPrizes: TournamentPrize[];

  tempPrizeRank: number;
  setTempPrizeRank: (v: number | ((p: number) => number)) => void;
  tempPrizeType: string;
  setTempPrizeType: (v: string) => void;
  tempPrizeValue: number | string;
  setTempPrizeValue: (v: number | string) => void;

  // actions
  addTournamentPrize: () => void;
  removeTournamentPrize: (idx: number) => void;
  createTournament: () => void;
  deleteTournament: (id: string) => void;
  startTournament: (id: string) => void;
  updateParticipantSeed: (
    tourneyId: string,
    participantId: string,
    seed: number
  ) => void;
  autoSeedParticipants: (tourneyId: string) => void;
  advanceMatch: (tourneyId: string, matchId: string, winnerId: string) => void;
  distributePrizes: (tourneyId: string) => void;
};

export const TournamentsTab: React.FC<Props> = ({
  t,
  lang,

  localTournaments,
  selectedTourneyId,
  setSelectedTourneyId,
  selectedTourney,

  newTourneyName,
  setNewTourneyName,
  newTourneyStart,
  setNewTourneyStart,
  newTourneyDuration,
  setNewTourneyDuration,
  newTourneyFormat,
  setNewTourneyFormat,
  newTourneyPrizes,

  tempPrizeRank,
  setTempPrizeRank,
  tempPrizeType,
  setTempPrizeType,
  tempPrizeValue,
  setTempPrizeValue,

  addTournamentPrize,
  removeTournamentPrize,
  createTournament,
  deleteTournament,
  startTournament,
  updateParticipantSeed,
  autoSeedParticipants,
  advanceMatch,
  distributePrizes,
}) => {
  return (
    <div className="space-y-6">
      {/* Create tournament */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
          <i className="ph-fill ph-trophy"></i> {t.createTournament}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder={t.tournamentName}
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={newTourneyName}
            onChange={(e) => setNewTourneyName(e.target.value)}
          />

          <select
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={newTourneyFormat}
            onChange={(e) => setNewTourneyFormat(e.target.value as any)}
          >
            <option value="single">{t.single}</option>
            <option value="double">{t.double}</option>
          </select>

          <input
            type="datetime-local"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
            value={newTourneyStart}
            onChange={(e) => setNewTourneyStart(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={24}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-24"
              value={newTourneyDuration}
              onChange={(e) => setNewTourneyDuration(parseInt(e.target.value))}
            />
            <span className="text-slate-400 text-sm">{t.durationHours}</span>
          </div>
        </div>

        {/* prizes builder */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">
            {t.prizes}
          </h4>

          <div className="space-y-2 mb-3">
            {newTourneyPrizes.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-950/50 p-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between border border-slate-800 gap-2"
              >
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="font-bold text-yellow-500">#{p.rank}</span>
                  <span>
                    {p.type === "free_slot"
                      ? "Free Slot"
                      : p.type === "discount_percent"
                      ? "Discount"
                      : "Free Drink"}
                  </span>
                  <span className="bg-slate-800 px-2 rounded text-xs">
                    {String(p.value)}
                  </span>
                </div>

                <button
                  onClick={() => removeTournamentPrize(idx)}
                  className="text-red-500 hover:text-red-400 self-end sm:self-auto"
                >
                  <i className="ph-bold ph-x"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950/30 p-3 rounded-lg border border-slate-800 items-end">
            <div className="col-span-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold">
                {t.rank}
              </label>
              <input
                type="number"
                min={1}
                className="bg-slate-800 border border-slate-700 rounded w-full px-2 py-1 text-white text-xs"
                value={tempPrizeRank}
                onChange={(e) => setTempPrizeRank(parseInt(e.target.value))}
              />
            </div>

            <div className="col-span-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold">
                {t.offerType}
              </label>
              <select
                className="bg-slate-800 border border-slate-700 rounded w-full px-2 py-1 text-white text-xs"
                value={tempPrizeType}
                onChange={(e) => setTempPrizeType(e.target.value)}
              >
                <option value="free_slot">Free Slot</option>
                <option value="discount_percent">Discount</option>
                <option value="free_drink">Free Drink</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="text-[9px] text-slate-500 uppercase font-bold">
                {t.offerValue}
              </label>
              {tempPrizeType === "free_drink" ? (
                <select
                  className="bg-slate-800 border border-slate-700 rounded w-full px-2 py-1 text-white text-xs"
                  value={String(tempPrizeValue)}
                  onChange={(e) => setTempPrizeValue(e.target.value)}
                >
                  {DRINK_MENU.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  className="bg-slate-800 border border-slate-700 rounded w-full px-2 py-1 text-white text-xs"
                  value={Number(tempPrizeValue)}
                  onChange={(e) => setTempPrizeValue(parseInt(e.target.value))}
                />
              )}
            </div>

            <Button
              onClick={addTournamentPrize}
              variant="secondary"
              className="text-xs py-1 h-[26px] col-span-1"
            >
              {t.addPrize}
            </Button>
          </div>

          <Button onClick={createTournament} className="mt-6 w-full md:w-auto">
            {t.saveTournament}
          </Button>
        </div>
      </section>

      {/* tournaments list */}
      <section className="space-y-4">
        {localTournaments.map((tr) => (
          <div
            key={tr.id}
            className={`bg-slate-950/50 border rounded-xl p-4 cursor-pointer ${
              selectedTourneyId === tr.id
                ? "border-amber-500"
                : "border-slate-800"
            }`}
            onClick={() => setSelectedTourneyId(tr.id)}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-white">{tr.name}</h4>
              <div className="flex gap-2">
                <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  {String(tr.status).toUpperCase()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTournament(tr.id);
                  }}
                  className="text-red-500 hover:text-white"
                >
                  <i className="ph-bold ph-trash"></i>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <p className="text-xs text-slate-500">
                {new Date(tr.start).toLocaleString()} • {tr.format}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* selected tournament management */}
      {selectedTourney && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 border-b border-slate-800 pb-2">
            {selectedTourney.name} - Management
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* participants */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">
                  {t.participants} ({selectedTourney.participants.length})
                </h4>

                {selectedTourney.status === "open" && (
                  <Button
                    variant="ghost"
                    className="text-[10px] h-6 px-2 py-0 text-blue-400 hover:text-white"
                    onClick={() => autoSeedParticipants(selectedTourney.id)}
                  >
                    {t.autoSeed}
                  </Button>
                )}
              </div>

              <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {selectedTourney.participants.map((p) => (
                  <li
                    key={p.id}
                    className="text-sm text-slate-300 bg-slate-800 px-3 py-2 rounded flex justify-between items-center border border-slate-700"
                  >
                    <span>{p.name}</span>

                    {selectedTourney.status === "open" && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase">
                          {t.seed}
                        </span>
                        <input
                          type="number"
                          className="w-12 bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-center text-xs text-white"
                          value={p.seed}
                          onChange={(e) =>
                            updateParticipantSeed(
                              selectedTourney.id,
                              p.id,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              {selectedTourney.status === "open" && (
                <Button
                  onClick={() => startTournament(selectedTourney.id)}
                  className="w-full"
                >
                  {t.startTournament}
                </Button>
              )}

              {selectedTourney.status === "completed" &&
                !selectedTourney.prizesDistributed && (
                  <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/50 rounded-xl">
                    <h4 className="text-emerald-400 font-bold mb-2">
                      Tournament Completed!
                    </h4>
                    <p className="text-slate-400 text-xs mb-3">
                      Distribute prizes to winners based on bracket results.
                    </p>
                    <Button
                      onClick={() => distributePrizes(selectedTourney.id)}
                      className="w-full"
                    >
                      {t.distributePrizes}
                    </Button>
                  </div>
                )}
            </div>

            {/* bracket */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                {t.bracket}
              </h4>
              {selectedTourney.status !== "open" ? (
                <TournamentBracket
                  tournament={selectedTourney}
                  onAdvance={(mid, wid) =>
                    advanceMatch(selectedTourney.id, mid, wid)
                  }
                  isAdmin={true}
                  lang={lang}
                />
              ) : (
                <p className="text-slate-600 text-sm italic">
                  Bracket not generated yet.
                </p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
