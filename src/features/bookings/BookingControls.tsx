// src/features/bookings/BookingControls.tsx
import React from "react";
import { TRANSLATIONS } from "../../shared/constants/app";
import { formatDate } from "../../shared/utils/date";
import type { Language } from "../../shared/types/domain";

interface BookingControlsProps {
  currentWeekStart: Date;
  viewMode: "week" | "day";
  dayOffset: number;
  visibleDates: Array<{ date: Date; dayIndex: number }>;
  lang: Language;
  onNavigate: (direction: -1 | 1) => void;
  onViewModeChange: (mode: "week" | "day") => void;
}

export function BookingControls({
  currentWeekStart,
  viewMode,
  dayOffset,
  visibleDates,
  lang,
  onNavigate,
  onViewModeChange,
}: BookingControlsProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
      {/* Date Navigator */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-sm w-full md:w-auto justify-between">
        <button
          onClick={() => onNavigate(-1)}
          className="p-3 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
        >
          <i className="ph-bold ph-caret-left"></i>
        </button>
        <div className="px-4 text-center min-w-[180px]">
          <span className="text-xs text-slate-500 block font-bold uppercase tracking-wider mb-1">
            {viewMode === "day" ? t.dayOf : t.weekOf}
          </span>
          <span className="font-bold text-lg text-white">
            {viewMode === "day"
              ? visibleDates[0]?.date.toLocaleDateString(
                  lang === "hr" ? "hr-HR" : "en-US",
                  { day: "numeric", month: "long" }
                )
              : `${formatDate(currentWeekStart, lang)} - ${formatDate(
                  new Date(
                    currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
                  ),
                  lang
                )}`}
          </span>
        </div>
        <button
          onClick={() => onNavigate(1)}
          className="p-3 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
        >
          <i className="ph-bold ph-caret-right"></i>
        </button>
      </div>

      <div className="flex gap-4 w-full md:w-auto items-center justify-between md:justify-end">
        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onViewModeChange("week")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              viewMode === "week"
                ? "bg-amber-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.viewMode.week}
          </button>
          <button
            onClick={() => onViewModeChange("day")}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
              viewMode === "day"
                ? "bg-amber-500 text-slate-900"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.viewMode.day}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-2 sm:gap-6 text-xs sm:text-sm bg-slate-900 px-4 py-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-600"></div>
            <span className="text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
              {t.free}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amber-500 border border-amber-600"></div>
            <span className="text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
              {t.selected}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-900 border border-emerald-500"></div>
            <span className="text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
              {t.yours}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
