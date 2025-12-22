export type Language = "hr" | "en";


export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  language?: Language;
  blocked?: boolean;
}


export interface Appointment {
  id: string;
  weekStart: string;
  dayIndex: number;
  hour: number;
  userId: string;
  userName: string;
  machineId: string;
  price?: number;
  offerId?: string;
  discountRule?: string; // Stored rule name for admin visibility
}


export interface SpecialOffer {
  id: string;
  name: string;
  type: "discount_percent" | "fixed_price" | "free_drink" | "free_slot";
  value: number;
  startDate: string;
  endDate: string;
  targetUserId?: string | null;
  conditionType?: "none" | "buy_x_slots";
  conditionValue?: number;
  rewardProduct?: string; // For drinks
  isTemplate?: boolean;
  used?: boolean; // New: Track if voucher is used
  parentTemplateId?: string; // Links instance to template
}


export interface TournamentParticipant {
  id: string;
  name: string;
  userIds: string[];
  seed?: number;
}


export interface TournamentMatch {
  id: string;
  round: number;
  matchIndex: number;
  p1Id: string | null;
  p2Id: string | null;
  winnerId: string | null;
  nextMatchId: string | null;
}


export interface TournamentPrize {
  rank: number;
  type: "free_slot" | "discount_percent" | "free_drink";
  value: number | string; // Updated to allow string for drink names
}


export interface Tournament {
  tournament: Tournament;
  id: string;
  name: string;
  start: string;
  end: string;
  format: "single" | "double";
  status: "open" | "active" | "completed";
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  prizes: TournamentPrize[]; // New: Prizes configuration
  prizesDistributed?: boolean; // Track if prizes have been sent
}


export interface LoyaltyTier {
  id: string;
  name: string;
  bookingsRequired: number;
  icon: string;
  color: string;
  enabled: boolean;
}


export interface WorkingHour {
  start: number;
  end: number;
}


export interface Machine {
  id: string;
  name: string;
}


export interface DiscountTier {
  threshold: number;
  discount: number; // Percent
}


export interface AppSettings {
  basePrice: number;
  currency: string;
  consecutiveDiscountTiers: DiscountTier[];
  loyaltyProgram: {
    enabled: boolean;
    tiers: LoyaltyTier[];
  };
  workingHours: {
    [key: number]: WorkingHour;
  };
  blockedDates: string[];
  machines: Machine[];
  specialOffers: SpecialOffer[];
}
