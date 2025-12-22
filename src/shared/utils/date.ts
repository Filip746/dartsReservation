// src/shared/utils/date.ts
import type { Language } from "../types/domain";

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
  date.setHours(0, 0, 0, 0);
  date.setDate(diff);
  return new Date(date);
}

export function formatDate(d: Date, lang: Language): string {
  return d.toLocaleDateString(lang === "hr" ? "hr-HR" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
