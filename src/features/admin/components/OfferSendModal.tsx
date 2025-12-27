import React from "react";
import { Modal } from "../../../shared/ui/Modal";
import { Button } from "../../../shared/ui/Button";
import type { SpecialOffer, User } from "../../../shared/types/domain";

type Props = {
  t: any;
  isOpen: boolean;
  onClose: () => void;

  selectedUserForOffer: User | null;
  selectedUserIds: Set<string>;

  templateOffers: SpecialOffer[];
  selectedTemplateId: string;
  setSelectedTemplateId: (v: string) => void;

  onSend: (targets: string[]) => void;
};

export const OfferSendModal: React.FC<Props> = ({
  t,
  isOpen,
  onClose,
  selectedUserForOffer,
  selectedUserIds,
  templateOffers,
  selectedTemplateId,
  setSelectedTemplateId,
  onSend,
}) => {
  const targets = selectedUserForOffer
    ? [selectedUserForOffer.id]
    : Array.from(selectedUserIds);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        selectedUserForOffer
          ? `${t.sendOffer} ${selectedUserForOffer.name}`
          : `${t.bulkOffer} (${targets.length} users)`
      }
    >
      <div className="space-y-4">
        <label className="text-sm text-slate-400">{t.selectTemplate}</label>
        <select
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white w-full"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          <option value="">-- Select --</option>
          {templateOffers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} ({o.type})
            </option>
          ))}
        </select>

        <Button
          onClick={() => onSend(targets)}
          className="w-full"
          disabled={!selectedTemplateId || targets.length === 0}
        >
          {t.sendOffer}
        </Button>
      </div>
    </Modal>
  );
};
