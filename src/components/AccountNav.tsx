"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoyaltyStatus } from "./LoyaltyStatus";

const NAV_ITEMS = [
  { href: "/account", label: "Profile", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" },
  { href: "/account/orders", label: "Order History", icon: "M3 3h18v4H3V3zm0 6h18v4H3V9zm0 6h18v4H3v-4z" },
  { href: "/account/rewards", label: "Rewards", icon: "M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z" },
];

export function AccountNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div
      className="rounded-2xl p-4 space-y-4"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* User info */}
      <div className="pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="font-semibold" style={{ color: "var(--fg)" }}>
          {user.name}
        </p>
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          {user.email}
        </p>
        <div className="mt-3">
          <LoyaltyStatus tier={user.tier} points={user.points} compact />
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                background: isActive ? "var(--brand)" : "transparent",
                color: isActive ? "var(--action-fg)" : "var(--fg)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                opacity={isActive ? 1 : 0.6}
              >
                <path d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: "transparent",
          color: "var(--status-error)",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </div>
  );
}
