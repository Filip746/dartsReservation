// src/app/hooks/useSettings.ts
import { useState, useEffect } from "react";
import type { AppSettings } from "../../shared/types/domain";
import { DEFAULT_SETTINGS } from "../../shared/constants/app";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const storedSettings = localStorage.getItem("darts_settings");
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (!parsed.machines) parsed.machines = DEFAULT_SETTINGS.machines;
      if (!parsed.specialOffers) parsed.specialOffers = [];
      if (!parsed.basePrice) parsed.basePrice = 15;
      if (!parsed.consecutiveDiscountTiers)
        parsed.consecutiveDiscountTiers = DEFAULT_SETTINGS.consecutiveDiscountTiers;
      setSettings(parsed);
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem("darts_settings", JSON.stringify(newSettings));
  };

  return { settings, saveSettings };
}
