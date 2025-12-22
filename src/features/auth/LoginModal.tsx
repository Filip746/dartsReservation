// src/features/auth/LoginModal.tsx
import React from "react";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "../../shared/ui/Button";
import { TRANSLATIONS } from "../../shared/constants/app";
import type { Language } from "../../shared/types/domain";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (role: "user" | "admin", provider: "google" | "email") => void;
  lang: Language;
}

export function LoginModal({
  isOpen,
  onClose,
  onLogin,
  lang,
}: LoginModalProps) {
  const t = TRANSLATIONS[lang];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.login}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col gap-4">
        <Button
          onClick={() => onLogin("user", "google")}
          className="w-full justify-center bg-white text-slate-900 border-white hover:bg-slate-100"
        >
          <i className="ph-bold ph-google-logo text-xl"></i> Google
        </Button>
        <Button
          onClick={() => onLogin("user", "email")}
          variant="secondary"
          className="w-full justify-center"
        >
          <i className="ph-bold ph-envelope text-xl"></i> Email
        </Button>
        <Button
          onClick={() => onLogin("admin", "email")}
          variant="admin"
          className="w-full justify-center"
        >
          <i className="ph-bold ph-shield-check text-xl"></i> {t.adminLogin}
        </Button>
      </div>
    </Modal>
  );
}
