// src/features/layout/Header.tsx
import React from "react";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { User, Language, SpecialOffer } from "../../shared/types/domain";

interface HeaderProps {
  user: User | null;
  lang: Language;
  myOffers: SpecialOffer[];
  userTotalBookings: number;
  onTournamentsClick: () => void;
  onToggleLanguage: () => void;
  onProfileClick: () => void;
  onMyOffersClick: () => void;
  onAdminClick: () => void;
  onHistoryClick: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function Header({
  user,
  lang,
  myOffers,
  userTotalBookings,
  onTournamentsClick,
  onToggleLanguage,
  onProfileClick,
  onMyOffersClick,
  onAdminClick,
  onHistoryClick,
  onLogout,
  onLoginClick,
}: HeaderProps) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <i className="ph-fill ph-target text-2xl md:text-3xl text-slate-900"></i>
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-lg md:text-2xl font-black tracking-tighter text-white uppercase italic leading-tight">
              Train Pikado
              <span className="text-amber-500 text-sm md:text-2xl hidden sm:inline">
                .Booking
              </span>
            </h1>
            <p className="text-[9px] md:text-xs text-slate-500 tracking-widest uppercase hidden md:block">
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={onTournamentsClick}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600/20 to-amber-500/20 text-amber-500 p-2 md:px-3 md:py-1.5 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition-all"
          >
            <i className="ph-fill ph-trophy text-xl md:text-lg"></i>
            <span className="hidden sm:inline font-bold text-xs uppercase tracking-wide">
              {t.tournaments}
            </span>
          </button>
          <button
            onClick={onToggleLanguage}
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white border border-slate-700 rounded px-2 py-1"
          >
            <i className="ph-bold ph-globe"></i> {lang.toUpperCase()}
          </button>
          {user ? (
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex flex-col items-end hidden md:flex">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{user.name}</span>
                  {myOffers.length > 0 && (
                    <button
                      onClick={onMyOffersClick}
                      className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] animate-pulse"
                    >
                      {myOffers.length}
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {userTotalBookings} bookings
                </div>
              </div>
              <div
                className="relative group flex items-center gap-2 cursor-pointer"
                onClick={onProfileClick}
              >
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700 group-hover:border-amber-500 transition-colors object-cover shrink-0"
                />
              </div>
              <div className="flex items-center gap-1">
                {user.role === "admin" && (
                  <Button
                    variant="ghost"
                    className="!px-2 text-xl text-purple-400"
                    onClick={onAdminClick}
                    title="Admin Settings"
                  >
                    <i className="ph-bold ph-gear"></i>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="!px-2 text-xl"
                  onClick={onHistoryClick}
                  title={t.history}
                >
                  <i className="ph-bold ph-clock-counter-clockwise"></i>
                </Button>
                <Button
                  variant="ghost"
                  className="!px-2 text-xl"
                  onClick={onLogout}
                  title={t.logout}
                >
                  <i className="ph ph-sign-out"></i>
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={onLoginClick} className="text-sm">
              {t.login}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
