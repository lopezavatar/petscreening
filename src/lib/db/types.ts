import type { LoyaltyTier } from "../accounts";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import type { PromoCode } from "@/types/promo";

export interface DbUser {
  id: string;
  email: string;
  password: string;
  name: string;
  tier: LoyaltyTier;
  points: number;
  joinedAt: string;
}

export interface DbProduct extends Product {}

export interface DbOrder extends Order {}

export interface DbPromoCode extends PromoCode {
  usageCount: number;
  maxUses?: number;
  active: boolean;
}

export interface WeatherOverride {
  forceRain: boolean | null; // null = use computed rain, true/false = override
  updatedAt: string;
}

export interface Database {
  users: DbUser[];
  products: DbProduct[];
  orders: DbOrder[];
  promoCodes: DbPromoCode[];
  weather: WeatherOverride;
  seededAt: string;
}

export type SafeDbUser = Omit<DbUser, "password">;

export function toSafeDbUser(user: DbUser): SafeDbUser {
  const { password, ...safeUser } = user;
  return safeUser;
}
