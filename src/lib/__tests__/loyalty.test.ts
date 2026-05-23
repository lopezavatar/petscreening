import { describe, it, expect } from "vitest";
import {
  getTierFromPoints,
  getNextTier,
  getPointsToNextTier,
  getTierDiscount,
} from "../loyalty";
import { generateOrderId } from "../orderReference";

describe("loyalty", () => {
  it("getTierFromPoints returns the correct tier for each threshold", () => {
    expect(getTierFromPoints(0)).toBe("bronze");
    expect(getTierFromPoints(499)).toBe("bronze");
    expect(getTierFromPoints(500)).toBe("silver");
    expect(getTierFromPoints(1500)).toBe("gold");
    expect(getTierFromPoints(3000)).toBe("platinum");
  });

  it("getNextTier returns the next tier and null for platinum", () => {
    expect(getNextTier("bronze")).toBe("silver");
    expect(getNextTier("silver")).toBe("gold");
    expect(getNextTier("gold")).toBe("platinum");
    expect(getNextTier("platinum")).toBeNull();
  });

  it("getPointsToNextTier computes remaining points correctly", () => {
    expect(getPointsToNextTier(100, "bronze")).toBe(400);
    expect(getPointsToNextTier(500, "silver")).toBe(1000);
    expect(getPointsToNextTier(3500, "platinum")).toBe(0);
  });

  it("getTierDiscount returns the configured discount per tier", () => {
    expect(getTierDiscount("bronze")).toBe(0);
    expect(getTierDiscount("silver")).toBe(5);
    expect(getTierDiscount("gold")).toBe(10);
    expect(getTierDiscount("platinum")).toBe(15);
  });
});

describe("orderReference", () => {
  it("generateOrderId returns an ID matching the PITS-YYYYMMDD-XXXX format", () => {
    const id = generateOrderId();
    expect(id).toMatch(/^PITS-\d{8}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);
  });
});
