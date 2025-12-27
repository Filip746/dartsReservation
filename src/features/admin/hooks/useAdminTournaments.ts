import { useCallback, useEffect, useMemo, useState,SetStateAction, Dispatch } from "react";
import { DRINK_MENU } from "../../../shared/constants/app";
import { generateBracket } from "@/src/shared/utils/tournament";
import type {
  AppSettings,
  SpecialOffer,
  Tournament,
  TournamentPrize,
} from "../../../shared/types/domain";

type ToastFn = (toast: any) => void;

export const useAdminTournaments = (
  initialTournaments: Tournament[],
  onSaveTournaments: (tournaments: Tournament[]) => void,
  localSettings: AppSettings,
  setLocalSettings: Dispatch<SetStateAction<AppSettings>>,
  onSaveSettings: (settings: AppSettings) => void,
  setToast: ToastFn
) => {
  const [localTournaments, setLocalTournaments] = useState<Tournament[]>(initialTournaments);
  const [selectedTourneyId, setSelectedTourneyId] = useState<string | null>(null);

  // Create tournament
  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyStart, setNewTourneyStart] = useState("");
  const [newTourneyDuration, setNewTourneyDuration] = useState(2);
  const [newTourneyFormat, setNewTourneyFormat] = useState<"single" | "double">("single");
  const [newTourneyPrizes, setNewTourneyPrizes] = useState<TournamentPrize[]>([]);

  // Prize builder
  const [tempPrizeRank, setTempPrizeRank] = useState(1);
  const [tempPrizeType, setTempPrizeType] = useState("free_slot");
  const [tempPrizeValue, setTempPrizeValue] = useState<number | string>(1);

  useEffect(() => {
    if (tempPrizeType === "free_drink") setTempPrizeValue(DRINK_MENU[0]);
    else setTempPrizeValue(1);
  }, [tempPrizeType]);

  const selectedTourney = useMemo(
    () => localTournaments.find((t) => t.id === selectedTourneyId) ?? null,
    [localTournaments, selectedTourneyId]
  );

  const addTournamentPrize = useCallback(() => {
    setNewTourneyPrizes((prev) =>
      [...prev, { rank: tempPrizeRank, type: tempPrizeType as any, value: tempPrizeValue }].sort(
        (a, b) => a.rank - b.rank
      )
    );
    setTempPrizeRank((prev) => prev + 1);
  }, [tempPrizeRank, tempPrizeType, tempPrizeValue]);

  const removeTournamentPrize = useCallback((idx: number) => {
    setNewTourneyPrizes((prev) => {
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  }, []);

  const createTournament = useCallback(() => {
    if (!newTourneyName || !newTourneyStart) return;

    const start = new Date(newTourneyStart);
    const end = new Date(start.getTime() + newTourneyDuration * 60 * 60 * 1000);

    const newT: Tournament = {
      id: `tourney-${Date.now()}`,
      name: newTourneyName,
      start: start.toISOString(),
      end: end.toISOString(),
      format: newTourneyFormat,
      status: "open",
      participants: [],
      matches: [],
      prizes: newTourneyPrizes,
      tournament: undefined,
    };

    const updated = [...localTournaments, newT];
    setLocalTournaments(updated);
    onSaveTournaments(updated);

    setNewTourneyName("");
    setNewTourneyStart("");
    setNewTourneyDuration(2);
    setNewTourneyFormat("single");
    setNewTourneyPrizes([]);
    setTempPrizeRank(1);

    setToast({ show: true, msg: "Tournament Created", desc: "Saved successfully.", variant: "success" });
    setTimeout(() => setToast(null), 3000);
  }, [
    newTourneyName,
    newTourneyStart,
    newTourneyDuration,
    newTourneyFormat,
    newTourneyPrizes,
    localTournaments,
    onSaveTournaments,
    setToast,
  ]);

  const deleteTournament = useCallback(
    (id: string) => {
      const updated = localTournaments.filter((t) => t.id !== id);
      setLocalTournaments(updated);
      if (selectedTourneyId === id) setSelectedTourneyId(null);
      onSaveTournaments(updated);
    },
    [localTournaments, selectedTourneyId, onSaveTournaments]
  );

  const startTournament = useCallback(
    (id: string) => {
      const updated = localTournaments.map((tr) =>
        tr.id === id
          ? { ...tr, status: "active" as const, matches: generateBracket(tr.participants) }
          : tr
      );
      setLocalTournaments(updated);
      onSaveTournaments(updated);
    },
    [localTournaments, onSaveTournaments]
  );

  const updateParticipantSeed = useCallback(
    (tourneyId: string, participantId: string, seed: number) => {
      const updated = localTournaments.map((tr) => {
        if (tr.id !== tourneyId) return tr;
        const parts = tr.participants.map((p) => (p.id === participantId ? { ...p, seed } : p));
        return { ...tr, participants: parts };
      });
      setLocalTournaments(updated);
      onSaveTournaments(updated);
    },
    [localTournaments, onSaveTournaments]
  );

  const autoSeedParticipants = useCallback(
    (tourneyId: string) => {
      const updated = localTournaments.map((tr) => {
        if (tr.id !== tourneyId) return tr;
        const parts = tr.participants.map((p, idx) => ({ ...p, seed: idx + 1 }));
        return { ...tr, participants: parts };
      });
      setLocalTournaments(updated);
      onSaveTournaments(updated);
    },
    [localTournaments, onSaveTournaments]
  );

  const advanceMatch = useCallback(
    (tourneyId: string, matchId: string, winnerId: string) => {
      const updated = localTournaments.map((tr) => {
        if (tr.id !== tourneyId) return tr;

        const newMatches = [...tr.matches];
        const matchIndex = newMatches.findIndex((m) => m.id === matchId);
        if (matchIndex === -1) return tr;

        const oldWinner = newMatches[matchIndex].winnerId;
        const match = { ...newMatches[matchIndex], winnerId };
        newMatches[matchIndex] = match;

        if (match.nextMatchId) {
          const nextIndex = newMatches.findIndex((m) => m.id === match.nextMatchId);
          if (nextIndex !== -1) {
            const nextMatch = { ...newMatches[nextIndex] };

            if (oldWinner && oldWinner !== winnerId && nextMatch.winnerId === oldWinner) {
              nextMatch.winnerId = null;
            }

            if (match.matchIndex % 2 === 0) nextMatch.p1Id = winnerId;
            else nextMatch.p2Id = winnerId;

            newMatches[nextIndex] = nextMatch;
          }
        }

        return {
          ...tr,
          matches: newMatches,
          status: (match.nextMatchId ? "active" : "completed") as "active" | "completed",
        };
      });

      setLocalTournaments(updated);
      onSaveTournaments(updated);
    },
    [localTournaments, onSaveTournaments]
  );

  const distributePrizes = useCallback(
    (tourneyId: string) => {
      const tr = localTournaments.find((t) => t.id === tourneyId);
      if (!tr || tr.status !== "completed" || tr.prizesDistributed) return;

      const finalRound = Math.max(...tr.matches.map((m) => m.round));
      const finalMatch = tr.matches.find((m) => m.round === finalRound);

      if (!finalMatch || !finalMatch.winnerId) {
        setToast({ show: true, msg: "Error", desc: "No final winner found.", variant: "error" });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      const winnerId = finalMatch.winnerId;
      const runnerUpId = finalMatch.p1Id === winnerId ? finalMatch.p2Id : finalMatch.p1Id;

      const semiRound = finalRound - 1;
      const semiMatches = tr.matches.filter((m) => m.round === semiRound);
      const semiLosersIds = semiMatches.map((m) => (m.winnerId === m.p1Id ? m.p2Id : m.p1Id)).filter(Boolean);

      const newOffers: SpecialOffer[] = [];

      tr.prizes.forEach((prize) => {
        let targetParticipantIds: string[] = [];
        if (prize.rank === 1) targetParticipantIds = [winnerId];
        else if (prize.rank === 2 && runnerUpId) targetParticipantIds = [runnerUpId];
        else if (prize.rank === 3) targetParticipantIds = semiLosersIds as string[];

        targetParticipantIds.forEach((pId) => {
          const part = tr.participants.find((p) => p.id === pId);
          if (!part) return;

          part.userIds.forEach((uid) => {
            newOffers.push({
              id: `prize-${Date.now()}-${uid}-${prize.rank}`,
              name: `🏆 ${tr.name} - #${prize.rank} Place`,
              type: prize.type as any,
              value: typeof prize.value === "string" ? 0 : prize.value,
              rewardProduct: typeof prize.value === "string" ? (prize.value as string) : undefined,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              targetUserId: uid,
              conditionType: "none",
              used: false,
            });
          });
        });
      });

      if (newOffers.length === 0) {
        setToast({ show: true, msg: "No Prizes", desc: "No prizes configured or matching ranks.", variant: "info" });
        setTimeout(() => setToast(null), 3000);
        return;
      }

      // 1) add offers to settings
      setLocalSettings((prev) => ({
        ...prev,
        specialOffers: [...prev.specialOffers, ...newOffers],
      }));

      // 2) mark tournament prizesDistributed
      const updatedTournaments = localTournaments.map((t) =>
        t.id === tourneyId ? { ...t, prizesDistributed: true } : t
      );
      setLocalTournaments(updatedTournaments);

      // 3) persist
      onSaveSettings({
        ...localSettings,
        specialOffers: [...localSettings.specialOffers, ...newOffers],
      });
      onSaveTournaments(updatedTournaments);

      setToast({ show: true, msg: "Prizes Distributed", desc: `${newOffers.length} rewards sent to winners!`, variant: "success" });
      setTimeout(() => setToast(null), 3000);
    },
    [localTournaments, localSettings, setLocalSettings, onSaveSettings, onSaveTournaments, setToast]
  );

  return {
    localTournaments,
    selectedTourneyId,
    setSelectedTourneyId,
    selectedTourney,

    // create state
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

    // actions
    addTournamentPrize,
    removeTournamentPrize,
    createTournament,
    deleteTournament,
    startTournament,
    updateParticipantSeed,
    autoSeedParticipants,
    advanceMatch,
    distributePrizes,
  };
};
