// src/features/bookings/BookingGrid.tsx
import React from "react";
import { formatDateISO } from "../../shared/utils/date";
import type {
  Appointment,
  Machine,
  AppSettings,
  Tournament,
  Language,
  User,
} from "../../shared/types/domain";
import { TRANSLATIONS, GRID_HOURS } from "@/src/shared/constants/app";

interface BookingGridProps {
  visibleDates: Array<{ date: Date; dayIndex: number }>;
  settings: AppSettings;
  appointments: Appointment[];
  tournaments: Tournament[];
  selectedMachineId: string;
  currentWeekStart: Date;
  selectedSlots: Array<{ dayIndex: number; hour: number }>;
  user: User | null;
  viewMode: "week" | "day";
  lang: Language;
  toggleSelection: (dayIndex: number, hour: number) => void;
  setCancelAppointmentId: (id: string) => void;
}

export function BookingGrid({
  visibleDates,
  settings,
  appointments,
  tournaments,
  selectedMachineId,
  currentWeekStart,
  selectedSlots,
  user,
  viewMode,
  lang,
  toggleSelection,
  setCancelAppointmentId,
}: BookingGridProps) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      <div className="overflow-x-auto max-h-[70vh]">
        <div
          className={`grid ${
            viewMode === "week"
              ? "min-w-[800px] grid-cols-[60px_repeat(7,1fr)]"
              : "w-full grid-cols-[60px_1fr]"
          } divide-x divide-slate-800`}
        >
          {/* Time column */}
          <div className="col-span-1 bg-slate-950 sticky left-0 z-30 shadow-[4px_0_12px_rgba(0,0,0,0.5)] border-r border-slate-800">
            <div className="h-14 border-b border-slate-800 bg-slate-950 sticky top-0 z-40" />
            {GRID_HOURS.map((h) => (
              <div
                key={h}
                className="h-16 border-b border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono bg-slate-950"
              >
                {h === 24 ? "00:00" : `${h}:00`}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {visibleDates.map(({ date, dayIndex }, idx) => {
            const dateStr = formatDateISO(date);
            const isBlocked = settings.blockedDates.includes(dateStr);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={idx}
                className={`col-span-1 ${
                  isBlocked ? "bg-red-950/20" : "bg-slate-900/50"
                }`}
              >
                {/* Day header */}
                <div
                  className={`h-14 border-b border-slate-800 flex flex-col items-center justify-center sticky top-0 z-20 backdrop-blur-md ${
                    isToday
                      ? "bg-amber-500/10 border-b-amber-500/50"
                      : "bg-slate-900/95"
                  } ${isBlocked ? "opacity-50" : ""}`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      isToday ? "text-amber-500" : "text-slate-500"
                    }`}
                  >
                    {t.days[dayIndex]}
                  </span>
                  <span
                    className={`text-lg font-black ${
                      isToday ? "text-white" : "text-slate-300"
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>

                {/* Hour cells */}
                {GRID_HOURS.map((hour) => {
                  const weekKey = formatDateISO(currentWeekStart);
                  const slotStart = new Date(date);
                  slotStart.setHours(hour, 0, 0, 0);
                  const slotEnd = new Date(date);
                  slotEnd.setHours(hour + 1, 0, 0, 0);

                  // Tournament check
                  const activeTournament = tournaments.find((tr) => {
                    const tStart = new Date(tr.start);
                    const tEnd = new Date(tr.end);
                    return slotStart <= tEnd && slotEnd >= tStart;
                  });

                  const existingApp = appointments.find(
                    (a) =>
                      a.weekStart.startsWith(weekKey) &&
                      new Date(a.weekStart).toDateString() ===
                        currentWeekStart.toDateString() &&
                      a.dayIndex === dayIndex &&
                      a.hour === hour &&
                      (a.machineId === selectedMachineId ||
                        (!a.machineId &&
                          selectedMachineId === settings.machines[0]?.id))
                  );

                  const workingHrs = settings.workingHours[dayIndex];
                  const isOpen =
                    workingHrs &&
                    hour >= workingHrs.start &&
                    hour < workingHrs.end;
                  const isPast = slotStart < new Date();
                  const maxAdvance = new Date();
                  maxAdvance.setDate(maxAdvance.getDate() + 7);
                  const isTooFar = slotStart > maxAdvance;

                  const isMyBooking = user && existingApp?.userId === user.id;
                  const isBooked = !!existingApp;
                  const isSelected = selectedSlots.some(
                    (s) => s.dayIndex === dayIndex && s.hour === hour
                  );

                  let isDiscounted = false;
                  let discountVal = 0;
                  if (isBooked && user?.role === "admin" && existingApp.price) {
                    if (existingApp.price < settings.basePrice) {
                      isDiscounted = true;
                      discountVal = Math.round(
                        (1 - existingApp.price / settings.basePrice) * 100
                      );
                    }
                  }

                  // Closed
                  if (!isOpen) {
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="h-16 border-b border-slate-800 bg-slate-950/80 flex items-center justify-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMzM0MTU1IiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=)] opacity-20" />
                      </div>
                    );
                  }

                  // Tournament
                  if (activeTournament) {
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="h-16 border-b border-slate-800 flex items-center justify-center bg-amber-900/30 overflow-hidden relative cursor-not-allowed"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-amber-500/10 w-full text-center py-1 -rotate-[10deg]">
                            <span className="text-[10px] uppercase font-black text-amber-500/60 tracking-widest">
                              TOURNAMENT
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Blocked
                  if (isBlocked) {
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="h-16 border-b border-slate-800 flex items-center justify-center bg-red-950/10 overflow-hidden relative"
                      >
                        {hour === 12 && (
                          <span className="text-[9px] font-bold text-red-500/50 -rotate-45 absolute whitespace-nowrap transform origin-center px-4">
                            {t.cafeClosed}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // Normal cell
                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`h-16 border-b border-slate-800 p-1 relative group ${
                        isMyBooking ? "z-20" : ""
                      }`}
                    >
                      {isMyBooking &&
                        appointments.some(
                          (a) =>
                            a.weekStart === weekKey &&
                            a.dayIndex === dayIndex &&
                            a.hour === hour + 1 &&
                            a.userId === user.id &&
                            a.machineId === selectedMachineId
                        ) && (
                          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1 h-2 bg-emerald-500/50 z-10" />
                        )}

                      <div className="relative w-full h-full">
                        <button
                          onClick={() =>
                            !isBooked &&
                            !isPast &&
                            !isTooFar &&
                            toggleSelection(dayIndex, hour)
                          }
                          disabled={
                            (isBooked && !isMyBooking) ||
                            (isPast && !isMyBooking) ||
                            isTooFar
                          }
                          className={`w-full h-full rounded flex flex-col items-center justify-center transition-all duration-100 relative ${
                            isMyBooking
                              ? "bg-emerald-900/30 border border-emerald-500/50 text-emerald-400"
                              : isSelected
                              ? "bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-[1.02] z-10 font-bold"
                              : isBooked
                              ? "bg-slate-800/50 cursor-not-allowed opacity-60"
                              : isPast
                              ? "bg-slate-900/50 opacity-40 cursor-not-allowed"
                              : isTooFar
                              ? "bg-slate-900/30 opacity-30 cursor-not-allowed"
                              : "hover:bg-slate-800 bg-slate-900/30 text-slate-600 hover:text-slate-300"
                          }`}
                        >
                          {isMyBooking ? (
                            <div className="flex flex-col items-center">
                              <i className="ph-bold ph-check text-lg" />
                            </div>
                          ) : isSelected ? (
                            <i className="ph-bold ph-plus" />
                          ) : isBooked ? (
                            user?.role === "admin" ? (
                              <div className="flex flex-col items-center justify-center leading-none relative w-full h-full">
                                <span className="text-[9px] font-bold text-white truncate max-w-[90%]">
                                  {existingApp.userName}
                                </span>
                                <span className="text-[8px] text-amber-500 mt-0.5">
                                  €{existingApp.price}
                                </span>
                                {isDiscounted && (
                                  <div className="absolute bottom-0.5 right-0.5 bg-emerald-500 text-slate-900 text-[8px] font-bold px-1 rounded-full flex items-center justify-center shadow-sm">
                                    -{discountVal}%
                                  </div>
                                )}
                              </div>
                            ) : (
                              <i className="ph-fill ph-lock-key text-xl text-slate-700" />
                            )
                          ) : isPast ? (
                            <span className="text-[10px] uppercase font-bold text-slate-700">
                              {t.expired}
                            </span>
                          ) : isTooFar ? (
                            <span className="text-[10px] uppercase font-bold text-slate-800">
                              {t.tooFar}
                            </span>
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 text-2xl font-light text-amber-500/50">
                              +
                            </span>
                          )}
                        </button>

                        {isMyBooking && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setCancelAppointmentId(existingApp!.id);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg z-50 hover:bg-red-500 hover:scale-110 transition-all cursor-pointer ring-2 ring-slate-900 pointer-events-auto"
                            title={t.cancel}
                          >
                            <i className="ph-bold ph-x text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
