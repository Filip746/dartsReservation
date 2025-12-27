import { useCallback, useState } from "react";
import { formatDateISO } from "../../../shared/utils/date";
import type { AppSettings, DiscountTier, LoyaltyTier, Machine } from "../../../shared/types/domain";

type ToastFn = (toast: any) => void;

export const useAdminSettings = (
  initialSettings: AppSettings,
  setToast: ToastFn,
  t: any
) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(initialSettings);

  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newMachineName, setNewMachineName] = useState("");

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  const [openIconSelectorIndex, setOpenIconSelectorIndex] = useState<number | null>(null);

  const addBlockedDate = useCallback(() => {
    const todayStr = formatDateISO(new Date());
    if (newBlockedDate === todayStr) {
      setToast({ show: true, msg: "Error", desc: t.cannotBlockToday, variant: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (newBlockedDate && !localSettings.blockedDates.includes(newBlockedDate)) {
      setLocalSettings((s) => ({
        ...s,
        blockedDates: [...s.blockedDates, newBlockedDate].sort(),
      }));
      setNewBlockedDate("");
    }
  }, [newBlockedDate, localSettings.blockedDates, setToast, t]);

  const removeBlockedDate = useCallback((dateStr: string) => {
    setLocalSettings((s) => ({
      ...s,
      blockedDates: s.blockedDates.filter((d) => d !== dateStr),
    }));
  }, []);

  const addMachine = useCallback(() => {
    if (!newMachineName) return;
    const newId = `dart-${Date.now()}`;
    setLocalSettings((s) => ({
      ...s,
      machines: [...s.machines, { id: newId, name: newMachineName } as Machine],
    }));
    setNewMachineName("");
  }, [newMachineName]);

  const removeMachine = useCallback(
    (id: string) => {
      if (localSettings.machines.length <= 1) return;
      setLocalSettings((s) => ({
        ...s,
        machines: s.machines.filter((m) => m.id !== id),
      }));
    },
    [localSettings.machines.length]
  );

  const addLoyaltyTier = useCallback(() => {
    setLocalSettings((s) => ({
      ...s,
      loyaltyProgram: {
        ...s.loyaltyProgram,
        tiers: [
          ...s.loyaltyProgram.tiers,
          {
            id: `tier-${Date.now()}`,
            name: "New Tier",
            bookingsRequired: 100,
            icon: "ph-star",
            color: "text-white",
            enabled: true,
          } as LoyaltyTier,
        ],
      },
    }));
  }, []);

  const removeLoyaltyTier = useCallback(
    (index: number) => {
      const tiers = [...localSettings.loyaltyProgram.tiers];
      tiers.splice(index, 1);
      setLocalSettings((s) => ({
        ...s,
        loyaltyProgram: { ...s.loyaltyProgram, tiers },
      }));
    },
    [localSettings.loyaltyProgram.tiers]
  );

  const handleTierChange = useCallback(
    (index: number, field: string, value: any) => {
      const newTiers = [...localSettings.loyaltyProgram.tiers];
      newTiers[index] = { ...newTiers[index], [field]: value };
      setLocalSettings((s) => ({
        ...s,
        loyaltyProgram: { ...s.loyaltyProgram, tiers: newTiers },
      }));
    },
    [localSettings.loyaltyProgram.tiers]
  );

  const saveNewDiscountTier = useCallback((tier: DiscountTier) => {
    setLocalSettings((s) => ({
      ...s,
      consecutiveDiscountTiers: [...(s.consecutiveDiscountTiers || []), tier].sort(
        (a, b) => a.threshold - b.threshold
      ),
    }));
    setIsAddingRule(false);
  }, []);

  const saveEditedDiscountTier = useCallback(
    (tier: DiscountTier) => {
      if (editingRuleIndex === null) return;
      const tiers = [...(localSettings.consecutiveDiscountTiers || [])];
      tiers[editingRuleIndex] = tier;
      setLocalSettings((s) => ({
        ...s,
        consecutiveDiscountTiers: tiers.sort((a, b) => a.threshold - b.threshold),
      }));
      setEditingRuleIndex(null);
    },
    [editingRuleIndex, localSettings.consecutiveDiscountTiers]
  );

  const removeDiscountTier = useCallback(
    (index: number) => {
      const tiers = [...(localSettings.consecutiveDiscountTiers || [])];
      tiers.splice(index, 1);
      setLocalSettings((s) => ({
        ...s,
        consecutiveDiscountTiers: tiers,
      }));
    },
    [localSettings.consecutiveDiscountTiers]
  );

  return {
    localSettings,
    setLocalSettings,

    newBlockedDate,
    setNewBlockedDate,
    addBlockedDate,
    removeBlockedDate,

    newMachineName,
    setNewMachineName,
    addMachine,
    removeMachine,

    isAddingRule,
    setIsAddingRule,
    editingRuleIndex,
    setEditingRuleIndex,

    openIconSelectorIndex,
    setOpenIconSelectorIndex,

    addLoyaltyTier,
    removeLoyaltyTier,
    handleTierChange,

    saveNewDiscountTier,
    saveEditedDiscountTier,
    removeDiscountTier,
  };
};
