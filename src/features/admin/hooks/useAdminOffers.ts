import { useCallback, useMemo, useState, Dispatch, SetStateAction  } from "react";
import type { AppSettings, SpecialOffer, User } from "../../../shared/types/domain";
import { DRINK_MENU } from "../../../shared/constants/app";

type ToastFn = (toast: any) => void;

type OfferFormState = {
  name: string;
  type: string; // "discount_percent" | "free_slot" | "free_drink" ...
  value: number;
  startDate: string;
  endDate: string;
  conditionType: string;
  conditionValue: number;
  rewardProduct: string;
};

export const useAdminOffers = (
  localSettings: AppSettings,
  setLocalSettings: Dispatch<SetStateAction<AppSettings>>,
  registeredUsers: User[],
  setToast: ToastFn,
  t: any
) => {
  const [offerFormState, setOfferFormState] = useState<OfferFormState>({
    name: "",
    type: "discount_percent",
    value: 20,
    startDate: "",
    endDate: "",
    conditionType: "none",
    conditionValue: 0,
    rewardProduct: DRINK_MENU[0],
  });

  // modali / izbor
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showBulkOfferModal, setShowBulkOfferModal] = useState(false);
  const [viewingOfferId, setViewingOfferId] = useState<string | null>(null);

  const templateOffers = useMemo(
    () => localSettings.specialOffers.filter((o) => o.isTemplate),
    [localSettings.specialOffers]
  );

  const getOfferRecipients = useCallback(
    (templateId: string) => localSettings.specialOffers.filter((o) => o.parentTemplateId === templateId),
    [localSettings.specialOffers]
  );

  const createOfferTemplate = useCallback(() => {
    if (!offerFormState.name) return;

    const start = offerFormState.startDate || new Date().toISOString();
    const end =
      offerFormState.endDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newOffer: SpecialOffer = {
      id: `offer-${Date.now()}`,
      name: offerFormState.name,
      type: offerFormState.type as any,
      value: offerFormState.value,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      targetUserId: null,
      conditionType: offerFormState.conditionType as any,
      conditionValue: offerFormState.conditionValue,
      rewardProduct: offerFormState.type === "free_drink" ? offerFormState.rewardProduct : undefined,
      isTemplate: true,
    };

    setLocalSettings((s) => ({
      ...s,
      specialOffers: [...s.specialOffers, newOffer],
    }));

    setOfferFormState({
      name: "",
      type: "discount_percent",
      value: 20,
      startDate: "",
      endDate: "",
      conditionType: "none",
      conditionValue: 0,
      rewardProduct: DRINK_MENU[0],
    });

    setToast({
      show: true,
      msg: "Offer Template Created",
      desc: "Available for assignment in Users tab.",
      variant: "success",
    });
    setTimeout(() => setToast(null), 3000);
  }, [offerFormState, setLocalSettings, setToast]);

  // Slanje template-a: targets dolaze izvana (od Users hooka): single user ili bulk IDs
  const sendTemplateToTargets = useCallback(
    (targets: string[]) => {
      if (!selectedTemplateId) return;
      const template = localSettings.specialOffers.find((o) => o.id === selectedTemplateId);
      if (!template) return;

      const newOffers: SpecialOffer[] = targets.map((uid) => ({
        ...template,
        id: `offer-${Date.now()}-${uid}`,
        targetUserId: uid,
        isTemplate: false,
        used: false,
        parentTemplateId: template.id,
      }));

      setLocalSettings((s) => ({
        ...s,
        specialOffers: [...s.specialOffers, ...newOffers],
      }));

      setSelectedTemplateId("");
      setShowBulkOfferModal(false);

      setToast({
        show: true,
        msg: t.offerSent,
        desc: `Sent to ${targets.length} user(s)`,
        variant: "success",
      });
      setTimeout(() => setToast(null), 3000);
    },
    [selectedTemplateId, localSettings.specialOffers, setLocalSettings, setToast, t.offerSent]
  );

  const deleteOffer = useCallback((id: string) => {
    setLocalSettings((s) => ({
      ...s,
      specialOffers: s.specialOffers.filter((o) => o.id !== id),
    }));
  }, [setLocalSettings]);

  const deleteRecipientOffer = useCallback((offerId: string) => {
    setLocalSettings((s) => ({
      ...s,
      specialOffers: s.specialOffers.filter((o) => o.id !== offerId),
    }));
  }, [setLocalSettings]);

  // helper za modal recipients
  const recipientsForViewingOffer = useMemo(() => {
    if (!viewingOfferId) return [];
    return getOfferRecipients(viewingOfferId);
  }, [viewingOfferId, getOfferRecipients]);

  const resolveRecipientUser = useCallback(
    (targetUserId: string | null) => registeredUsers.find((u) => u.id === targetUserId) ?? null,
    [registeredUsers]
  );

  return {
    offerFormState,
    setOfferFormState,

    templateOffers,
    selectedTemplateId,
    setSelectedTemplateId,

    showBulkOfferModal,
    setShowBulkOfferModal,

    viewingOfferId,
    setViewingOfferId,

    createOfferTemplate,
    sendTemplateToTargets,

    deleteOffer,
    deleteRecipientOffer,

    getOfferRecipients,
    recipientsForViewingOffer,
    resolveRecipientUser,
  };
};
