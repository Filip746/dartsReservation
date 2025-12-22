// src/app/hooks/useAppointments.ts
import { useState, useEffect } from "react";
import type { Appointment, AppSettings, User } from "../../shared/types/domain";
import { formatDateISO } from "../../shared/utils/date";

export function useAppointments(
  settings: AppSettings,
  saveSettings: (s: AppSettings) => void
) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const storedApps = localStorage.getItem("darts_appointments");
    if (storedApps) setAppointments(JSON.parse(storedApps));
  }, []);

  const saveAppointments = (newApps: Appointment[]) => {
    setAppointments(newApps);
    localStorage.setItem("darts_appointments", JSON.stringify(newApps));
  };

  const createAppointments = (
    selectedSlots: { dayIndex: number; hour: number }[],
    selectedMachineId: string,
    selectedOfferId: string,
    user: User,
    currentWeekStart: Date,
    myOffers: any[]
  ) => {
    const weekKey = formatDateISO(currentWeekStart);
    let updatedAppointments = appointments.map((a) => ({ ...a }));
    const newAppointments: Appointment[] = [];

    selectedSlots.forEach((slot) => {
      let price = settings.basePrice;
      const activeOffer = myOffers.find((o) => o.id === selectedOfferId);
      if (activeOffer) {
        if (activeOffer.type === "fixed_price") price = activeOffer.value;
        if (activeOffer.type === "discount_percent")
          price = price * (1 - activeOffer.value / 100);
        if (activeOffer.type === "free_slot") price = 0;
      }
      newAppointments.push({
        id: Math.random().toString(36).substr(2, 9),
        weekStart: weekKey,
        dayIndex: slot.dayIndex,
        hour: slot.hour,
        userId: user.id,
        userName: user.name,
        machineId: selectedMachineId,
        price: price,
        offerId: selectedOfferId || undefined,
      });
    });

    // Apply bulk discount logic
    const affectedDays = Array.from(new Set(selectedSlots.map((s) => s.dayIndex)));
    affectedDays.forEach((dayIndex) => {
      const existingIndices = updatedAppointments
        .map((a, i) =>
          a.userId === user.id &&
          (a.weekStart.startsWith(weekKey) ||
            new Date(a.weekStart).toDateString() === currentWeekStart.toDateString()) &&
          a.dayIndex === dayIndex
            ? i
            : -1
        )
        .filter((i) => i !== -1);
      const newIndices = newAppointments
        .map((a, i) => (a.dayIndex === dayIndex ? i : -1))
        .filter((i) => i !== -1);
      const totalCount = existingIndices.length + newIndices.length;
      const tier = settings.consecutiveDiscountTiers
        .sort((a, b) => b.threshold - a.threshold)
        .find((t) => totalCount >= t.threshold);
      const discountPercent = tier ? tier.discount : 0;

      if (discountPercent > 0) {
        existingIndices.forEach((idx) => {
          const app = updatedAppointments[idx];
          if (!app.offerId) {
            const newPrice = settings.basePrice * (1 - discountPercent / 100);
            updatedAppointments[idx].price = Math.round(newPrice * 100) / 100;
            updatedAppointments[idx].discountRule = `Bulk ${tier!.threshold}+ (-${tier!.discount}%)`;
          }
        });
        newIndices.forEach((idx) => {
          const app = newAppointments[idx];
          if (!app.offerId) {
            const newPrice = settings.basePrice * (1 - discountPercent / 100);
            newAppointments[idx].price = Math.round(newPrice * 100) / 100;
            newAppointments[idx].discountRule = `Bulk ${tier!.threshold}+ (-${tier!.discount}%)`;
          }
        });
      }
    });

    // Mark offer as used
    if (selectedOfferId) {
      const updatedOffers = settings.specialOffers.map((o) => {
        if (o.id === selectedOfferId && !o.isTemplate) {
          return { ...o, used: true };
        }
        return o;
      });
      saveSettings({ ...settings, specialOffers: updatedOffers });
    }

    const finalApps = [...updatedAppointments, ...newAppointments];
    saveAppointments(finalApps);
  };

  const cancelAppointment = (appId: string): { success: boolean; error?: string } => {
    const app = appointments.find((a) => a.id === appId);
    if (!app) return { success: false, error: "Appointment not found" };

    const [y, m, day] = app.weekStart.split("-").map(Number);
    const d = new Date(y, m - 1, day);
    const offset = app.dayIndex === 0 ? 6 : app.dayIndex - 1;
    d.setDate(d.getDate() + offset);
    d.setHours(app.hour, 0, 0, 0);
    const now = new Date();
    const hoursDiff = (d.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return { success: false, error: `Too late (${hoursDiff.toFixed(1)}h remaining)` };
    }

    if (app.offerId) {
      const updatedOffers = settings.specialOffers.map((o) => {
        if (o.id === app.offerId) return { ...o, used: false };
        return o;
      });
      saveSettings({ ...settings, specialOffers: updatedOffers });
    }

    let newApps = appointments.filter((a) => a.id !== appId);
    const weekKey = app.weekStart;
    const dayIndex = app.dayIndex;
    const userId = app.userId;
    const countOnDay = newApps.filter(
      (a) => a.userId === userId && a.weekStart === weekKey && a.dayIndex === dayIndex
    ).length;
    const tier = settings.consecutiveDiscountTiers
      .sort((a, b) => b.threshold - a.threshold)
      .find((t) => countOnDay >= t.threshold);
    const discountPercent = tier ? tier.discount : 0;

    newApps = newApps.map((a) => {
      if (a.userId === userId && a.weekStart === weekKey && a.dayIndex === dayIndex) {
        if (!a.offerId) {
          let price = settings.basePrice;
          if (discountPercent > 0) price = price * (1 - discountPercent / 100);
          return {
            ...a,
            price: Math.round(price * 100) / 100,
            discountRule:
              discountPercent > 0 ? `Bulk ${tier!.threshold}+ (-${tier!.discount}%)` : undefined,
          };
        }
      }
      return a;
    });

    saveAppointments(newApps);
    return { success: true };
  };

  return {
    appointments,
    saveAppointments,
    createAppointments,
    cancelAppointment,
  };
}
