// src/app/hooks/useVisibleDates.ts
import { useMemo } from "react";

export function useVisibleDates(
  currentWeekStart: Date,
  viewMode: "week" | "day",
  dayOffset: number
) {
  return useMemo(() => {
    if (viewMode === "day") {
      // Day view - prikaži samo jedan dan
      const mapping = [1, 2, 3, 4, 5, 6, 0]; // Mon=1, Tue=2, ..., Sun=0
      const dayIndex = mapping[dayOffset];
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + dayOffset);
      return [{ date: d, dayIndex }];
    }

    // Week view - prikaži 7 dana (Mon-Sun)
    return [1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
      const d = new Date(currentWeekStart);
      const offset = dayIndex === 0 ? 6 : dayIndex - 1; // Sunday je 6. dan
      d.setDate(d.getDate() + offset);
      return { date: d, dayIndex: dayIndex };
    });
  }, [currentWeekStart, viewMode, dayOffset]);
}
