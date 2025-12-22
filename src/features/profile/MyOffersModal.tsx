import { TRANSLATIONS } from "@/src/shared/constants/app";
import { SpecialOffer } from "@/src/shared/types/domain";
import { Modal } from "@/src/shared/ui/Modal";

// --- My Offers Modal ---
export const MyOffersModal = ({ isOpen, onClose, offers, lang }: any) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];
  // Filter out used offers
  const validOffers = offers.filter((o: SpecialOffer) => !o.used);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.myOffers}>
      <div className="space-y-4">
        {validOffers.length === 0 ? (
          <p className="text-slate-500 text-center italic">
            No active vouchers.
          </p>
        ) : (
          validOffers.map((offer: SpecialOffer) => (
            <div
              key={offer.id}
              className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-xl border border-slate-700 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <i className="ph-fill ph-ticket text-6xl text-white"></i>
              </div>
              <h4 className="font-bold text-amber-500 text-lg mb-1">
                {offer.name}
              </h4>
              <p className="text-slate-300 text-sm mb-2">
                {offer.type === "free_drink"
                  ? `${t.types.free_drink} (${offer.rewardProduct || "Any"})`
                  : offer.type === "discount_percent"
                  ? `${offer.value}% ${t.types.discount_percent}`
                  : offer.type === "free_slot"
                  ? `${offer.value}x ${t.types.free_slot}`
                  : ""}
              </p>
              {offer.conditionType === "buy_x_slots" && (
                <div className="inline-block bg-slate-950/50 px-2 py-1 rounded text-xs text-slate-400 border border-slate-700">
                  {t.condition}: Book {offer.conditionValue} slots
                </div>
              )}
              <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest flex justify-between items-center">
                <span>
                  Valid until {new Date(offer.endDate).toLocaleDateString()}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
