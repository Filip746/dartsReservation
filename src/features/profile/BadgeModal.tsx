import { TRANSLATIONS } from "@/src/shared/constants/app";
import { Button } from "@/src/shared/ui/Button";
import { Modal } from "@/src/shared/ui/Modal";

// --- New Badge Modal ---
export const BadgeModal = ({ badge, onClose, lang }: any) => {
  if (!badge) return null;
  const t = TRANSLATIONS[lang];
  const badgeName = t.tiers[badge.name as keyof typeof t.tiers] || badge.name;
  return (
    <Modal isOpen={!!badge} onClose={onClose} title={t.congrats}>
      <div className="text-center flex flex-col items-center p-6">
        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mb-6 animate-bounce">
          <i className={`ph-fill ${badge.icon} text-6xl ${badge.color}`}></i>
        </div>
        <h3 className="text-2xl font-black text-white mb-2 uppercase italic">
          {t.newBadge}
        </h3>
        <p className="text-slate-400 mb-6">{t.congratsBadge}</p>
        <div className="text-xl font-bold text-amber-500 mb-8">{badgeName}</div>
        <Button onClick={onClose} className="w-full">
          Awesome!
        </Button>
      </div>
    </Modal>
  );
};
