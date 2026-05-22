"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AccountNav } from "@/components/AccountNav";
import { LoyaltyStatus } from "@/components/LoyaltyStatus";
import { RewardsCatalog } from "@/components/RewardsCatalog";
import { PointsHistory } from "@/components/PointsHistory";
import type { Reward } from "@/lib/rewards";
import type { PointsTransaction } from "@/lib/loyalty";

export default function RewardsPage() {
  const router = useRouter();
  const { user, isLoading, updatePoints } = useAuth();
  const [redemptions, setRedemptions] = useState<PointsTransaction[]>([]);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleRedeem = (reward: Reward) => {
    if (!user) return;

    // Deduct points
    updatePoints(-reward.pointsCost);

    // Add to redemption history
    const tx: PointsTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      amount: reward.pointsCost,
      description: `Redeemed: ${reward.name}`,
      expiresAt: "",
      type: "redeemed",
    };
    setRedemptions((prev) => [tx, ...prev]);

    // Show success message
    setShowSuccess(reward.name);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      >
        <div className="animate-pulse text-lg" style={{ color: "var(--fg-muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Mock points history based on user tier
  const mockHistory: PointsTransaction[] = [
    {
      id: "tx-1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 45,
      description: "Order #PIE-ABC123",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      type: "earned",
    },
    {
      id: "tx-2",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 32,
      description: "Order #PIE-DEF456",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      type: "earned",
    },
    {
      id: "tx-3",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 58,
      description: "Order #PIE-GHI789",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      type: "earned",
    },
  ];

  const allHistory = [...redemptions, ...mockHistory];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="px-6 py-6 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-sm flex items-center gap-1"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-muted)",
            cursor: "pointer",
          }}
        >
          ← Back to menu
        </button>
        <Image src="/logo.svg" alt="Pie In The Sky" width={120} height={24} />
      </div>

      {/* Success toast */}
      {showSuccess && (
        <div
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl flex items-center gap-2"
          style={{
            background: "#D1F0E2",
            color: "#1A6B42",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
            <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium">
            {showSuccess} redeemed successfully!
          </span>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <AccountNav />
          </div>

          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--fg)",
              }}
            >
              Rewards
            </h1>

            {/* Loyalty Status */}
            <LoyaltyStatus tier={user.tier} points={user.points} />

            {/* Rewards Catalog */}
            <RewardsCatalog pointsBalance={user.points} onRedeem={handleRedeem} />

            {/* Points History */}
            <div className="space-y-3">
              <h2
                className="text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--fg)",
                }}
              >
                Points Activity
              </h2>
              <PointsHistory transactions={allHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
