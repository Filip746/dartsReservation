import React from "react";
import { Button } from "../../../shared/ui/Button";
import { OfferForm } from "../OfferForm";
import type { SpecialOffer } from "../../../shared/types/domain";

type Props = {
  t: any;

  offerFormState: any;
  setOfferFormState: (s: any) => void;

  templateOffers: SpecialOffer[];

  createOfferTemplate: () => void;
  deleteOffer: (id: string) => void;

  setViewingOfferId: (id: string | null) => void;
};

export const OffersTab: React.FC<Props> = ({
  t,
  offerFormState,
  setOfferFormState,
  templateOffers,
  createOfferTemplate,
  deleteOffer,
  setViewingOfferId,
}) => {
  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
          <i className="ph-fill ph-tag"></i> {t.createOffer} Template
        </h3>

        <OfferForm
          offerState={offerFormState}
          setOfferState={setOfferFormState}
          t={t}
        />

        <Button onClick={createOfferTemplate} className="w-full mb-8">
          {t.createOffer}
        </Button>

        <h3 className="text-white font-bold mb-4">
          {t.activeOffers} Templates
        </h3>

        <div className="space-y-2">
          {templateOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center group"
            >
              <div className="flex-1">
                <div className="font-bold text-white">{offer.name}</div>
                <div className="text-xs text-slate-500">
                  {new Date(offer.startDate).toLocaleDateString()} -{" "}
                  {new Date(offer.endDate).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-bold text-sm">
                  {offer.type === "free_drink"
                    ? offer.rewardProduct
                    : offer.value}
                </span>

                <Button
                  variant="secondary"
                  className="px-2 py-1 text-xs"
                  onClick={() => setViewingOfferId(offer.id)}
                >
                  {t.viewRecipients}
                </Button>

                <button
                  onClick={() => deleteOffer(offer.id)}
                  className="text-red-500 hover:text-white p-2"
                  title={t.delete}
                >
                  <i className="ph-bold ph-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
