export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
  category: "delivery" | "discount" | "product" | "bonus";
}

export const REWARDS_CATALOG: Reward[] = [
  {
    id: "free-delivery",
    name: "Free Delivery",
    description: "Get free delivery on your next order (up to $25 value)",
    pointsCost: 300,
    icon: "drone",
    category: "delivery",
  },
  {
    id: "5-off",
    name: "$5 Off Order",
    description: "Save $5 on your next order of $20 or more",
    pointsCost: 500,
    icon: "tag",
    category: "discount",
  },
  {
    id: "10-off",
    name: "$10 Off Order",
    description: "Save $10 on your next order of $35 or more",
    pointsCost: 900,
    icon: "tag",
    category: "discount",
  },
  {
    id: "free-pie",
    name: "Free Signature Pie",
    description: "Get any pie from our catalog for free",
    pointsCost: 1500,
    icon: "pie",
    category: "product",
  },
  {
    id: "double-points",
    name: "Double Points Pass",
    description: "Earn 2x points on your next 3 orders",
    pointsCost: 750,
    icon: "star",
    category: "bonus",
  },
  {
    id: "priority-delivery",
    name: "Priority Delivery",
    description: "Jump to the front of the queue for your next 5 deliveries",
    pointsCost: 400,
    icon: "lightning",
    category: "delivery",
  },
];

export interface RedemptionResult {
  success: boolean;
  error?: string;
  newPointsBalance?: number;
}

export function canRedeemReward(
  pointsBalance: number,
  reward: Reward
): { canRedeem: boolean; reason?: string } {
  if (pointsBalance < reward.pointsCost) {
    return {
      canRedeem: false,
      reason: `You need ${reward.pointsCost - pointsBalance} more points`,
    };
  }
  return { canRedeem: true };
}

export function redeemReward(
  pointsBalance: number,
  reward: Reward
): RedemptionResult {
  const check = canRedeemReward(pointsBalance, reward);
  if (!check.canRedeem) {
    return { success: false, error: check.reason };
  }

  return {
    success: true,
    newPointsBalance: pointsBalance - reward.pointsCost,
  };
}

export const REWARD_ICONS: Record<string, string> = {
  drone: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
  pie: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
  star: "M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z",
  lightning: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};
