import React from "react";
import { Modal } from "../../../shared/ui/Modal";
import type { SpecialOffer, User } from "../../../shared/types/domain";

type Props = {
  t: any;
  isOpen: boolean;
  onClose: () => void;

  viewingOfferId: string | null;
  recipients: SpecialOffer[];

  resolveRecipientUser: (targetUserId: string | null) => User | null;
  deleteRecipientOffer: (offerId: string) => void;
};

export const OfferRecipientsModal: React.FC<Props> = ({
  t,
  isOpen,
  onClose,
  viewingOfferId,
  recipients,
  resolveRecipientUser,
  deleteRecipientOffer,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.recipients}>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {!viewingOfferId || recipients.length === 0 ? (
          <p className="text-slate-500 text-center italic py-4">
            {t.noRecipients}
          </p>
        ) : (
          recipients.map((offer) => {
            const user = resolveRecipientUser(offer.targetUserId);

            return (
              <div
                key={offer.id}
                className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {user && (
                    <img
                      src={user.avatar}
                      className="w-8 h-8 rounded-full bg-slate-700"
                    />
                  )}
                  <div>
                    <div className="font-bold text-white text-sm">
                      {user ? user.name : "Unknown User"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {offer.used ? (
                        <span className="text-amber-500">USED</span>
                      ) : (
                        <span className="text-emerald-400">ACTIVE</span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteRecipientOffer(offer.id)}
                  className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-2 rounded transition-colors"
                  title={t.delete}
                >
                  <i className="ph-bold ph-trash"></i>
                </button>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
