import { useCallback, useMemo, useState } from "react";
import type { Appointment, AppSettings, LoyaltyTier, User } from "../../../shared/types/domain";

type ToastFn = (toast: any) => void;

export const useAdminUsers = (
  registeredUsers: User[],
  setRegisteredUsers: (users: User[]) => void,
  appointments: Appointment[],
  settings: AppSettings,
  setToast: ToastFn,
  t: any
) => {
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Users tab samo bira usera kome šalješ ponudu (modal i slanje rješava Offers hook)
  const [selectedUserForOffer, setSelectedUserForOffer] = useState<User | null>(null);

  const toggleBlockUser = useCallback(
    (userId: string) => {
      const updatedUsers = registeredUsers.map((u) =>
        u.id === userId ? { ...u, blocked: !u.blocked } : u
      );

      setRegisteredUsers(updatedUsers);

      const isBlocked = updatedUsers.find((u) => u.id === userId)?.blocked;
      setToast({
        show: true,
        msg: isBlocked ? t.userBlocked : t.userUnblocked,
        desc: "User status updated",
        variant: "info",
      });
      setTimeout(() => setToast(null), 3000);
    },
    [registeredUsers, setRegisteredUsers, setToast, t]
  );

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }, []);

  const selectAllUsers = useCallback(() => {
    setSelectedUserIds((prev) => {
      if (prev.size === registeredUsers.length) return new Set();
      return new Set(registeredUsers.map((u) => u.id));
    });
  }, [registeredUsers]);

  const clearSelection = useCallback(() => setSelectedUserIds(new Set()), []);

  // memo: spend po useru
  const spendByUserId = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      if (!a.userId) continue;
      map.set(a.userId, (map.get(a.userId) ?? 0) + (a.price || 0));
    }
    return map;
  }, [appointments]);

  // memo: broj booking-a po useru
  const countByUserId = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of appointments) {
      if (!a.userId) continue;
      map.set(a.userId, (map.get(a.userId) ?? 0) + 1);
    }
    return map;
  }, [appointments]);

  const getUserTotalSpend = useCallback(
    (userId: string) => spendByUserId.get(userId) ?? 0,
    [spendByUserId]
  );

  const getUserLatestBadge = useCallback(
    (userId: string): LoyaltyTier | null => {
      if (!settings.loyaltyProgram.enabled) return null;

      const count = countByUserId.get(userId) ?? 0;
      const earned = settings.loyaltyProgram.tiers
        .filter((tier) => tier.enabled && count >= tier.bookingsRequired)
        .sort((a, b) => b.bookingsRequired - a.bookingsRequired);

      return earned.length > 0 ? earned[0] : null;
    },
    [settings.loyaltyProgram.enabled, settings.loyaltyProgram.tiers, countByUserId]
  );

  const getUserBreakdown = useCallback(
    (userId: string) => {
      const userApps = appointments.filter((a) => a.userId === userId);

      const groups: Record<
        string,
        { count: number; sum: number; discounts: number[]; discountRules: string[] }
      > = {};

      userApps.forEach((a) => {
        const date = new Date(a.weekStart);
        if (a.dayIndex === 0) date.setDate(date.getDate() + 6);
        else date.setDate(date.getDate() + (a.dayIndex - 1));

        const key = date.toLocaleDateString();
        if (!groups[key]) groups[key] = { count: 0, sum: 0, discounts: [], discountRules: [] };

        groups[key].count++;
        groups[key].sum += a.price || 0;

        if ((a.price ?? 0) < settings.basePrice) {
          groups[key].discounts.push(a.price ?? 0);
          if (a.discountRule) groups[key].discountRules.push(a.discountRule);
        }
      });

      return Object.entries(groups).map(([date, data]) => ({ date, ...data }));
    },
    [appointments, settings.basePrice]
  );

  const toggleExpandedUser = useCallback((userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  }, []);

  const openOfferForUser = useCallback((user: User) => {
    setSelectedUserForOffer(user);
  }, []);

  const closeOfferForUser = useCallback(() => {
    setSelectedUserForOffer(null);
  }, []);

  return {
    selectedUserIds,
    expandedUserId,
    selectedUserForOffer,

    toggleBlockUser,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,

    toggleExpandedUser,
    openOfferForUser,
    closeOfferForUser,

    getUserTotalSpend,
    getUserLatestBadge,
    getUserBreakdown,
  };
};
