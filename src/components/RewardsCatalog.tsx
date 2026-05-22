"use client";

import { useState } from "react";
import { REWARDS_CATALOG, REWARD_ICONS, canRedeemReward, type Reward } from "@/lib/rewards";

interface RewardsCatalogProps {
  pointsBalance: number;
  onRedeem: (reward: Reward) => void;
}

export function RewardsCatalog({ pointsBalance, onRedeem }: RewardsCatalogProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (reward: Reward) => {
    setRedeeming(reward.id);
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));
    onRedeem(reward);
    setRedeeming(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-lg font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
          }}
        >
          Rewards Catalog
        </h2>
        <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
          {pointsBalance.toLocaleString()} points available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {REWARDS_CATALOG.map((reward) => {
          const { canRedeem, reason } = canRedeemReward(pointsBalance, reward);
          const isRedeeming = redeeming === reward.id;

          return (
            <div
              key={reward.id}
              className="rounded-xl p-4 flex flex-col"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                opacity: canRedeem ? 1 : 0.7,
              }}
            >
              {/* Icon and name */}
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--brand-light)" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--brand)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={REWARD_ICONS[reward.icon]} />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "var(--fg)" }}>
                    {reward.name}
                  </p>
                  <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                    {reward.description}
                  </p>
                </div>
              </div>

              {/* Points and redeem */}
              <div className="mt-auto flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--brand)" }}
                >
                  {reward.pointsCost.toLocaleString()} pts
                </span>

                {canRedeem ? (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={isRedeeming}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{
                      background: isRedeeming ? "var(--cream-300)" : "var(--action)",
                      color: "var(--action-fg)",
                      border: "none",
                      cursor: isRedeeming ? "not-allowed" : "pointer",
                    }}
                  >
                    {isRedeeming ? "Redeeming..." : "Redeem"}
                  </button>
                ) : (
                  <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>
                    {reason}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
