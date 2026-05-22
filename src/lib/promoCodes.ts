import type { PromoCode, AppliedPromo } from "@/types/promo";

export const PROMO_CODES: PromoCode[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% off your order",
  },
  {
    code: "SAVE5",
    type: "fixed",
    value: 5,
    minOrderAmount: 25,
    description: "$5 off orders over $25",
  },
  {
    code: "BIGORDER20",
    type: "percentage",
    value: 20,
    maxDiscount: 15,
    description: "20% off (max $15 discount)",
  },
  {
    code: "FREEDELIVERY",
    type: "free_delivery",
    value: 0, // Will be set to delivery cost when applied
    description: "Free delivery",
  },
  {
    code: "EXPIRED2024",
    type: "percentage",
    value: 15,
    expiresAt: "2024-12-31",
    description: "15% off (expired)",
  },
];

export interface PromoValidationResult {
  success: boolean;
  error?: string;
  appliedPromo?: AppliedPromo;
}

export function validatePromoCode(
  code: string,
  orderSubtotal: number,
  deliveryCost: number
): PromoValidationResult {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    return { success: false, error: "Please enter a promo code" };
  }

  const promo = PROMO_CODES.find((p) => p.code === normalizedCode);

  if (!promo) {
    return { success: false, error: "Invalid promo code" };
  }

  // Check expiration
  if (promo.expiresAt) {
    const expiryDate = new Date(promo.expiresAt);
    if (new Date() > expiryDate) {
      return {
        success: false,
        error: `This code expired on ${new Date(promo.expiresAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`,
      };
    }
  }

  // Check minimum order amount
  if (promo.minOrderAmount && orderSubtotal < promo.minOrderAmount) {
    return {
      success: false,
      error: `Minimum order $${promo.minOrderAmount} required (your order: $${orderSubtotal.toFixed(2)})`,
    };
  }

  // Calculate discount
  let discountAmount = 0;

  switch (promo.type) {
    case "percentage":
      discountAmount = orderSubtotal * (promo.value / 100);
      if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
        discountAmount = promo.maxDiscount;
      }
      break;
    case "fixed":
      discountAmount = promo.value;
      break;
    case "free_delivery":
      discountAmount = deliveryCost;
      break;
  }

  return {
    success: true,
    appliedPromo: {
      code: promo.code,
      type: promo.type,
      discountAmount,
      description: promo.description,
    },
  };
}
