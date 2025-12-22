import React, { useState, useEffect } from "react";
import { Button } from "../../shared/ui/Button";
import { Modal } from "../../shared/ui/Modal";
import { Toggle } from "../../shared/ui/Toggle";
import { DiscountTierForm } from "./DiscountTierForm";
import { OfferForm } from "./OfferForm";
import {
  TRANSLATIONS,
  DRINK_MENU,
  LOYALTY_ICONS,
} from "../../shared/constants/app";
import { formatDateISO } from "../../shared/utils/date";
import type {
  AppSettings,
  Tournament,
  User,
  Appointment,
  Language,
  DiscountTier,
  SpecialOffer,
  TournamentPrize,
  LoyaltyTier,
  Machine,
} from "../../shared/types/domain";
import { generateBracket } from "@/src/shared/utils/tournament";
import { TournamentBracket } from "../tournaments/TournamentBracket";

interface AdminPanelProps {
  settings: AppSettings;
  appointments: Appointment[];
  tournaments: Tournament[];
  registeredUsers: User[];
  setRegisteredUsers: (users: User[]) => void;
  currentWeekStart: string | Date; // ← OVO POPRAVI
  onSave: (settings: AppSettings) => void;
  onSaveTournaments: (tournaments: Tournament[]) => void;
  onClose: () => void;
  lang: Language;
  setToast: (toast: any) => void;
}

// --- Admin Panel ---
export const AdminPanel = ({
  settings,
  appointments,
  tournaments,
  registeredUsers,
  setRegisteredUsers,
  currentWeekStart,
  onSave,
  onSaveTournaments,
  onClose,
  lang,
  setToast,
}: AdminPanelProps) => {
  const [activeTab, setActiveTab] = useState<
    "settings" | "tournaments" | "users" | "offers"
  >("settings");
  const [localSettings, setLocalSettings] = useState(settings);
  const [localTournaments, setLocalTournaments] =
    useState<Tournament[]>(tournaments);

  // Settings State
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [newMachineName, setNewMachineName] = useState("");

  // Tournament Creation State
  const [newTourneyName, setNewTourneyName] = useState("");
  const [newTourneyStart, setNewTourneyStart] = useState("");
  const [newTourneyDuration, setNewTourneyDuration] = useState(2);
  const [newTourneyFormat, setNewTourneyFormat] = useState<"single" | "double">(
    "single"
  );
  const [newTourneyPrizes, setNewTourneyPrizes] = useState<TournamentPrize[]>(
    []
  );

  // New Prize Temp State
  const [tempPrizeRank, setTempPrizeRank] = useState(1);
  const [tempPrizeType, setTempPrizeType] = useState("free_slot");
  const [tempPrizeValue, setTempPrizeValue] = useState<number | string>(1);

  // Offer Creation State
  const [offerFormState, setOfferFormState] = useState({
    name: "",
    type: "discount_percent",
    value: 20,
    startDate: "",
    endDate: "",
    conditionType: "none",
    conditionValue: 0,
    rewardProduct: DRINK_MENU[0],
  });

  // Selected User State for sending offer
  const [selectedUserForOffer, setSelectedUserForOffer] = useState<User | null>(
    null
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  // Bulk Selection
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);

  const [selectedTourneyId, setSelectedTourneyId] = useState<string | null>(
    null
  );

  // Discount Editing State
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);

  // Icon Selector State
  const [openIconSelectorIndex, setOpenIconSelectorIndex] = useState<
    number | null
  >(null);

  // Expanded User Row for Breakdown
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // View Recipients State
  const [viewingOfferId, setViewingOfferId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  // Update tempPrizeValue default based on type
  useEffect(() => {
    if (tempPrizeType === "free_drink") setTempPrizeValue(DRINK_MENU[0]);
    else setTempPrizeValue(1);
  }, [tempPrizeType]);

  const distributePrizes = (tourneyId: string) => {
    const tr = localTournaments.find((t) => t.id === tourneyId);
    if (!tr || tr.status !== "completed" || tr.prizesDistributed) return;

    // 1. Identify Winners
    const finalRound = Math.max(...tr.matches.map((m) => m.round));
    const finalMatch = tr.matches.find((m) => m.round === finalRound);

    if (!finalMatch || !finalMatch.winnerId) {
      setToast({
        show: true,
        msg: "Error",
        desc: "No final winner found.",
        variant: "error",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const winnerId = finalMatch.winnerId;
    const runnerUpId =
      finalMatch.p1Id === winnerId ? finalMatch.p2Id : finalMatch.p1Id;

    // Semi-final losers (Rank 3)
    const semiRound = finalRound - 1;
    const semiMatches = tr.matches.filter((m) => m.round === semiRound);
    const semiLosersIds = semiMatches
      .map((m) => (m.winnerId === m.p1Id ? m.p2Id : m.p1Id))
      .filter(Boolean);

    const newOffers: SpecialOffer[] = [];

    tr.prizes.forEach((prize) => {
      let targetParticipantIds: string[] = [];

      if (prize.rank === 1) targetParticipantIds = [winnerId];
      else if (prize.rank === 2 && runnerUpId)
        targetParticipantIds = [runnerUpId];
      else if (prize.rank === 3)
        targetParticipantIds = semiLosersIds as string[];

      targetParticipantIds.forEach((pId) => {
        const part = tr.participants.find((p) => p.id === pId);
        if (part) {
          part.userIds.forEach((uid) => {
            newOffers.push({
              id: `prize-${Date.now()}-${uid}-${prize.rank}`,
              name: `🏆 ${tr.name} - #${prize.rank} Place`,
              type: prize.type as any,
              value: typeof prize.value === "string" ? 0 : prize.value, // Handle drink string logic
              rewardProduct:
                typeof prize.value === "string" ? prize.value : undefined,
              startDate: new Date().toISOString(),
              endDate: new Date(
                Date.now() + 90 * 24 * 60 * 60 * 1000
              ).toISOString(), // 90 days validity
              targetUserId: uid,
              conditionType: "none",
              used: false,
            });
          });
        }
      });
    });

    if (newOffers.length === 0) {
      setToast({
        show: true,
        msg: "No Prizes",
        desc: "No prizes configured or matching ranks.",
        variant: "info",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Update Settings with new offers
    setLocalSettings((prev: AppSettings) => ({
      ...prev,
      specialOffers: [...prev.specialOffers, ...newOffers],
    }));

    // Update Tournament status
    const updatedTournaments = localTournaments.map((t) =>
      t.id === tourneyId ? { ...t, prizesDistributed: true } : t
    );
    setLocalTournaments(updatedTournaments);

    // Need to save settings first to persist offers
    onSave({
      ...localSettings,
      specialOffers: [...localSettings.specialOffers, ...newOffers],
    });
    onSaveTournaments(updatedTournaments);

    setToast({
      show: true,
      msg: "Prizes Distributed",
      desc: `${newOffers.length} rewards sent to winners!`,
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  };

  const handleTierChange = (index: number, field: string, value: any) => {
    const newTiers = [...localSettings.loyaltyProgram.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setLocalSettings((s: AppSettings) => ({
      ...s,
      loyaltyProgram: { ...s.loyaltyProgram, tiers: newTiers },
    }));
  };
  const addBlockedDate = () => {
    const todayStr = formatDateISO(new Date());
    if (newBlockedDate === todayStr) {
      setToast({
        show: true,
        msg: "Error",
        desc: t.cannotBlockToday,
        variant: "error",
      });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (
      newBlockedDate &&
      !localSettings.blockedDates.includes(newBlockedDate)
    ) {
      setLocalSettings((s: AppSettings) => ({
        ...s,
        blockedDates: [...s.blockedDates, newBlockedDate].sort(),
      }));
      setNewBlockedDate("");
    }
  };
  const removeBlockedDate = (dateStr: string) => {
    setLocalSettings((s: AppSettings) => ({
      ...s,
      blockedDates: s.blockedDates.filter((d: string) => d !== dateStr),
    }));
  };
  const addMachine = () => {
    if (newMachineName) {
      const newId = `dart-${Date.now()}`;
      setLocalSettings((s: AppSettings) => ({
        ...s,
        machines: [...s.machines, { id: newId, name: newMachineName }],
      }));
      setNewMachineName("");
    }
  };
  const removeMachine = (id: string) => {
    if (localSettings.machines.length <= 1) return;
    setLocalSettings((s: AppSettings) => ({
      ...s,
      machines: s.machines.filter((m: Machine) => m.id !== id),
    }));
  };
  const addLoyaltyTier = () => {
    setLocalSettings((s: AppSettings) => ({
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
          },
        ],
      },
    }));
  };
  const removeLoyaltyTier = (index: number) => {
    const tiers = [...localSettings.loyaltyProgram.tiers];
    tiers.splice(index, 1);
    setLocalSettings((s: AppSettings) => ({
      ...s,
      loyaltyProgram: { ...s.loyaltyProgram, tiers: tiers },
    }));
  };
  const saveNewDiscountTier = (tier: DiscountTier) => {
    setLocalSettings((s: AppSettings) => ({
      ...s,
      consecutiveDiscountTiers: [
        ...(s.consecutiveDiscountTiers || []),
        tier,
      ].sort((a, b) => a.threshold - b.threshold),
    }));
    setIsAddingRule(false);
  };
  const saveEditedDiscountTier = (tier: DiscountTier) => {
    if (editingRuleIndex === null) return;
    const tiers = [...(localSettings.consecutiveDiscountTiers || [])];
    tiers[editingRuleIndex] = tier;
    setLocalSettings((s: AppSettings) => ({
      ...s,
      consecutiveDiscountTiers: tiers.sort((a, b) => a.threshold - b.threshold),
    }));
    setEditingRuleIndex(null);
  };
  const removeDiscountTier = (index: number) => {
    const tiers = [...(localSettings.consecutiveDiscountTiers || [])];
    tiers.splice(index, 1);
    setLocalSettings((s: AppSettings) => ({
      ...s,
      consecutiveDiscountTiers: tiers,
    }));
  };
  const toggleBlockUser = (userId: string) => {
    const updatedUsers = registeredUsers.map((u: User) => {
      if (u.id === userId) return { ...u, blocked: !u.blocked };
      return u;
    });
    setRegisteredUsers(updatedUsers);
    setToast({
      show: true,
      msg: updatedUsers.find((u: User) => u.id === userId)?.blocked
        ? t.userBlocked
        : t.userUnblocked,
      desc: "User status updated",
      variant: "info",
    });
    setTimeout(() => setToast(null), 3000);
  };
  const toggleUserSelection = (userId: string) => {
    const newSet = new Set(selectedUserIds);
    if (newSet.has(userId)) newSet.delete(userId);
    else newSet.add(userId);
    setSelectedUserIds(newSet);
  };
  const selectAllUsers = () => {
    if (selectedUserIds.size === registeredUsers.length)
      setSelectedUserIds(new Set());
    else setSelectedUserIds(new Set(registeredUsers.map((u) => u.id)));
  };
  const createOfferTemplate = () => {
    if (!offerFormState.name) return;
    const start = offerFormState.startDate || new Date().toISOString();
    const end =
      offerFormState.endDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newOffer: SpecialOffer = {
      id: `offer-${Date.now()}`,
      name: offerFormState.name,
      type: offerFormState.type as any,
      value: offerFormState.value,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      targetUserId: null,
      conditionType: offerFormState.conditionType as any,
      conditionValue: offerFormState.conditionValue,
      rewardProduct:
        offerFormState.type === "free_drink"
          ? offerFormState.rewardProduct
          : undefined,
      isTemplate: true,
    };
    setLocalSettings((s: AppSettings) => ({
      ...s,
      specialOffers: [...s.specialOffers, newOffer],
    }));
    setOfferFormState({
      name: "",
      type: "discount_percent",
      value: 20,
      startDate: "",
      endDate: "",
      conditionType: "none",
      conditionValue: 0,
      rewardProduct: DRINK_MENU[0],
    });
    setToast({
      show: true,
      msg: "Offer Template Created",
      desc: "Available for assignment in Users tab.",
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  };
  const sendTemplateToUser = () => {
    if (!selectedTemplateId) return;
    const template = localSettings.specialOffers.find(
      (o) => o.id === selectedTemplateId
    );
    if (!template) return;

    const targets = selectedUserForOffer
      ? [selectedUserForOffer.id]
      : Array.from(selectedUserIds);
    const newOffers: SpecialOffer[] = [];

    targets.forEach((uid) => {
      newOffers.push({
        ...template,
        id: `offer-${Date.now()}-${uid}`,
        targetUserId: uid,
        isTemplate: false,
        used: false,
        parentTemplateId: template.id,
      });
    });
    setLocalSettings((s: AppSettings) => ({
      ...s,
      specialOffers: [...s.specialOffers, ...newOffers],
    }));
    setSelectedUserForOffer(null);
    setSelectedTemplateId("");
    setShowBulkOfferModal(false);
    setSelectedUserIds(new Set());
    setToast({
      show: true,
      msg: t.offerSent,
      desc: `Sent to ${targets.length} user(s)`,
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  };
  const deleteOffer = (id: string) => {
    setLocalSettings((s: AppSettings) => ({
      ...s,
      specialOffers: s.specialOffers.filter((o) => o.id !== id),
    }));
  };
  const deleteRecipientOffer = (offerId: string) => {
    setLocalSettings((s: AppSettings) => ({
      ...s,
      specialOffers: s.specialOffers.filter((o) => o.id !== offerId),
    }));
  };
  const addTournamentPrize = () => {
    setNewTourneyPrizes(
      [
        ...newTourneyPrizes,
        {
          rank: tempPrizeRank,
          type: tempPrizeType as any,
          value: tempPrizeValue,
        },
      ].sort((a, b) => a.rank - b.rank)
    );
    setTempPrizeRank((prev) => prev + 1);
  };
  const removeTournamentPrize = (idx: number) => {
    const p = [...newTourneyPrizes];
    p.splice(idx, 1);
    setNewTourneyPrizes(p);
  };
  const createTournament = () => {
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
    const updatedList = [...localTournaments, newT];
    setLocalTournaments(updatedList);
    onSaveTournaments(updatedList);
    setNewTourneyName("");
    setNewTourneyStart("");
    setNewTourneyPrizes([]);
    setTempPrizeRank(1);
    setToast({
      show: true,
      msg: "Tournament Created",
      desc: "Saved successfully.",
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  };
  const deleteTournament = (id: string) => {
    const updatedList = localTournaments.filter((t) => t.id !== id);
    setLocalTournaments(updatedList);
    if (selectedTourneyId === id) setSelectedTourneyId(null);
    onSaveTournaments(updatedList);
  };
  const startTournament = (id: string) => {
    const updated = localTournaments.map((tr) => {
      if (tr.id === id) {
        return {
          ...tr,
          status: "active" as const,
          matches: generateBracket(tr.participants),
        };
      }
      return tr;
    });
    setLocalTournaments(updated);
    onSaveTournaments(updated);
  };
  const updateParticipantSeed = (
    tourneyId: string,
    participantId: string,
    seed: number
  ) => {
    const updated = localTournaments.map((tr) => {
      if (tr.id === tourneyId) {
        const parts = tr.participants.map((p) =>
          p.id === participantId ? { ...p, seed } : p
        );
        return { ...tr, participants: parts };
      }
      return tr;
    });
    setLocalTournaments(updated);
    onSaveTournaments(updated);
  };
  const autoSeedParticipants = (tourneyId: string) => {
    const updated = localTournaments.map((tr) => {
      if (tr.id === tourneyId) {
        const parts = tr.participants.map((p, idx) => ({
          ...p,
          seed: idx + 1,
        }));
        return { ...tr, participants: parts };
      }
      return tr;
    });
    setLocalTournaments(updated);
    onSaveTournaments(updated);
  };
  const advanceMatch = (
    tourneyId: string,
    matchId: string,
    winnerId: string
  ) => {
    const updatedTournaments = localTournaments.map((tr) => {
      if (tr.id !== tourneyId) return tr;
      const newMatches = [...tr.matches];
      const matchIndex = newMatches.findIndex((m) => m.id === matchId);
      if (matchIndex === -1) return tr;
      const oldWinner = newMatches[matchIndex].winnerId;
      const match = { ...newMatches[matchIndex], winnerId };
      newMatches[matchIndex] = match;
      if (match.nextMatchId) {
        const nextIndex = newMatches.findIndex(
          (m) => m.id === match.nextMatchId
        );
        if (nextIndex !== -1) {
          const nextMatch = { ...newMatches[nextIndex] };
          if (
            oldWinner &&
            oldWinner !== winnerId &&
            nextMatch.winnerId === oldWinner
          ) {
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
        status: (match.nextMatchId ? "active" : "completed") as
          | "active"
          | "completed",
      };
    });
    setLocalTournaments(updatedTournaments);
    onSaveTournaments(updatedTournaments);
  };
  const selectedTourney = localTournaments.find(
    (t) => t.id === selectedTourneyId
  );
  const getUserTotalSpend = (userId: string) => {
    return appointments
      .filter((a: Appointment) => a.userId === userId)
      .reduce((sum: number, a: Appointment) => sum + (a.price || 0), 0);
  };
  const getUserLatestBadge = (userId: string) => {
    if (!localSettings.loyaltyProgram.enabled) return null;
    const count = appointments.filter(
      (a: Appointment) => a.userId === userId
    ).length;
    const earned = localSettings.loyaltyProgram.tiers
      .filter((t) => t.enabled && count >= t.bookingsRequired)
      .sort((a, b) => b.bookingsRequired - a.bookingsRequired);
    return earned.length > 0 ? earned[0] : null;
  };
  const getUserBreakdown = (userId: string) => {
    const userApps = appointments.filter(
      (a: Appointment) => a.userId === userId
    );
    const groups: any = {};
    userApps.forEach((a: Appointment) => {
      const date = new Date(a.weekStart);
      if (a.dayIndex === 0) date.setDate(date.getDate() + 6);
      else date.setDate(date.getDate() + (a.dayIndex - 1));

      const key = date.toLocaleDateString();
      if (!groups[key])
        groups[key] = { count: 0, sum: 0, discounts: [], discountRules: [] };
      groups[key].count++;
      groups[key].sum += a.price || 0;
      if (a.price! < settings.basePrice) {
        groups[key].discounts.push(a.price);
        if (a.discountRule) groups[key].discountRules.push(a.discountRule);
      }
    });
    return Object.entries(groups).map(([date, data]: any) => ({
      date,
      ...data,
    }));
  };
  const getOfferRecipients = (templateId: string) => {
    return localSettings.specialOffers.filter(
      (o) => o.parentTemplateId === templateId
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="border-b border-slate-800 bg-slate-900 sticky top-0 z-10 shadow-lg">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
              <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                <i className="ph-fill ph-gear text-xl"></i>
              </div>
              <span className="inline">{t.adminPanel}</span>
            </h2>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} className="text-xs">
                {t.cancel}
              </Button>
              <Button
                onClick={() => {
                  onSave(localSettings);
                  onSaveTournaments(localTournaments);
                  onClose();
                }}
                className="text-xs"
              >
                {t.save}
              </Button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {["settings", "tournaments", "users", "offers"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs font-bold px-4 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0 border ${
                  activeTab === tab
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                }`}
              >
                {t[tab as keyof typeof t] || tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-8 pb-24">
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <i className="ph-fill ph-coin"></i> {t.basePrice}
                </h3>
                <input
                  type="number"
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
                  value={localSettings.basePrice}
                  onChange={(e) =>
                    setLocalSettings((s: AppSettings) => ({
                      ...s,
                      basePrice: Number(e.target.value),
                    }))
                  }
                />
              </section>
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                  <i className="ph-fill ph-target"></i> {t.machines}
                </h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder={t.machineName}
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white flex-1"
                    value={newMachineName}
                    onChange={(e) => setNewMachineName(e.target.value)}
                  />
                  <Button
                    onClick={addMachine}
                    className="text-xs whitespace-nowrap"
                  >
                    {t.addMachine}
                  </Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {localSettings.machines.map((machine: Machine) => (
                    <div
                      key={machine.id}
                      className="bg-slate-950/50 border border-slate-800 p-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-white font-medium text-sm">
                        {machine.name}
                      </span>
                      <button
                        className="text-red-500 hover:text-white"
                        onClick={() => removeMachine(machine.id)}
                        disabled={localSettings.machines.length <= 1}
                      >
                        <i className="ph-bold ph-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Consecutive Discounts - Editable */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-amber-400 font-bold mb-4 flex items-center gap-2">
                <i className="ph-fill ph-lightning"></i> {t.consecutiveDiscount}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(localSettings.consecutiveDiscountTiers || []).map(
                    (tier: DiscountTier, idx: number) => (
                      <div
                        key={idx}
                        className={`bg-slate-950 p-4 rounded-xl border ${
                          editingRuleIndex === idx
                            ? "border-amber-500 ring-1 ring-amber-500"
                            : "border-slate-800"
                        } relative group hover:border-slate-700 transition-colors`}
                      >
                        {editingRuleIndex === idx ? (
                          <DiscountTierForm
                            initialData={tier}
                            onSave={saveEditedDiscountTier}
                            onCancel={() => setEditingRuleIndex(null)}
                            t={t}
                          />
                        ) : (
                          <>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-2xl font-bold text-white">
                                  {tier.discount}%
                                </div>
                                <div className="text-xs text-slate-500 uppercase font-bold mt-1">
                                  Popust
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-amber-500">
                                  {tier.threshold}
                                </div>
                                <div className="text-[10px] text-slate-500 uppercase">
                                  Termina
                                </div>
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingRuleIndex(idx)}
                                className="text-slate-600 hover:text-blue-400"
                              >
                                <i className="ph-bold ph-pencil-simple"></i>
                              </button>
                              <button
                                onClick={() => removeDiscountTier(idx)}
                                className="text-slate-600 hover:text-red-500"
                              >
                                <i className="ph-bold ph-trash"></i>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  )}

                  {!isAddingRule ? (
                    <button
                      onClick={() => setIsAddingRule(true)}
                      className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-4 flex items-center justify-center text-slate-500 hover:text-amber-500 hover:border-amber-500/50 transition-all h-full min-h-[100px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <i className="ph-bold ph-plus text-2xl"></i>
                        <span className="text-xs font-bold uppercase">
                          {t.addRule}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="col-span-1 sm:col-span-2">
                      <DiscountTierForm
                        onSave={saveNewDiscountTier}
                        onCancel={() => setIsAddingRule(false)}
                        t={t}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
                <i className="ph-fill ph-calendar-x"></i> {t.blockedDates}
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                />
                <Button onClick={addBlockedDate} className="text-xs">
                  {t.addDate}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localSettings.blockedDates.map((date: string) => (
                  <div
                    key={date}
                    className="bg-red-900/20 border border-red-500/30 text-red-200 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    <span>{date}</span>
                    <button
                      onClick={() => removeBlockedDate(date)}
                      className="hover:text-white"
                    >
                      <i className="ph-bold ph-x"></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Loyalty Program - Dropdown Icon Selector */}
            <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-blue-400 font-bold flex items-center gap-2">
                  <i className="ph-fill ph-medal"></i> {t.loyaltyProgram}
                </h3>
                <Toggle
                  label={t.enableLoyalty}
                  enabled={localSettings.loyaltyProgram.enabled}
                  onChange={(v: boolean) =>
                    setLocalSettings((s: AppSettings) => ({
                      ...s,
                      loyaltyProgram: { ...s.loyaltyProgram, enabled: v },
                    }))
                  }
                />
              </div>

              {localSettings.loyaltyProgram.enabled && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <Button onClick={addLoyaltyTier} className="text-xs">
                      {t.addNewTier}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {localSettings.loyaltyProgram.tiers.map(
                      (tier: LoyaltyTier, idx: number) => {
                        const selectedIconObj =
                          LOYALTY_ICONS.find((i) => i.icon === tier.icon) ||
                          LOYALTY_ICONS[0];
                        return (
                          <div
                            key={tier.id}
                            className="bg-slate-950/50 p-4 rounded-lg flex flex-col md:flex-row items-center gap-6 border border-slate-800 relative"
                          >
                            <div className="p-3 bg-slate-900 rounded-lg shrink-0 flex items-center justify-center w-20 h-20 relative">
                              {/* Dropdown Icon Selector */}
                              <button
                                onClick={() =>
                                  setOpenIconSelectorIndex(
                                    openIconSelectorIndex === idx ? null : idx
                                  )
                                }
                                className="w-full h-full flex flex-col items-center justify-center hover:bg-slate-800 rounded"
                              >
                                <i
                                  className={`ph-fill ${selectedIconObj.icon} text-3xl ${selectedIconObj.color} mb-1`}
                                ></i>
                                <i className="ph-bold ph-caret-down text-[10px] text-slate-500"></i>
                              </button>

                              {openIconSelectorIndex === idx && (
                                <div className="absolute top-full left-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2 z-50 grid grid-cols-5 gap-2 w-48 shadow-xl">
                                  {LOYALTY_ICONS.map((iconObj, iIdx) => (
                                    <button
                                      key={iIdx}
                                      onClick={() => {
                                        handleTierChange(
                                          idx,
                                          "icon",
                                          iconObj.icon
                                        );
                                        setOpenIconSelectorIndex(null);
                                      }}
                                      className={`flex items-center justify-center p-2 rounded hover:bg-slate-800 ${
                                        tier.icon === iconObj.icon
                                          ? "bg-slate-800 ring-1 ring-white"
                                          : ""
                                      }`}
                                    >
                                      <i
                                        className={`ph-fill ${iconObj.icon} text-lg ${iconObj.color}`}
                                      ></i>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 items-center">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 uppercase font-bold mb-1">
                                  {t.tierName}
                                </span>
                                <input
                                  type="text"
                                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                  value={tier.name}
                                  onChange={(e) =>
                                    handleTierChange(
                                      idx,
                                      "name",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs text-slate-500 uppercase font-bold mb-1">
                                  {t.reqBookings}
                                </label>
                                <input
                                  type="number"
                                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-white w-24"
                                  value={tier.bookingsRequired}
                                  onChange={(e) =>
                                    handleTierChange(
                                      idx,
                                      "bookingsRequired",
                                      parseInt(e.target.value)
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-6 w-full">
                                <Toggle
                                  label={tier.enabled ? "Active" : "Inactive"}
                                  enabled={tier.enabled}
                                  onChange={(v: boolean) =>
                                    handleTierChange(idx, "enabled", v)
                                  }
                                />
                                <button
                                  onClick={() => removeLoyaltyTier(idx)}
                                  className="text-red-500 hover:text-white p-2"
                                >
                                  <i className="ph-bold ph-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* --- Tournament Tab --- */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
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
                    min="1"
                    max="24"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-24"
                    value={newTourneyDuration}
                    onChange={(e) =>
                      setNewTourneyDuration(parseInt(e.target.value))
                    }
                  />
                  <span className="text-slate-400 text-sm">
                    {t.durationHours}
                  </span>
                </div>
              </div>

              {/* Prize Configuration */}
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
                        <span className="font-bold text-yellow-500">
                          #{p.rank}
                        </span>
                        <span>
                          {p.type === "free_slot"
                            ? "Free Slot"
                            : p.type === "discount_percent"
                            ? "Discount %"
                            : "Free Drink"}
                        </span>
                        <span className="bg-slate-800 px-2 rounded text-xs">
                          {p.value}
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
                      min="1"
                      className="bg-slate-800 border border-slate-700 rounded w-full px-2 py-1 text-white text-xs"
                      value={tempPrizeRank}
                      onChange={(e) =>
                        setTempPrizeRank(parseInt(e.target.value))
                      }
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
                      <option value="discount_percent">Discount %</option>
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
                        value={tempPrizeValue}
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
                        value={tempPrizeValue}
                        onChange={(e) =>
                          setTempPrizeValue(parseInt(e.target.value))
                        }
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
              </div>

              <Button
                onClick={createTournament}
                className="mt-6 w-full md:w-auto"
              >
                {t.saveTournament}
              </Button>
            </section>
            <section className="space-y-4">
              {localTournaments.map((tr) => (
                <div
                  key={tr.id}
                  className={`bg-slate-950/50 border ${
                    selectedTourneyId === tr.id
                      ? "border-amber-500"
                      : "border-slate-800"
                  } rounded-xl p-4 cursor-pointer`}
                  onClick={() => setSelectedTourneyId(tr.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-white">{tr.name}</h4>
                    <div className="flex gap-2">
                      <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        {tr.status.toUpperCase()}
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
                      {new Date(tr.start).toLocaleString()} ({tr.format})
                    </p>
                    {tr.prizes && tr.prizes.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {tr.prizes.map((p, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded border border-slate-700"
                          >
                            #{p.rank}: {p.value}{" "}
                            {p.type === "discount_percent" ? "%" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
            {selectedTourney && (
              <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-right-10">
                <h3 className="text-white font-bold mb-4 border-b border-slate-800 pb-2">
                  {selectedTourney.name} - Management
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase">
                        {t.participants} ({selectedTourney.participants.length})
                      </h4>
                      {selectedTourney.status === "open" && (
                        <Button
                          variant="ghost"
                          className="text-[10px] h-6 px-2 py-0 text-blue-400 hover:text-white"
                          onClick={() =>
                            autoSeedParticipants(selectedTourney.id)
                          }
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
                                min="1"
                                className="w-12 bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-center text-xs text-white"
                                value={p.seed || ""}
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
                            Distribute prizes to winners based on bracket
                            results.
                          </p>
                          <Button
                            onClick={() => distributePrizes(selectedTourney.id)}
                            className="w-full bg-emerald-500 border-emerald-600 hover:bg-emerald-400 text-slate-900"
                          >
                            {t.distributePrizes}
                          </Button>
                        </div>
                      )}
                    {selectedTourney.prizesDistributed && (
                      <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                        <i className="ph-fill ph-check-circle text-emerald-500 text-2xl mb-1"></i>
                        <p className="text-emerald-400 font-bold text-sm">
                          {t.prizesDistributed}
                        </p>
                      </div>
                    )}
                  </div>
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
        )}

        {/* ... (Users & Offers Tabs remain same) ... */}
        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">{t.allUsers}</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={selectAllUsers}
                  className="text-xs"
                >
                  {selectedUserIds.size === registeredUsers.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                {selectedUserIds.size > 0 && (
                  <Button
                    onClick={() => setShowBulkOfferModal(true)}
                    className="text-xs"
                  >
                    {t.bulkOffer} ({selectedUserIds.size})
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {registeredUsers.map((u: User) => {
                const badge = getUserLatestBadge(u.id);
                return (
                  <div
                    key={u.id}
                    className={`bg-slate-950/50 p-4 rounded-xl border ${
                      u.blocked
                        ? "border-red-900/50 bg-red-900/10"
                        : "border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 accent-amber-500"
                      />
                      <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <img
                          src={u.avatar}
                          className="w-10 h-10 rounded-full grayscale flex-shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white flex items-center gap-2 truncate">
                            {u.name}
                            {badge && (
                              <div
                                className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-amber-500"
                                title={badge.name}
                              >
                                <i className={`ph-fill ${badge.icon}`}></i>
                                <span className="uppercase font-bold hidden sm:inline">
                                  {badge.name}
                                </span>
                              </div>
                            )}
                            {u.blocked && (
                              <span className="text-[10px] bg-red-600 text-white px-2 rounded-full uppercase">
                                Blocked
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:ml-auto w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            {t.totalSpend}
                          </span>
                          <span className="text-lg font-bold text-emerald-400">
                            €{getUserTotalSpend(u.id).toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex">
                          <Button
                            variant="ghost"
                            className="justify-center py-2 px-3 text-xs w-full sm:w-auto text-blue-400 border border-blue-900/30 bg-blue-900/10"
                            onClick={() =>
                              setExpandedUserId(
                                expandedUserId === u.id ? null : u.id
                              )
                            }
                          >
                            {t.breakdown}
                          </Button>
                          <Button
                            variant="secondary"
                            className="justify-center py-2 px-3 text-xs w-full sm:w-auto"
                            onClick={() => setSelectedUserForOffer(u)}
                          >
                            {t.sendOffer}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Expansion */}
                    {expandedUserId === u.id && (
                      <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-1 gap-2 animate-in fade-in slide-in-from-top-2">
                        <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">
                          Booking Breakdown (Current Week)
                        </h5>
                        {getUserBreakdown(u.id).length > 0 ? (
                          <div className="grid grid-cols-4 gap-2 text-xs font-mono text-slate-400 bg-slate-900 p-2 rounded">
                            <span className="font-bold text-slate-500 uppercase">
                              Date
                            </span>
                            <span className="font-bold text-slate-500 uppercase text-center">
                              Slots
                            </span>
                            <span className="font-bold text-slate-500 uppercase text-right">
                              Sum
                            </span>
                            <span className="font-bold text-slate-500 uppercase text-right">
                              Status
                            </span>

                            {getUserBreakdown(u.id).map(
                              (item: any, idx: number) => (
                                <React.Fragment key={idx}>
                                  <span>{item.date}</span>
                                  <span className="text-center">
                                    {item.count}
                                  </span>
                                  <span className="text-right text-emerald-400">
                                    €{item.sum.toFixed(2)}
                                  </span>
                                  <span className="text-right">
                                    {item.discounts.length > 0 ? (
                                      <span className="text-amber-500 text-[10px]">
                                        {item.discountRules[0] || "Discounted"}
                                      </span>
                                    ) : (
                                      <span className="text-slate-600">-</span>
                                    )}
                                  </span>
                                </React.Fragment>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-600 italic">
                            No bookings found.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ... (Offers tab same) ... */}
        {activeTab === "offers" && (
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
              <i className="ph-fill ph-tag"></i> {t.createOffer} (Template)
            </h3>
            <OfferForm
              offerState={offerFormState}
              setOfferState={setOfferFormState}
              t={t}
            />
            <Button onClick={createOfferTemplate} className="w-full mb-8">
              {t.createOffer}
            </Button>
            <h3 className="text-white font-bold mb-4">
              {t.activeOffers} (Templates)
            </h3>
            <div className="space-y-2">
              {localSettings.specialOffers
                .filter((o) => o.isTemplate)
                .map((offer) => (
                  <div
                    key={offer.id}
                    className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center group"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-white">{offer.name}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(offer.startDate).toLocaleDateString()} -{" "}
                        {new Date(offer.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-emerald-400 font-bold text-sm">
                        {offer.type === "free_drink"
                          ? offer.rewardProduct
                          : offer.value}{" "}
                        {offer.type === "discount_percent" ? "%" : ""}
                      </span>
                      <Button
                        variant="secondary"
                        className="px-2 py-1 text-xs"
                        onClick={() => setViewingOfferId(offer.id)}
                      >
                        {t.viewRecipients}
                      </Button>
                      <button
                        onClick={() => deleteOffer(offer.id)}
                        className="text-red-500 hover:text-white p-2"
                      >
                        <i className="ph-bold ph-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Send User Offer Modal - SELECT TEMPLATE */}
      <Modal
        isOpen={!!selectedUserForOffer || showBulkOfferModal}
        onClose={() => {
          setSelectedUserForOffer(null);
          setShowBulkOfferModal(false);
        }}
        title={
          showBulkOfferModal
            ? `${t.bulkOffer} (${selectedUserIds.size} Users)`
            : `${t.sendOffer}: ${selectedUserForOffer?.name}`
        }
      >
        <div className="space-y-4">
          <label className="text-sm text-slate-400">{t.selectTemplate}</label>
          <select
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {localSettings.specialOffers
              .filter((o) => o.isTemplate)
              .map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type})
                </option>
              ))}
          </select>
          <Button
            onClick={sendTemplateToUser}
            className="w-full"
            disabled={!selectedTemplateId}
          >
            {t.sendOffer}
          </Button>
        </div>
      </Modal>

      {/* Recipient Management Modal */}
      <Modal
        isOpen={!!viewingOfferId}
        onClose={() => setViewingOfferId(null)}
        title={t.recipients}
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {viewingOfferId && getOfferRecipients(viewingOfferId).length > 0 ? (
            getOfferRecipients(viewingOfferId).map((offer) => {
              const recipientUser = registeredUsers.find(
                (u) => u.id === offer.targetUserId
              );
              return (
                <div
                  key={offer.id}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {recipientUser && (
                      <img
                        src={recipientUser.avatar}
                        className="w-8 h-8 rounded-full bg-slate-700"
                      />
                    )}
                    <div>
                      <div className="font-bold text-white text-sm">
                        {recipientUser ? recipientUser.name : "Unknown User"}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {offer.used ? (
                          <span className="text-amber-500">USED</span>
                        ) : (
                          <span className="text-emerald-400">ACTIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecipientOffer(offer.id)}
                    className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded transition-colors"
                    title={t.delete}
                  >
                    <i className="ph-bold ph-trash"></i>
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-center italic py-4">
              {t.noRecipients}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
