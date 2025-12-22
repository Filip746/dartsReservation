// src/app/hooks/usePricing.ts
import { useMemo } from "react";
import { formatDateISO } from "../../shared/utils/date";
import type { AppSettings, Appointment, SpecialOffer, User } from "../../shared/types/domain";

export function usePricing(
  selectedSlots: { dayIndex: number; hour: number }[],
  selectedOfferId: string,
  myOffers: SpecialOffer[],
  settings: AppSettings,
  currentWeekStart: Date,
  user: User | null,
  appointments: Appointment[]
) {
  return useMemo(() => {
    const sortedSlots = [...selectedSlots].sort(
      (a, b) => a.dayIndex * 24 + a.hour - (b.dayIndex * 24 + b.hour)
    );
    const activeOffer = myOffers.find((o) => o.id === selectedOfferId);
    let freeSlotsRemaining = (activeOffer?.type === "free_slot" && activeOffer.value) || 0;

    const dayGroups: Record<number, { count: number; subtotal: number }> = {};

    sortedSlots.forEach((slot) => {
      if (!dayGroups[slot.dayIndex]) dayGroups[slot.dayIndex] = { count: 0, subtotal: 0 };
      let price = settings.basePrice;
      if (activeOffer) {
        if (activeOffer.type === "fixed_price") price = activeOffer.value;
        if (activeOffer.type === "discount_percent") price = price * (1 - activeOffer.value / 100);
      }
      if (freeSlotsRemaining > 0) {
        price = 0;
        freeSlotsRemaining--;
      }
      dayGroups[slot.dayIndex].count++;
      dayGroups[slot.dayIndex].subtotal += price;
    });

    let total = 0;
    Object.keys(dayGroups).forEach((dKey) => {
      const dayIndex = Number(dKey);
      const group = dayGroups[dayIndex];
      const currentWeekStr = formatDateISO(currentWeekStart);
      const existingBookingsCount = user
        ? appointments.filter(
            (a) =>
              a.userId === user.id &&
              (a.weekStart.startsWith(currentWeekStr) ||
                new Date(a.weekStart).toDateString() === currentWeekStart.toDateString()) &&
              a.dayIndex === dayIndex
          ).length
        : 0;

      const totalDailyCount = existingBookingsCount + group.count;
      const tier = settings.consecutiveDiscountTiers
        .sort((a, b) => b.threshold - a.threshold)
        .find((t) => totalDailyCount >= t.threshold);

      let dailyTotal = group.subtotal;
      if (tier) {
        dailyTotal = dailyTotal * (1 - tier.discount / 100);
      }
      total += dailyTotal;
    });
    return Math.round(total * 100) / 100;
  }, [selectedSlots, settings, currentWeekStart, user, myOffers, selectedOfferId, appointments]);
}
