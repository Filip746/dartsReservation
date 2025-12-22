// src/app/components/ModalManager.tsx
import React from "react";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { LoginModal } from "../../features/auth/LoginModal";
import { CancelConfirmModal } from "../../features/bookings/CancelConfirmModal";
import { HistoryModal } from "../../features/bookings/HistoryModal";
import { MyOffersModal } from "../../features/profile/MyOffersModal";
import { BadgeModal } from "../../features/profile/BadgeModal";
import { UserProfileModal } from "../../features/profile/UserProfileModal";
import { AdminPanel } from "../../features/admin/AdminPanel";
import { TournamentBracket } from "../../features/tournaments/TournamentBracket";
import { TournamentList } from "../../features/tournaments/TournamentList";
import type {
  Language as DomainLanguage,
  LoyaltyTier,
  User,
  Tournament,
  SpecialOffer,
  AppSettings,
  Appointment,
  Machine,
} from "../../shared/types/domain";

interface ModalManagerProps {
  // Auth
  isLoginOpen: boolean;
  onLoginClose: () => void;
  onLogin: (role: "user" | "admin", provider: "google" | "email") => void;

  // Admin
  isAdminOpen: boolean;
  settings: AppSettings;
  appointments: Appointment[];
  tournaments: Tournament[];
  registeredUsers: User[];
  currentWeekStart: Date;
  onSaveSettings: (s: AppSettings) => void;
  onSaveTournaments: (t: Tournament[]) => void;
  onAdminClose: () => void;
  setRegisteredUsers: (u: User[]) => void;

  // Cancel
  cancelAppointmentId: string | null;
  onCancelClose: () => void;
  onCancelConfirm: () => void;

  // History
  isHistoryOpen: boolean;
  onHistoryClose: () => void;
  user: User | null;
  machines: Machine[];
  onCancelAppointment: (id: string) => void;

  // Profile
  isProfileOpen: boolean;
  onProfileClose: () => void;
  onUpdateUser: (u: User) => void;
  earnedBadges: LoyaltyTier[];
  myOffers: SpecialOffer[];

  // Offers
  isMyOffersOpen: boolean;
  onMyOffersClose: () => void;

  // Badge
  newBadgeModal: LoyaltyTier | null;
  onBadgeClose: () => void;

  // Tournaments
  isTournamentsOpen: boolean;
  onTournamentsClose: () => void;
  viewTournamentId: string | null;
  onViewTournamentChange: (id: string | null) => void;
  onRegisterForTournament: (id: string) => void;
  registerTeamName: string;
  onRegisterTeamNameChange: (name: string) => void;

  // Coupon
  isSelectCouponOpen: boolean;
  onSelectCouponClose: () => void;
  selectedOfferId: string;
  onSelectOffer: (id: string) => void;

  lang: DomainLanguage;
  t: any;
  setToast: (t: any) => void;
}

export function ModalManager(props: ModalManagerProps) {
  const viewTournament =
    props.tournaments.find((t) => t.id === props.viewTournamentId) || null;

  return (
    <>
      <LoginModal
        isOpen={props.isLoginOpen}
        onClose={props.onLoginClose}
        onLogin={props.onLogin}
        lang={props.lang}
      />

      <CancelConfirmModal
        isOpen={!!props.cancelAppointmentId}
        onClose={props.onCancelClose}
        onConfirm={props.onCancelConfirm}
        lang={props.lang}
      />

      {props.isAdminOpen && (
        <AdminPanel
          settings={props.settings}
          appointments={props.appointments}
          tournaments={props.tournaments}
          registeredUsers={props.registeredUsers}
          setRegisteredUsers={props.setRegisteredUsers}
          currentWeekStart={props.currentWeekStart}
          onSave={props.onSaveSettings}
          onSaveTournaments={props.onSaveTournaments}
          onClose={props.onAdminClose}
          lang={props.lang}
          setToast={props.setToast}
        />
      )}

      <HistoryModal
        isOpen={props.isHistoryOpen}
        onClose={props.onHistoryClose}
        user={props.user}
        appointments={props.appointments}
        machines={props.machines}
        onCancel={props.onCancelAppointment}
        lang={props.lang}
      />

      <MyOffersModal
        isOpen={props.isMyOffersOpen}
        onClose={props.onMyOffersClose}
        offers={props.myOffers}
        lang={props.lang}
      />

      <BadgeModal
        badge={props.newBadgeModal}
        onClose={props.onBadgeClose}
        lang={props.lang}
      />

      <UserProfileModal
        isOpen={props.isProfileOpen}
        onClose={props.onProfileClose}
        user={props.user}
        setUser={props.onUpdateUser}
        badges={props.earnedBadges}
        offers={props.myOffers}
        t={props.t}
      />

      <Modal
        isOpen={props.isTournamentsOpen}
        onClose={props.onTournamentsClose}
        title={props.t.tournaments}
        maxWidth="max-w-4xl"
      >
        {viewTournament ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <Button
                  variant="ghost"
                  onClick={() => props.onViewTournamentChange(null)}
                  className="!px-0 text-slate-400 text-xs mb-2"
                >
                  <i className="ph-bold ph-arrow-left"></i> Back
                </Button>
                <h3 className="text-2xl font-bold text-white">
                  {viewTournament.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {new Date(viewTournament.start).toLocaleString()} -{" "}
                  {viewTournament.format}
                </p>
              </div>
              {viewTournament.status === "open" && (
                <div className="flex flex-col gap-2">
                  {viewTournament.format === "double" &&
                    !viewTournament.participants.find((p) =>
                      p.userIds.includes(props.user?.id || "")
                    ) && (
                      <input
                        type="text"
                        placeholder={props.t.teamName}
                        className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
                        value={props.registerTeamName}
                        onChange={(e) =>
                          props.onRegisterTeamNameChange(e.target.value)
                        }
                      />
                    )}
                  <Button
                    onClick={() =>
                      props.onRegisterForTournament(viewTournament.id)
                    }
                    disabled={!props.user}
                    variant={
                      viewTournament.participants.find((p) =>
                        p.userIds.includes(props.user?.id || "")
                      )
                        ? "danger"
                        : "primary"
                    }
                  >
                    {viewTournament.participants.find((p) =>
                      p.userIds.includes(props.user?.id || "")
                    )
                      ? props.t.withdraw
                      : props.t.register}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                <i className="ph-fill ph-trophy"></i> {props.t.prizes}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {viewTournament.prizes && viewTournament.prizes.length > 0 ? (
                  viewTournament.prizes.map((p, i) => (
                    <div
                      key={i}
                      className="bg-slate-950/50 p-2 rounded-lg border border-slate-800 flex flex-col items-center text-center"
                    >
                      <div
                        className={`text-sm font-black ${
                          p.rank === 1
                            ? "text-yellow-400"
                            : p.rank === 2
                            ? "text-slate-300"
                            : "text-amber-600"
                        }`}
                      >
                        #{p.rank} Place
                      </div>
                      <div className="text-xs text-white mt-1">
                        {p.type === "free_drink"
                          ? p.value
                          : p.type === "discount_percent"
                          ? `${p.value}% Off`
                          : `${p.value} Free Slot(s)`}
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600 italic text-sm">
                    No prizes listed.
                  </span>
                )}
              </div>
            </div>

            {viewTournament.matches.length > 0 ? (
              <TournamentBracket
                tournament={viewTournament}
                onAdvance={() => {}}
                isAdmin={false}
                lang={props.lang}
              />
            ) : (
              <p className="text-slate-600 text-sm italic">
                Bracket not generated yet.
              </p>
            )}

            <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">
                {props.t.participants}
              </h4>
              <div className="flex flex-wrap gap-2">
                {viewTournament.participants.map((p) => (
                  <span
                    key={p.id}
                    className="text-sm bg-slate-800 text-slate-200 px-3 py-1 rounded-full"
                  >
                    {p.name}
                  </span>
                ))}
                {viewTournament.participants.length === 0 && (
                  <span className="text-slate-600 italic text-sm">
                    No participants yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <TournamentList
            tournaments={props.tournaments}
            onSelect={(t) => props.onViewTournamentChange(t.id)}
            lang={props.lang as DomainLanguage}
          />
        )}
      </Modal>

      <Modal
        isOpen={props.isSelectCouponOpen}
        onClose={props.onSelectCouponClose}
        title="Select Coupon"
      >
        <div className="space-y-4">
          {props.myOffers.length > 0 ? (
            props.myOffers.map((offer) => (
              <div
                key={offer.id}
                onClick={() => {
                  props.onSelectOffer(
                    offer.id === props.selectedOfferId ? "" : offer.id
                  );
                  props.onSelectCouponClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                  props.selectedOfferId === offer.id
                    ? "bg-emerald-900/30 border-emerald-500"
                    : "bg-slate-900 border-slate-700 hover:border-slate-500"
                }`}
              >
                <div>
                  <div className="font-bold text-white">{offer.name}</div>
                  <div className="text-xs text-slate-400">
                    {offer.type === "discount_percent" &&
                      `-${offer.value}% Discount`}
                    {offer.type === "free_slot" &&
                      `${offer.value} Free Slot(s)`}
                    {offer.type === "fixed_price" &&
                      `€${offer.value} Fixed Price`}
                    {offer.type === "free_drink" &&
                      `Free ${offer.rewardProduct}`}
                  </div>
                </div>
                {props.selectedOfferId === offer.id && (
                  <i className="ph-fill ph-check-circle text-emerald-500 text-xl"></i>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500 italic text-center">
              No active coupons available.
            </p>
          )}
          {props.selectedOfferId && (
            <Button
              variant="ghost"
              className="w-full text-red-400"
              onClick={() => {
                props.onSelectOffer("");
                props.onSelectCouponClose();
              }}
            >
              {props.t.removeCoupon}
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}
