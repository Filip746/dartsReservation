// --- User Profile Modal ---
import React, { useState } from "react";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import type { User } from "../../shared/types/domain";

export const UserProfileModal = ({
  isOpen,
  onClose,
  user,
  setUser,
  badges,
  offers,
  t,
}: any) => {
  if (!isOpen || !user) return null;
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
  });

  const handleSave = () => {
    setUser({ ...user, ...formData });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.editProfile}>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img
              src={formData.avatar || user.avatar}
              className="w-24 h-24 rounded-full border-4 border-slate-800 shadow-xl object-cover shrink-0 bg-slate-700"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <i className="ph-bold ph-camera text-white text-2xl"></i>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                {t.fullName}
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none transition-colors"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                {t.email}
              </label>
              <input
                type="email"
                disabled
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-500 outline-none cursor-not-allowed"
                value={formData.email}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                {t.avatarUrl}
              </label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-amber-500 outline-none transition-colors"
                value={formData.avatar}
                onChange={(e) =>
                  setFormData({ ...formData, avatar: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <i className="ph-fill ph-medal text-amber-500"></i> {t.earnedBadges}
          </h4>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {badges.length > 0 ? (
              badges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1 min-w-[60px]"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <i
                      className={`ph-fill ${badge.icon} text-2xl ${badge.color}`}
                    ></i>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center leading-tight">
                    {t.tiers[badge.name] || badge.name}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-xs italic">
                No badges earned yet.
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6">
          <h4 className="text-sm font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <i className="ph-fill ph-ticket text-emerald-500"></i>{" "}
            {t.activeCoupons}
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {offers.length > 0 ? (
              offers.map((offer: any) => (
                <div
                  key={offer.id}
                  className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-white text-sm">
                      {offer.name}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {offer.type === "discount_percent"
                        ? `-${offer.value}%`
                        : offer.type}
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded uppercase">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-xs italic">
                No active coupons.
              </p>
            )}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-4">
          {t.saveProfile}
        </Button>
      </div>
    </Modal>
  );
};
