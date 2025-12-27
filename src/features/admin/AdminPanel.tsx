import React, { useMemo, useState } from "react";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type {
  Appointment,
  AppSettings,
  Language,
  Tournament,
  User,
} from "../../shared/types/domain";

// hooks
import { useAdminSettings } from "./hooks/useAdminSettings";
import { useAdminTournaments } from "./hooks/useAdminTournaments";
import { useAdminUsers } from "./hooks/useAdminUsers";
import { useAdminOffers } from "./hooks/useAdminOffers";

// tabs
import { SettingsTab } from "./components/SettingsTab";
import { TournamentsTab } from "./components/TournamentsTab";
import { UsersTab } from "./components/UsersTab";
import { OffersTab } from "./components/OffersTab";

// modals
import { OfferSendModal } from "./components/OfferSendModal";
import { OfferRecipientsModal } from "./components/OfferRecipientsModal";

interface AdminPanelProps {
  settings: AppSettings;
  appointments: Appointment[];
  tournaments: Tournament[];
  registeredUsers: User[];
  setRegisteredUsers: (users: User[]) => void;
  currentWeekStart: string | Date; // ← ostavio sam kao u originalu
  onSave: (settings: AppSettings) => void;
  onSaveTournaments: (tournaments: Tournament[]) => void;
  onClose: () => void;
  lang: Language;
  setToast: (toast: any) => void;
}

type TabKey = "settings" | "tournaments" | "users" | "offers";

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
  const [activeTab, setActiveTab] = useState<TabKey>("settings");
  const t = TRANSLATIONS[lang];

  // 1) SETTINGS (state koji se i stvarno sprema)
  const settingsState = useAdminSettings(settings, setToast, t);

  // 2) TOURNAMENTS (treba localSettings jer distributePrizes dodaje SpecialOffer u settings)
  const tournamentsState = useAdminTournaments(
    tournaments,
    onSaveTournaments,
    settingsState.localSettings,
    settingsState.setLocalSettings,
    onSave,
    setToast
  );

  // 3) USERS (čista users logika)
  const usersState = useAdminUsers(
    registeredUsers,
    setRegisteredUsers,
    appointments,
    settingsState.localSettings,
    setToast,
    t
  );

  // 4) OFFERS (čista offers logika)
  const offersState = useAdminOffers(
    settingsState.localSettings,
    settingsState.setLocalSettings,
    registeredUsers,
    setToast,
    t
  );

  const tabs: TabKey[] = useMemo(
    () => ["settings", "tournaments", "users", "offers"],
    []
  );

  // Save all (settings + tournaments) i zatvori
  const handleSaveAndClose = () => {
    onSave(settingsState.localSettings);
    onSaveTournaments(tournamentsState.localTournaments);
    onClose();
  };

  // Targets za OfferSendModal: single user ili bulk selekcija
  const offerTargets = usersState.selectedUserForOffer
    ? [usersState.selectedUserForOffer.id]
    : Array.from(usersState.selectedUserIds);

  const isOfferSendModalOpen =
    offersState.showBulkOfferModal || !!usersState.selectedUserForOffer;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      {/* HEADER */}
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
              <Button onClick={handleSaveAndClose} className="text-xs">
                {t.save}
              </Button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-8 pb-24">
        {activeTab === "settings" && (
          <SettingsTab
            t={t}
            localSettings={settingsState.localSettings}
            setLocalSettings={settingsState.setLocalSettings}
            newMachineName={settingsState.newMachineName}
            setNewMachineName={settingsState.setNewMachineName}
            addMachine={settingsState.addMachine}
            removeMachine={settingsState.removeMachine}
            newBlockedDate={settingsState.newBlockedDate}
            setNewBlockedDate={settingsState.setNewBlockedDate}
            addBlockedDate={settingsState.addBlockedDate}
            removeBlockedDate={settingsState.removeBlockedDate}
            isAddingRule={settingsState.isAddingRule}
            setIsAddingRule={settingsState.setIsAddingRule}
            editingRuleIndex={settingsState.editingRuleIndex}
            setEditingRuleIndex={settingsState.setEditingRuleIndex}
            saveNewDiscountTier={settingsState.saveNewDiscountTier}
            saveEditedDiscountTier={settingsState.saveEditedDiscountTier}
            removeDiscountTier={settingsState.removeDiscountTier}
            openIconSelectorIndex={settingsState.openIconSelectorIndex}
            setOpenIconSelectorIndex={settingsState.setOpenIconSelectorIndex}
            addLoyaltyTier={settingsState.addLoyaltyTier}
            removeLoyaltyTier={settingsState.removeLoyaltyTier}
            handleTierChange={settingsState.handleTierChange}
          />
        )}

        {activeTab === "tournaments" && (
          <TournamentsTab
            t={t}
            lang={lang}
            localTournaments={tournamentsState.localTournaments}
            selectedTourneyId={tournamentsState.selectedTourneyId}
            setSelectedTourneyId={tournamentsState.setSelectedTourneyId}
            selectedTourney={tournamentsState.selectedTourney}
            newTourneyName={tournamentsState.newTourneyName}
            setNewTourneyName={tournamentsState.setNewTourneyName}
            newTourneyStart={tournamentsState.newTourneyStart}
            setNewTourneyStart={tournamentsState.setNewTourneyStart}
            newTourneyDuration={tournamentsState.newTourneyDuration}
            setNewTourneyDuration={tournamentsState.setNewTourneyDuration}
            newTourneyFormat={tournamentsState.newTourneyFormat}
            setNewTourneyFormat={tournamentsState.setNewTourneyFormat}
            newTourneyPrizes={tournamentsState.newTourneyPrizes}
            tempPrizeRank={tournamentsState.tempPrizeRank}
            setTempPrizeRank={tournamentsState.setTempPrizeRank}
            tempPrizeType={tournamentsState.tempPrizeType}
            setTempPrizeType={tournamentsState.setTempPrizeType}
            tempPrizeValue={tournamentsState.tempPrizeValue}
            setTempPrizeValue={tournamentsState.setTempPrizeValue}
            addTournamentPrize={tournamentsState.addTournamentPrize}
            removeTournamentPrize={tournamentsState.removeTournamentPrize}
            createTournament={tournamentsState.createTournament}
            deleteTournament={tournamentsState.deleteTournament}
            startTournament={tournamentsState.startTournament}
            updateParticipantSeed={tournamentsState.updateParticipantSeed}
            autoSeedParticipants={tournamentsState.autoSeedParticipants}
            advanceMatch={tournamentsState.advanceMatch}
            distributePrizes={tournamentsState.distributePrizes}
          />
        )}

        {activeTab === "users" && (
          <UsersTab
            t={t}
            registeredUsers={registeredUsers}
            selectedUserIds={usersState.selectedUserIds}
            expandedUserId={usersState.expandedUserId}
            toggleUserSelection={usersState.toggleUserSelection}
            selectAllUsers={usersState.selectAllUsers}
            toggleExpandedUser={usersState.toggleExpandedUser}
            toggleBlockUser={usersState.toggleBlockUser}
            getUserTotalSpend={usersState.getUserTotalSpend}
            getUserLatestBadge={usersState.getUserLatestBadge}
            getUserBreakdown={usersState.getUserBreakdown}
            onOpenOfferForUser={(u) => usersState.openOfferForUser(u)}
            onOpenBulkOffer={() => offersState.setShowBulkOfferModal(true)}
          />
        )}

        {activeTab === "offers" && (
          <OffersTab
            t={t}
            offerFormState={offersState.offerFormState}
            setOfferFormState={offersState.setOfferFormState}
            templateOffers={offersState.templateOffers}
            createOfferTemplate={offersState.createOfferTemplate}
            deleteOffer={offersState.deleteOffer}
            setViewingOfferId={offersState.setViewingOfferId}
          />
        )}
      </div>

      {/* MODAL: send offer */}
      <OfferSendModal
        t={t}
        isOpen={isOfferSendModalOpen}
        onClose={() => {
          offersState.setShowBulkOfferModal(false);
          usersState.closeOfferForUser();
          // namjerno ne čistim selectedUserIds ovdje; to radiš ručno kad želiš
        }}
        selectedUserForOffer={usersState.selectedUserForOffer}
        selectedUserIds={usersState.selectedUserIds}
        templateOffers={offersState.templateOffers}
        selectedTemplateId={offersState.selectedTemplateId}
        setSelectedTemplateId={offersState.setSelectedTemplateId}
        onSend={(targets) => {
          offersState.sendTemplateToTargets(targets);
          usersState.closeOfferForUser();
          // ako je bio bulk modal, korisno je očistiti selekciju
          usersState.clearSelection();
        }}
      />

      {/* MODAL: recipients */}
      <OfferRecipientsModal
        t={t}
        isOpen={!!offersState.viewingOfferId}
        onClose={() => offersState.setViewingOfferId(null)}
        viewingOfferId={offersState.viewingOfferId}
        recipients={offersState.recipientsForViewingOffer}
        resolveRecipientUser={offersState.resolveRecipientUser}
        deleteRecipientOffer={offersState.deleteRecipientOffer}
      />
    </div>
  );
};
