// src/app/hooks/useComputedValues.ts
import { useMemo } from "react";
import { formatDateISO } from "../../shared/utils/date";
import type { User, Appointment, AppSettings, SpecialOffer } from "../../shared/types/domain";

export function useComputedValues(
  user: User | null,
  appointments: Appointment[],
  settings: AppSettings,
  currentWeekStart: Date,
  selectedSlots: { dayIndex: number; hour: number }[]
) {
  const userTotalBookings = useMemo(
    () => (user ? appointments.filter((a) => a.userId === user.id).length : 0),
    [user, appointments]
  );

  const earnedBadges = useMemo(() => {
    if (!settings.loyaltyProgram.enabled) return [];
    return settings.loyaltyProgram.tiers
      .filter((t) => t.enabled && userTotalBookings >= t.bookingsRequired)
      .sort((a, b) => b.bookingsRequired - a.bookingsRequired);
  }, [userTotalBookings, settings]);

  const myOffers = useMemo(() => {
    if (!user) return [];
    const now = new Date();
    return settings.specialOffers.filter((o) => {
      const start = new Date(o.startDate);
      const end = new Date(o.endDate);
      const isTargeted = o.targetUserId === user.id;
      const isGlobal = !o.targetUserId && !o.isTemplate;
      return now >= start && now <= end && (isTargeted || isGlobal) && !o.used;
    });
  }, [user, settings.specialOffers]);

  const hasConsecutiveDiscount = useMemo(() => {
    if (!user) return null;
    const currentWeekStr = formatDateISO(currentWeekStart);
    const userAppsThisWeek = appointments.filter(
      (a) =>
        a.userId === user.id &&
        (a.weekStart.startsWith(currentWeekStr) ||
          new Date(a.weekStart).toDateString() === currentWeekStart.toDateString())
    );
    let maxSlotsInADay = 0;
    for (let d = 0; d < 7; d++) {
      const count = userAppsThisWeek.filter((a) => a.dayIndex === d).length;
      const selectedCountForDay = selectedSlots.filter((s) => s.dayIndex === d).length;
      maxSlotsInADay = Math.max(maxSlotsInADay, count + selectedCountForDay);
    }
    return settings.consecutiveDiscountTiers
      .sort((a, b) => b.threshold - a.threshold)
      .find((t) => maxSlotsInADay >= t.threshold);
  }, [user, appointments, currentWeekStart, settings, selectedSlots]);

  const nextBadge = useMemo(() => {
    if (!settings.loyaltyProgram.enabled) return null;
    return settings.loyaltyProgram.tiers.find(
      (t) => t.enabled && userTotalBookings < t.bookingsRequired
    );
  }, [userTotalBookings, settings]);

  return {
    userTotalBookings,
    earnedBadges,
    myOffers,
    hasConsecutiveDiscount,
    nextBadge,
  };
}
