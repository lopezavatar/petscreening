import type { Product, CartItem } from "./product";
import type { AppliedPromo } from "./promo";

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
}

export interface BillingInput {
  distanceKm: number;
  isRaining: boolean;
  isWeekend: boolean;
  loyaltyTier?: "bronze" | "silver" | "gold" | "platinum";
}

export interface BillingLineItem {
  label: string;
  amount: number;
  applies: boolean;
}

export interface BillingResult {
  lineItems: BillingLineItem[];
  total: number;
  isWeekendFlat: boolean;
  loyaltyDiscount?: number;
}

export type OrderStatus = "pending" | "in_transit" | "delivered" | "cancelled";

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  address: string;
  displayAddress: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryInstructions?: string;
  distanceKm: number;
  billing: BillingResult;
  appliedPromo?: AppliedPromo;
  tip: number;
  isRaining: boolean;
  createdAt: string;
  status: OrderStatus;
  userId?: string;
  pointsEarned?: number;
}
