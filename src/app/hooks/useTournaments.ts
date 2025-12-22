// src/app/hooks/useTournaments.ts
import { useState, useEffect, useMemo } from "react";
import type { Tournament, User } from "../../shared/types/domain";

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const storedTournaments = localStorage.getItem("darts_tournaments");
    if (storedTournaments) setTournaments(JSON.parse(storedTournaments));
  }, []);

  const saveTournaments = (newTournaments: Tournament[]) => {
    setTournaments(newTournaments);
    localStorage.setItem("darts_tournaments", JSON.stringify(newTournaments));
  };

  const activeTournaments = useMemo(() => {
    const now = new Date();
    return tournaments
      .filter((tr) => new Date(tr.end) > now)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [tournaments]);

  const registerForTournament = (
    tournamentId: string,
    user: User | null,
    teamName: string
  ): boolean => {
    if (!user) return false;

    const updated = tournaments.map((tr) => {
      if (tr.id === tournamentId) {
        const name = teamName || user.name;
        const existingPartIndex = tr.participants.findIndex((p) => p.userIds.includes(user.id));
        if (existingPartIndex !== -1) {
          const newParts = [...tr.participants];
          newParts.splice(existingPartIndex, 1);
          return { ...tr, participants: newParts };
        } else {
          return {
            ...tr,
            participants: [
              ...tr.participants,
              { id: `part-${Date.now()}`, name: name, userIds: [user.id] },
            ],
          };
        }
      }
      return tr;
    });
    saveTournaments(updated);
    return true;
  };

  return {
    tournaments,
    saveTournaments,
    activeTournaments,
    registerForTournament,
  };
}
