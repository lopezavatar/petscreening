"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRain } from "@/hooks/useRain";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { TIER_CONFIG } from "@/lib/loyalty";

export function Header() {
  const router = useRouter();
  const { isRaining } = useRain();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const itemCount = getItemCount();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <div className="flex items-center justify-between px-6 pt-6">
      <Link href="/">
        <Image src="/logo.svg" alt="Pie In The Sky" width={180} height={36} priority />
      </Link>

      <div className="flex items-center gap-3">
        {/* Rain indicator */}
        {isRaining && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "#E0F0FC", color: "#0D548A" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17.5 Q5 13 9 14 Q10 10 14 11 Q15 7 19 9 Q22 10 21 14.5" />
              <path d="M1 19 Q3 15.5 7 16.5" />
              <path d="M3 19 L21 19" />
            </svg>
            <span className="text-xs font-semibold">Rain</span>
          </div>
        )}

        {/* Cart icon */}
        {itemCount > 0 && (
          <Link
            href="/checkout"
            className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors"
            style={{ background: "var(--bg-subtle)" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--fg)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: "var(--brand)",
                color: "var(--action-fg)",
              }}
            >
              {itemCount}
            </span>
          </Link>
        )}

        {/* Auth section */}
        {user ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors"
              style={{
                background: "var(--bg-subtle)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {/* Tier badge */}
              <span
                className="px-1.5 py-0.5 rounded text-xs font-bold uppercase"
                style={{
                  background: TIER_CONFIG[user.tier].color,
                  color: "white",
                  fontSize: "9px",
                }}
              >
                {user.tier.charAt(0)}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                {user.name.split(" ")[0]}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="var(--fg-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                style={{
                  transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              >
                <path d="M3 4.5 L6 7.5 L9 4.5" />
              </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-48 rounded-xl py-2 z-50"
                style={{
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-elevated)",
                }}
              >
                <div
                  className="px-4 py-2 mb-1"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {user.name}
                  </p>
                  <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                    {user.points.toLocaleString()} points
                  </p>
                </div>

                <Link
                  href="/account"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{ color: "var(--fg)" }}
                >
                  My Profile
                </Link>
                <Link
                  href="/account/orders"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{ color: "var(--fg)" }}
                >
                  Order History
                </Link>
                <Link
                  href="/account/rewards"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2 text-sm transition-colors"
                  style={{ color: "var(--fg)" }}
                >
                  Rewards
                </Link>

                <div style={{ borderTop: "1px solid var(--border)", marginTop: "4px", paddingTop: "4px" }}>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm transition-colors"
                    style={{
                      color: "var(--status-error)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              background: "var(--action)",
              color: "var(--action-fg)",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
