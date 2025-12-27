import React from "react";
import { Button } from "../../../shared/ui/Button";
import type { User } from "../../../shared/types/domain";

type Props = {
  t: any;
  registeredUsers: User[];

  selectedUserIds: Set<string>;
  expandedUserId: string | null;

  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;

  toggleExpandedUser: (userId: string) => void;
  toggleBlockUser: (userId: string) => void;

  getUserTotalSpend: (userId: string) => number;
  getUserLatestBadge: (userId: string) => any;
  getUserBreakdown: (userId: string) => any[];

  onOpenOfferForUser: (user: User) => void;
  onOpenBulkOffer: () => void;
};

export const UsersTab: React.FC<Props> = ({
  t,
  registeredUsers,
  selectedUserIds,
  expandedUserId,
  toggleUserSelection,
  selectAllUsers,
  toggleExpandedUser,
  toggleBlockUser,
  getUserTotalSpend,
  getUserLatestBadge,
  getUserBreakdown,
  onOpenOfferForUser,
  onOpenBulkOffer,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">{t.allUsers}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={selectAllUsers} className="text-xs">
            {selectedUserIds.size === registeredUsers.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          {selectedUserIds.size > 0 && (
            <Button onClick={onOpenBulkOffer} className="text-xs">
              {t.bulkOffer} ({selectedUserIds.size})
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {registeredUsers.map((u) => {
          const badge = getUserLatestBadge(u.id);
          const isExpanded = expandedUserId === u.id;

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
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] text-amber-500">
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

                <div className="flex flex-col sm:items-end sm:ml-auto w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {t.totalSpend}
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    {getUserTotalSpend(u.id).toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex">
                  <Button
                    variant="ghost"
                    className="justify-center py-2 px-3 text-xs w-full sm:w-auto text-blue-400 border border-blue-900/30 bg-blue-900/10"
                    onClick={() => toggleExpandedUser(u.id)}
                  >
                    {t.breakdown}
                  </Button>
                  <Button
                    variant="secondary"
                    className="justify-center py-2 px-3 text-xs w-full sm:w-auto"
                    onClick={() => onOpenOfferForUser(u)}
                  >
                    {t.sendOffer}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="text-xs text-red-400"
                  onClick={() => toggleBlockUser(u.id)}
                >
                  {u.blocked ? t.userUnblocked : t.userBlocked}
                </Button>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-1 gap-2">
                  <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Booking Breakdown (Current Week)
                  </h5>

                  {getUserBreakdown(u.id).length === 0 ? (
                    <p className="text-xs text-slate-600 italic">
                      No bookings found.
                    </p>
                  ) : (
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

                      {getUserBreakdown(u.id).map((item: any, idx: number) => (
                        <React.Fragment key={idx}>
                          <span>{item.date}</span>
                          <span className="text-center">{item.count}</span>
                          <span className="text-right text-emerald-400">
                            {item.sum.toFixed(2)}
                          </span>
                          <span className="text-right">
                            {item.discounts.length > 0 ? (
                              <span className="text-amber-500 text-[10px]">
                                Discounted
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
