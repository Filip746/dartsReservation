import React from "react";
import { Button } from "../../../shared/ui/Button";
import { Toggle } from "../../../shared/ui/Toggle";
import { DiscountTierForm } from "../DiscountTierForm";
import { LOYALTY_ICONS } from "../../../shared/constants/app";
import type {
  AppSettings,
  DiscountTier,
  LoyaltyTier,
  Machine,
} from "../../../shared/types/domain";

type Props = {
  t: any;

  localSettings: AppSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<AppSettings>>;

  newMachineName: string;
  setNewMachineName: (v: string) => void;
  addMachine: () => void;
  removeMachine: (id: string) => void;

  newBlockedDate: string;
  setNewBlockedDate: (v: string) => void;
  addBlockedDate: () => void;
  removeBlockedDate: (dateStr: string) => void;

  isAddingRule: boolean;
  setIsAddingRule: (v: boolean) => void;
  editingRuleIndex: number | null;
  setEditingRuleIndex: (v: number | null) => void;

  saveNewDiscountTier: (tier: DiscountTier) => void;
  saveEditedDiscountTier: (tier: DiscountTier) => void;
  removeDiscountTier: (index: number) => void;

  openIconSelectorIndex: number | null;
  setOpenIconSelectorIndex: (v: number | null) => void;

  addLoyaltyTier: () => void;
  removeLoyaltyTier: (index: number) => void;
  handleTierChange: (index: number, field: string, value: any) => void;
};

export const SettingsTab: React.FC<Props> = ({
  t,
  localSettings,
  setLocalSettings,

  newMachineName,
  setNewMachineName,
  addMachine,
  removeMachine,

  newBlockedDate,
  setNewBlockedDate,
  addBlockedDate,
  removeBlockedDate,

  isAddingRule,
  setIsAddingRule,
  editingRuleIndex,
  setEditingRuleIndex,

  saveNewDiscountTier,
  saveEditedDiscountTier,
  removeDiscountTier,

  openIconSelectorIndex,
  setOpenIconSelectorIndex,

  addLoyaltyTier,
  removeLoyaltyTier,
  handleTierChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Base price */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <i className="ph-fill ph-coin"></i> {t.basePrice}
          </h3>
          <input
            type="number"
            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
            value={localSettings.basePrice}
            onChange={(e) =>
              setLocalSettings((s) => ({
                ...s,
                basePrice: Number(e.target.value),
              }))
            }
          />
        </section>

        {/* Machines */}
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
            <Button onClick={addMachine} className="text-xs whitespace-nowrap">
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

      {/* Consecutive discounts */}
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

      {/* Blocked dates */}
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

      {/* Loyalty program */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-blue-400 font-bold flex items-center gap-2">
            <i className="ph-fill ph-medal"></i> {t.loyaltyProgram}
          </h3>

          <Toggle
            label={t.enableLoyalty}
            enabled={localSettings.loyaltyProgram.enabled}
            onChange={(v: boolean) =>
              setLocalSettings((s) => ({
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
                                  handleTierChange(idx, "icon", iconObj.icon);
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
                              handleTierChange(idx, "name", e.target.value)
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
  );
};
