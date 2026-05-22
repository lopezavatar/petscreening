import { PRICING } from "./constants";
import { getTierDiscount } from "./loyalty";
import type { BillingInput, BillingResult, BillingLineItem } from "@/types/order";

export function calculateBilling(input: BillingInput): BillingResult {
  const { distanceKm, isRaining, isWeekend, loyaltyTier } = input;

  let baseDeliveryTotal: number;
  let lineItems: BillingLineItem[];

  if (isWeekend) {
    baseDeliveryTotal = PRICING.WEEKEND_FLAT;
    lineItems = [
      {
        label: "Weekend delivery (flat rate)",
        amount: PRICING.WEEKEND_FLAT,
        applies: true,
      },
      {
        label: `Distance: ${distanceKm.toFixed(1)} km`,
        amount: 0,
        applies: false,
      },
      {
        label: "Rain surcharge",
        amount: 0,
        applies: false,
      },
    ];
  } else {
    const isNear = distanceKm <= PRICING.DISTANCE_THRESHOLD_KM;
    const baseCost = isNear ? PRICING.BASE_NEAR : PRICING.BASE_FAR;
    const rainCost = isRaining ? PRICING.RAIN_SURCHARGE : 0;
    baseDeliveryTotal = baseCost + rainCost;

    lineItems = [
      {
        label: isNear
          ? `Base delivery (${distanceKm.toFixed(1)} km, within 10 km)`
          : `Long-range delivery (${distanceKm.toFixed(1)} km, over 10 km)`,
        amount: baseCost,
        applies: true,
      },
      {
        label: "Rain surcharge (drone waterproofing)",
        amount: isRaining ? PRICING.RAIN_SURCHARGE : 0,
        applies: isRaining,
      },
    ];
  }

  // Apply loyalty discount to delivery total
  // Loyalty discounts apply to both regular and weekend pricing
  let loyaltyDiscount = 0;
  let finalTotal = baseDeliveryTotal;

  if (loyaltyTier) {
    const discountPercent = getTierDiscount(loyaltyTier);
    if (discountPercent > 0) {
      loyaltyDiscount = baseDeliveryTotal * (discountPercent / 100);
      finalTotal = baseDeliveryTotal - loyaltyDiscount;

      lineItems.push({
        label: `${loyaltyTier.charAt(0).toUpperCase() + loyaltyTier.slice(1)} member discount (${discountPercent}%)`,
        amount: -loyaltyDiscount,
        applies: true,
      });
    }
  }

  return {
    lineItems,
    total: finalTotal,
    isWeekendFlat: isWeekend,
    loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
  };
}
