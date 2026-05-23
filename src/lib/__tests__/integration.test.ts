import { describe, it, expect } from "vitest";
import { calculateBilling } from "../billing";
import { validatePromoCode } from "../promoCodes";
import {
  calculatePointsEarned,
  getTierFromPoints,
  getPointsToNextTier,
  applyLoyaltyDiscount,
} from "../loyalty";
import { canRedeemReward, redeemReward, REWARDS_CATALOG } from "../rewards";
import { PRICING } from "../constants";

// ---------------------------------------------------------------------------
// billing + loyalty
// ---------------------------------------------------------------------------
describe("billing integrates loyalty discount", () => {
  it("applies no discount for bronze tier", () => {
    const result = calculateBilling({
      distanceKm: 5,
      isRaining: false,
      isWeekend: false,
      loyaltyTier: "bronze",
    });

    expect(result.total).toBe(PRICING.BASE_NEAR); // $10 — no discount
    expect(result.loyaltyDiscount).toBeUndefined();
  });

  it("applies 5% silver discount to near delivery", () => {
    const result = calculateBilling({
      distanceKm: 5,
      isRaining: false,
      isWeekend: false,
      loyaltyTier: "silver",
    });

    const expected = PRICING.BASE_NEAR * 0.95; // $9.50
    expect(result.total).toBeCloseTo(expected);
    expect(result.loyaltyDiscount).toBeCloseTo(PRICING.BASE_NEAR * 0.05);
  });

  it("applies 10% gold discount including rain surcharge", () => {
    const result = calculateBilling({
      distanceKm: 8,
      isRaining: true,
      isWeekend: false,
      loyaltyTier: "gold",
    });

    const base = PRICING.BASE_NEAR + PRICING.RAIN_SURCHARGE; // $20
    const expected = base * 0.9; // $18
    expect(result.total).toBeCloseTo(expected);
    expect(result.loyaltyDiscount).toBeCloseTo(base * 0.1);
  });

  it("applies 15% platinum discount to weekend flat rate", () => {
    const result = calculateBilling({
      distanceKm: 20,
      isRaining: false,
      isWeekend: true,
      loyaltyTier: "platinum",
    });

    const expected = PRICING.WEEKEND_FLAT * 0.85; // $42.50
    expect(result.total).toBeCloseTo(expected);
    expect(result.loyaltyDiscount).toBeCloseTo(PRICING.WEEKEND_FLAT * 0.15);
  });
});

// ---------------------------------------------------------------------------
// billing + promoCodes
// ---------------------------------------------------------------------------
describe("promoCodes integrates with billing delivery cost", () => {
  it("FREEDELIVERY discount equals the actual delivery cost calculated by billing", () => {
    const billing = calculateBilling({
      distanceKm: 15,
      isRaining: false,
      isWeekend: false,
      loyaltyTier: undefined,
    });

    const promo = validatePromoCode("FREEDELIVERY", 30, billing.total);

    expect(promo.success).toBe(true);
    expect(promo.appliedPromo?.discountAmount).toBeCloseTo(billing.total);
  });

  it("BIGORDER20 caps at $15 regardless of order size", () => {
    const billing = calculateBilling({
      distanceKm: 5,
      isRaining: false,
      isWeekend: false,
      loyaltyTier: undefined,
    });

    const orderSubtotal = 200; // 20% would be $40 > $15 cap
    const promo = validatePromoCode("BIGORDER20", orderSubtotal, billing.total);

    expect(promo.success).toBe(true);
    expect(promo.appliedPromo?.discountAmount).toBe(15);
  });

  it("SAVE5 is rejected when order subtotal is below minimum", () => {
    const billing = calculateBilling({
      distanceKm: 5,
      isRaining: false,
      isWeekend: false,
      loyaltyTier: undefined,
    });

    const promo = validatePromoCode("SAVE5", 10, billing.total); // min is $25

    expect(promo.success).toBe(false);
    expect(promo.error).toMatch(/minimum order/i);
  });
});

// ---------------------------------------------------------------------------
// loyalty points → tier → rewards redemption
// ---------------------------------------------------------------------------
describe("loyalty points integrate with rewards redemption", () => {
  it("earning points from multiple orders can push the tier to silver", () => {
    const orders = [50, 120, 80, 200, 100]; // subtotals
    const totalPoints = orders.reduce((sum, s) => sum + calculatePointsEarned(s), 0);

    expect(totalPoints).toBe(550); // Math.floor applied per order
    expect(getTierFromPoints(totalPoints)).toBe("silver");
  });

  it("silver tier member gets 5% discount applied via applyLoyaltyDiscount", () => {
    const orders = [120, 200, 200]; // 520 points → silver
    const totalPoints = orders.reduce((sum, s) => sum + calculatePointsEarned(s), 0);
    const tier = getTierFromPoints(totalPoints);

    const deliveryCost = PRICING.BASE_NEAR;
    const discounted = applyLoyaltyDiscount(deliveryCost, tier);

    expect(tier).toBe("silver");
    expect(discounted).toBeCloseTo(deliveryCost * 0.95);
  });

  it("redeeming a reward reduces points balance and may change tier", () => {
    const startingPoints = 1600; // gold tier
    const freeDelivery = REWARDS_CATALOG.find((r) => r.id === "free-delivery")!;

    const result = redeemReward(startingPoints, freeDelivery);

    expect(result.success).toBe(true);
    const newBalance = result.newPointsBalance!;
    expect(newBalance).toBe(startingPoints - freeDelivery.pointsCost); // 1300
    expect(getTierFromPoints(newBalance)).toBe("silver"); // dropped from gold
  });

  it("canRedeemReward blocks redemption when points are insufficient", () => {
    const points = 200; // bronze
    const tenOff = REWARDS_CATALOG.find((r) => r.id === "10-off")!; // costs 900

    const check = canRedeemReward(points, tenOff);

    expect(check.canRedeem).toBe(false);
    expect(check.reason).toMatch(/700 more points/);
  });

  it("accumulating enough points allows redeeming the free-pie reward", () => {
    const orders = [300, 400, 300, 250, 250]; // 1500 points → gold
    const totalPoints = orders.reduce((sum, s) => sum + calculatePointsEarned(s), 0);
    const freePie = REWARDS_CATALOG.find((r) => r.id === "free-pie")!; // costs 1500

    const check = canRedeemReward(totalPoints, freePie);
    const result = redeemReward(totalPoints, freePie);

    expect(check.canRedeem).toBe(true);
    expect(result.success).toBe(true);
    expect(result.newPointsBalance).toBe(0);
    expect(getTierFromPoints(result.newPointsBalance!)).toBe("bronze");
  });

  it("getPointsToNextTier reflects remaining gap after partial accumulation", () => {
    const points = calculatePointsEarned(750); // 750 → silver
    const tier = getTierFromPoints(points);
    const toNext = getPointsToNextTier(points, tier);

    expect(tier).toBe("silver");
    expect(toNext).toBe(750); // needs 1500 for gold
  });
});
