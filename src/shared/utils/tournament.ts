// src/shared/utils/tournament.ts
import type {
  TournamentParticipant,
  TournamentMatch,
} from "../types/domain";

export function generateBracket(
  participants: TournamentParticipant[]
): TournamentMatch[] {
  let players = [...participants];
  const count = players.length;
  let size = 2;
  while (size < count) size *= 2;

  // Sort by seed if available, else random
  if (players.some((p) => p.seed)) {
    players.sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
  } else {
    players.sort(() => 0.5 - Math.random());
  }

  // Standard Seeding Distribution (1 vs N, 2 vs N-1 etc.)
  const getSeedingOrder = (n: number): number[] => {
    if (n === 2) return [1, 2];
    const prev = getSeedingOrder(n / 2);
    const next: number[] = [];
    for (let i = 0; i < prev.length; i++) {
      next.push(prev[i]);
      next.push(n + 1 - prev[i]);
    }
    return next;
  };

  const seedOrder = getSeedingOrder(size);

  // Map players to slots based on seeding order
  const bracketSlots: (TournamentParticipant | null)[] = new Array(size).fill(null);
  seedOrder.forEach((seedVal, slotIndex) => {
    if (seedVal <= players.length) {
      bracketSlots[slotIndex] = players[seedVal - 1]; // Player with that rank
    } else {
      bracketSlots[slotIndex] = null; // Bye
    }
  });

  // Generate matches structure
  const matches: TournamentMatch[] = [];
  const totalRounds = Math.log2(size);
  for (let r = 0; r < totalRounds; r++) {
    const numMatches = size / Math.pow(2, r + 1);
    for (let m = 0; m < numMatches; m++) {
      matches.push({
        id: `match-${r}-${m}`,
        round: r,
        matchIndex: m,
        p1Id: null,
        p2Id: null,
        winnerId: null,
        nextMatchId: r === totalRounds - 1 ? null : `match-${r + 1}-${Math.floor(m / 2)}`,
      });
    }
  }

  // Fill Round 0
  const round0Matches = matches.filter((m) => m.round === 0);
  for (let i = 0; i < size; i += 2) {
    const match = round0Matches[i / 2];
    match.p1Id = bracketSlots[i]?.id ?? null;
    match.p2Id = bracketSlots[i + 1]?.id ?? null;

    // Handle Byes
    if (match.p1Id && !match.p2Id) {
      match.winnerId = match.p1Id;
    } else if (!match.p1Id && match.p2Id) {
      match.winnerId = match.p2Id;
    }
  }

  // Auto-advance byes
  matches.forEach((m) => {
    if (m.winnerId) {
      m.nextMatchId = matches.find((nm) => nm.id === m.nextMatchId)?.id ?? null;
      if (m.nextMatchId) {
        const nextMatch = matches.find((nm) => nm.id === m.nextMatchId);
        if (nextMatch) {
          if (m.matchIndex % 2 === 0) {
            nextMatch.p1Id = m.winnerId;
          } else {
            nextMatch.p2Id = m.winnerId;
          }
        }
      }
    }
  });

  return matches;
}
