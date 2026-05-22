"use client";

import type { LoyaltyTier } from "@/lib/accounts";
import { TIER_CONFIG, getNextTier, getPointsToNextTier } from "@/lib/loyalty";

interface LoyaltyStatusProps {
  tier: LoyaltyTier;
  points: number;
  compact?: boolean;
}

export function LoyaltyStatus({ tier, points, compact = false }: LoyaltyStatusProps) {
  const config = TIER_CONFIG[tier];
  const nextTier = getNextTier(tier);
  const pointsToNext = getPointsToNextTier(points, tier);
  const nextConfig = nextTier ? TIER_CONFIG[nextTier] : null;

  // Calculate progress to next tier
  let progress = 100;
  if (nextTier && nextConfig) {
    const currentMin = config.minPoints;
    const nextMin = nextConfig.minPoints;
    progress = Math.min(100, ((points - currentMin) / (nextMin - currentMin)) * 100);
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded-full text-xs font-bold uppercase"
          style={{
            background: config.color,
            color: "white",
            letterSpacing: "0.05em",
          }}
        >
          {tier}
        </span>
        <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
          {points.toLocaleString()} pts
        </span>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 space-y-4"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Tier badge and points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-sm font-bold uppercase"
            style={{
              background: config.color,
              color: "white",
              letterSpacing: "0.05em",
            }}
          >
            {tier}
          </span>
          <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {config.discount > 0 ? `${config.discount}% discount` : "No discount"}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold" style={{ color: "var(--fg)" }}>
            {points.toLocaleString()}
          </p>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            points
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {nextTier && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span style={{ color: "var(--fg-muted)" }}>Progress to {nextTier}</span>
            <span style={{ color: "var(--fg-muted)" }}>
              {pointsToNext.toLocaleString()} pts to go
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--cream-200)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: nextConfig?.color || config.color,
              }}
            />
          </div>
        </div>
      )}

      {tier === "platinum" && (
        <p className="text-sm text-center" style={{ color: "var(--fg-muted)" }}>
          You&apos;ve reached the highest tier!
        </p>
      )}
    </div>
  );
}
