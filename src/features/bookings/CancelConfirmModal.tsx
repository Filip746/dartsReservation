// src/features/bookings/CancelConfirmModal.tsx
import React from "react";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Language } from "../../shared/types/domain";

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: Language;
}

export function CancelConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  lang,
}: CancelConfirmModalProps) {
  const t = TRANSLATIONS[lang];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.cancel}>
      <div className="space-y-4">
        <p className="text-slate-300">{t.cancelConfirmation}</p>
        <div className="flex gap-4">
          <Button variant="ghost" onClick={onClose} className="w-full">
            {t.noKeep}
          </Button>
          <Button variant="danger" onClick={onConfirm} className="w-full">
            {t.yesCancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
