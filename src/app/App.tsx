// src/app/App.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import type { Language, LoyaltyTier } from "../shared/types/domain";
import { getMonday } from "../shared/utils/date";
import { TRANSLATIONS } from "../shared/constants/app";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useSettings } from "./hooks/useSettings";
import { useAppointments } from "./hooks/useAppointments";
import { useTournaments } from "./hooks/useTournaments";
import { useComputedValues } from "./hooks/useComputedValues";
import { usePricing } from "./hooks/usePricing";
import { useVisibleDates } from "./hooks/useVisibleDates";

// Components
import { Header } from "../features/layout/Header";
import { MachineSelector } from "../features/dashboard/MachineSelector";
import { PowerSessionCard } from "../features/dashboard/PowerSessionCard";
import { LoyaltyStatusCard } from "../features/dashboard/LoyaltyStatusCard";
import { ActiveTournamentCard } from "../features/dashboard/ActiveTournamentCard";
import { BookingControls } from "../features/bookings/BookingControls";
import { BookingGrid } from "../features/bookings/BookingGrid";
import { BookingFooter } from "../features/dashboard/BookingFooter";
import { Toast } from "../shared/ui/Toast";
import { ModalManager } from "./components/ModalManager";

export const App = () => {
  const [lang, setLang] = useState<Language>("hr");
  const [toast, setToast] = useState<any>(null);

  const {
    user,
    registeredUsers,
    login,
    logout,
    updateUser,
    saveRegisteredUsers,
  } = useAuth(lang, setLang, setToast);
  const { settings, saveSettings } = useSettings();
  const { appointments, createAppointments, cancelAppointment } =
    useAppointments(settings, saveSettings);
  const {
    tournaments,
    saveTournaments,
    activeTournaments,
    registerForTournament,
  } = useTournaments();

  const [currentWeekStart, setCurrentWeekStart] = useState(
    getMonday(new Date())
  );
  const [selectedSlots, setSelectedSlots] = useState<
    { dayIndex: number; hour: number }[]
  >([]);
  const [selectedMachineId, setSelectedMachineId] = useState<string>("");
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [dayOffset, setDayOffset] = useState(0);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState(false);
  const [isMyOffersOpen, setIsMyOffersOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSelectCouponOpen, setIsSelectCouponOpen] = useState(false);
  const [newBadgeModal, setNewBadgeModal] = useState<LoyaltyTier | null>(null);
  const [cancelAppointmentId, setCancelAppointmentId] = useState<string | null>(
    null
  );
  const [viewTournamentId, setViewTournamentId] = useState<string | null>(null);
  const [registerTeamName, setRegisterTeamName] = useState("");

  const t = TRANSLATIONS[lang];
  const prevBadgeCountRef = useRef(0);

  useEffect(() => {
    if (settings.machines.length > 0 && !selectedMachineId) {
      setSelectedMachineId(settings.machines[0].id);
    }
  }, [settings.machines, selectedMachineId]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode("day");
      const today = new Date();
      const day = today.getDay();
      const offset = day === 0 ? 6 : day - 1;
      setDayOffset(offset);
    }
  }, []);

  const {
    userTotalBookings,
    earnedBadges,
    myOffers,
    hasConsecutiveDiscount,
    nextBadge,
  } = useComputedValues(
    user,
    appointments,
    settings,
    currentWeekStart,
    selectedSlots
  );

  const totalPrice = usePricing(
    selectedSlots,
    selectedOfferId,
    myOffers,
    settings,
    currentWeekStart,
    user,
    appointments
  );

  const visibleDates = useVisibleDates(currentWeekStart, viewMode, dayOffset);

  useEffect(() => {
    if (
      user &&
      earnedBadges.length > prevBadgeCountRef.current &&
      prevBadgeCountRef.current > 0
    ) {
      setNewBadgeModal(earnedBadges[0]);
    }
    prevBadgeCountRef.current = earnedBadges.length;
  }, [earnedBadges, user]);

  const handleLogin = (
    role: "user" | "admin",
    provider: "google" | "email"
  ) => {
    if (login(role, provider)) setIsLoginOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSelectedSlots([]);
    setIsAdminOpen(false);
  };

  const toggleLanguage = () => {
    const newLang: Language = lang === "hr" ? "en" : "hr";
    setLang(newLang);
    if (user) updateUser({ ...user, language: newLang });
  };

  const handleReserve = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    createAppointments(
      selectedSlots,
      selectedMachineId,
      selectedOfferId,
      user,
      currentWeekStart,
      myOffers
    );
    setToast({
      show: true,
      msg: t.emailSent,
      desc: `${t.emailSentDesc} ${user.email}`,
    });
    setTimeout(() => setToast(null), 5000);
    setSelectedSlots([]);
    setSelectedOfferId("");
  };

  const handleCancelAppointment = () => {
    if (!cancelAppointmentId) return;
    const result = cancelAppointment(cancelAppointmentId);
    setToast({
      show: true,
      msg: result.success ? "Cancelled" : "Cancellation Failed",
      desc: result.success ? "Reservation cancelled" : result.error,
      variant: result.success ? "info" : "error",
    });
    setTimeout(() => setToast(null), 3000);
    setCancelAppointmentId(null);
  };

  const handleDateNavigation = (direction: -1 | 1) => {
    if (viewMode === "week") {
      const newDate = new Date(currentWeekStart);
      newDate.setDate(newDate.getDate() + direction * 7);
      setCurrentWeekStart(newDate);
      setSelectedSlots([]);
    } else {
      let newOffset = dayOffset + direction;
      if (newOffset > 6) {
        newOffset = 0;
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeekStart(newDate);
      } else if (newOffset < 0) {
        newOffset = 6;
        const newDate = new Date(currentWeekStart);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeekStart(newDate);
      }
      setDayOffset(newOffset);
      setSelectedSlots([]);
    }
  };

  const handleSetViewMode = (mode: "week" | "day") => {
    if (mode === "day") {
      const today = new Date();
      const currentWeekMonday = getMonday(today);
      if (
        currentWeekStart.toDateString() === currentWeekMonday.toDateString()
      ) {
        const day = today.getDay();
        const offset = day === 0 ? 6 : day - 1;
        setDayOffset(offset);
      } else {
        setDayOffset(0);
      }
    }
    setViewMode(mode);
  };

  const toggleSelection = (dayIndex: number, hour: number) => {
    const exists = selectedSlots.find(
      (s) => s.dayIndex === dayIndex && s.hour === hour
    );
    if (exists) setSelectedSlots(selectedSlots.filter((s) => s !== exists));
    else setSelectedSlots([...selectedSlots, { dayIndex, hour }]);
  };

  const handleRegisterForTournament = (tournamentId: string) => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    const success = registerForTournament(tournamentId, user, registerTeamName);
    if (success) {
      const isWithdraw = tournaments
        .find((t) => t.id === tournamentId)
        ?.participants.some((p) => p.userIds.includes(user.id));
      setToast({
        show: true,
        msg: isWithdraw ? "Withdrawn" : "Registered",
        desc: isWithdraw ? t.withdrawnSuccess : t.registeredSuccess,
        variant: isWithdraw ? "info" : "success",
      });
      setTimeout(() => setToast(null), 3000);
      setRegisterTeamName("");
    }
  };

  const handleUpdateUser = (updatedUser: any) => {
    updateUser(updatedUser);
    setToast({
      show: true,
      msg: "Profile Updated",
      desc: "Your details have been saved.",
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-32 font-sans relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      ></div>

      <Toast
        show={!!toast}
        msg={toast?.msg || ""}
        desc={toast?.desc || ""}
        variant={toast?.variant}
      />

      <ModalManager
        isLoginOpen={isLoginOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        isAdminOpen={isAdminOpen}
        settings={settings}
        appointments={appointments}
        tournaments={tournaments}
        registeredUsers={registeredUsers}
        currentWeekStart={currentWeekStart}
        onSaveSettings={saveSettings}
        onSaveTournaments={saveTournaments}
        onAdminClose={() => setIsAdminOpen(false)}
        setRegisteredUsers={saveRegisteredUsers}
        cancelAppointmentId={cancelAppointmentId}
        onCancelClose={() => setCancelAppointmentId(null)}
        onCancelConfirm={handleCancelAppointment}
        isHistoryOpen={isHistoryOpen}
        onHistoryClose={() => setIsHistoryOpen(false)}
        user={user}
        machines={settings.machines}
        onCancelAppointment={(id) => setCancelAppointmentId(id)}
        isProfileOpen={isProfileOpen}
        onProfileClose={() => setIsProfileOpen(false)}
        onUpdateUser={handleUpdateUser}
        earnedBadges={earnedBadges}
        myOffers={myOffers}
        isMyOffersOpen={isMyOffersOpen}
        onMyOffersClose={() => setIsMyOffersOpen(false)}
        newBadgeModal={newBadgeModal}
        onBadgeClose={() => setNewBadgeModal(null)}
        isTournamentsOpen={isTournamentsOpen}
        onTournamentsClose={() => {
          setIsTournamentsOpen(false);
          setViewTournamentId(null);
        }}
        viewTournamentId={viewTournamentId}
        onViewTournamentChange={setViewTournamentId}
        onRegisterForTournament={handleRegisterForTournament}
        registerTeamName={registerTeamName}
        onRegisterTeamNameChange={setRegisterTeamName}
        isSelectCouponOpen={isSelectCouponOpen}
        onSelectCouponClose={() => setIsSelectCouponOpen(false)}
        selectedOfferId={selectedOfferId}
        onSelectOffer={setSelectedOfferId}
        lang={lang}
        t={t}
        setToast={setToast}
      />

      <Header
        user={user}
        lang={lang}
        myOffers={myOffers}
        userTotalBookings={userTotalBookings}
        onTournamentsClick={() => setIsTournamentsOpen(true)}
        onToggleLanguage={toggleLanguage}
        onProfileClick={() => setIsProfileOpen(true)}
        onMyOffersClick={() => setIsMyOffersOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onHistoryClick={() => setIsHistoryOpen(true)}
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <MachineSelector
          machines={settings.machines}
          selectedMachineId={selectedMachineId}
          onSelectMachine={(id) => {
            setSelectedMachineId(id);
            setSelectedSlots([]);
          }}
          lang={lang}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <PowerSessionCard
            hasConsecutiveDiscount={hasConsecutiveDiscount}
            consecutiveDiscountTiers={settings.consecutiveDiscountTiers}
            lang={lang}
          />
          <LoyaltyStatusCard
            nextBadge={nextBadge}
            earnedBadges={earnedBadges}
            userTotalBookings={userTotalBookings}
            lang={lang}
          />
        </div>

        {activeTournaments.length > 0 && (
          <ActiveTournamentCard
            tournament={activeTournaments[0]}
            lang={lang}
            onViewTournament={() => {
              setIsTournamentsOpen(true);
              setViewTournamentId(activeTournaments[0].id);
            }}
          />
        )}

        <BookingControls
          currentWeekStart={currentWeekStart}
          viewMode={viewMode}
          dayOffset={dayOffset}
          visibleDates={visibleDates}
          lang={lang}
          onNavigate={handleDateNavigation}
          onViewModeChange={handleSetViewMode}
        />

        <BookingGrid
          visibleDates={visibleDates}
          settings={settings}
          appointments={appointments}
          tournaments={tournaments}
          selectedMachineId={selectedMachineId}
          currentWeekStart={currentWeekStart}
          selectedSlots={selectedSlots}
          user={user}
          viewMode={viewMode}
          lang={lang}
          toggleSelection={toggleSelection}
          setCancelAppointmentId={setCancelAppointmentId}
        />
      </main>

      <BookingFooter
        selectedSlots={selectedSlots}
        totalPrice={totalPrice}
        basePrice={settings.basePrice}
        selectedOfferId={selectedOfferId}
        settings={settings}
        lang={lang}
        onSelectCoupon={() => setIsSelectCouponOpen(true)}
        onClearSlots={() => setSelectedSlots([])}
        onReserve={handleReserve}
      />
    </div>
  );
};
