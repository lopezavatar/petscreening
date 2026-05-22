"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AccountNav } from "@/components/AccountNav";
import { LoyaltyStatus } from "@/components/LoyaltyStatus";
import { format, parseISO } from "date-fns";

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

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

  const memberSince = format(parseISO(user.joinedAt), "MMMM yyyy");

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
              My Profile
            </h1>

            {/* Loyalty Status */}
            <LoyaltyStatus tier={user.tier} points={user.points} />

            {/* Profile info */}
            <div
              className="rounded-xl p-5 space-y-4"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <h2
                className="text-sm font-semibold uppercase"
                style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
              >
                Account Details
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: "var(--fg-muted)" }}>Name</span>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>
                    {user.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--fg-muted)" }}>Email</span>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>
                    {user.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--fg-muted)" }}>Member since</span>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>
                    {memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/account/orders")}
                className="p-4 rounded-xl text-left transition-colors"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--brand)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="mb-2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <p className="font-medium" style={{ color: "var(--fg)" }}>
                  View Orders
                </p>
                <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                  See your order history
                </p>
              </button>

              <button
                onClick={() => router.push("/account/rewards")}
                className="p-4 rounded-xl text-left transition-colors"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="var(--brand)"
                  className="mb-2"
                >
                  <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z" />
                </svg>
                <p className="font-medium" style={{ color: "var(--fg)" }}>
                  Rewards
                </p>
                <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                  Redeem your points
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
