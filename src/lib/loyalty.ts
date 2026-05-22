import type { LoyaltyTier } from "./accounts";

export interface TierConfig {
  minPoints: number;
  maxPoints: number | null;
  discount: number;
  color: string;
  label: string;
}

export const TIER_CONFIG: Record<LoyaltyTier, TierConfig> = {
  bronze: {
    minPoints: 0,
    maxPoints: 499,
    discount: 0,
    color: "#CD7F32",
    label: "Bronze",
  },
  silver: {
    minPoints: 500,
    maxPoints: 1499,
    discount: 5,
    color: "#C0C0C0",
    label: "Silver",
  },
  gold: {
    minPoints: 1500,
    maxPoints: 2999,
    discount: 10,
    color: "#FFD700",
    label: "Gold",
  },
  platinum: {
    minPoints: 3000,
    maxPoints: null,
    discount: 15,
    color: "#E5E4E2",
    label: "Platinum",
  },
};

export function getTierFromPoints(points: number): LoyaltyTier {
  if (points >= 3000) return "platinum";
  if (points >= 1500) return "gold";
  if (points >= 500) return "silver";
  return "bronze";
}

export function getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
  switch (currentTier) {
    case "bronze":
      return "silver";
    case "silver":
      return "gold";
    case "gold":
      return "platinum";
    case "platinum":
      return null;
  }
}

export function getPointsToNextTier(points: number, currentTier: LoyaltyTier): number {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 0;
  return Math.max(0, TIER_CONFIG[nextTier].minPoints - points);
}

export function getTierDiscount(tier: LoyaltyTier): number {
  return TIER_CONFIG[tier].discount;
}

// BUG: Uses Math.floor instead of Math.round for points calculation
// This means $29.50 earns 29 points instead of 30
export function calculatePointsEarned(subtotal: number): number {
  return Math.floor(subtotal);
}

export function applyLoyaltyDiscount(amount: number, tier: LoyaltyTier): number {
  const discount = getTierDiscount(tier);
  if (discount === 0) return amount;
  return amount * (1 - discount / 100);
}

// Points expiration tracking
export interface PointsTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  expiresAt: string;
  type: "earned" | "redeemed" | "expired";
}

// BUG: Uses >= for expiration check instead of >
// This means points expire ON the anniversary date, not after
export function isPointsExpired(earnDate: string): boolean {
  const earned = new Date(earnDate);
  const now = new Date();
  const expirationDate = new Date(earned);
  expirationDate.setMonth(expirationDate.getMonth() + 12);

  return now >= expirationDate;
}

export function getExpirationDate(earnDate: string): Date {
  const earned = new Date(earnDate);
  earned.setMonth(earned.getMonth() + 12);
  return earned;
}
