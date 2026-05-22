"use client";

import { useState } from "react";
import { PRICING, KITCHEN_LOCATION } from "@/lib/constants";

export function BusinessRulesPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-subtle)",
        border: "1px solid var(--border)",
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <span
          className="text-sm font-medium"
          style={{ color: "var(--fg-muted)" }}
        >
          {expanded ? "▼" : "▶"} Pricing Rules Reference
        </span>
        <span
          className="text-xs"
          style={{ color: "var(--fg-subtle)" }}
        >
          {expanded ? "Hide" : "Show"}
        </span>
      </button>

      {expanded && (
        <div
          className="px-5 pb-5 space-y-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="pt-4">
            <p
              className="text-xs font-semibold uppercase mb-2"
              style={{ letterSpacing: "0.1em", color: "var(--fg-muted)" }}
            >
              Delivery Fees
            </p>
            <div className="space-y-1.5 text-sm" style={{ color: "var(--fg)" }}>
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--fg-subtle)" }}>├─</span>
                <span>Distance ≤ {PRICING.DISTANCE_THRESHOLD_KM} km: ${PRICING.BASE_NEAR.toFixed(2)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--fg-subtle)" }}>├─</span>
                <span>Distance &gt; {PRICING.DISTANCE_THRESHOLD_KM} km: ${PRICING.BASE_FAR.toFixed(2)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--fg-subtle)" }}>├─</span>
                <span>Rain surcharge: +${PRICING.RAIN_SURCHARGE.toFixed(2)} (weekdays)</span>
              </div>
              <div className="flex items-start gap-2">
                <span style={{ color: "var(--fg-subtle)" }}>└─</span>
                <span>Weekend (Sat/Sun): ${PRICING.WEEKEND_FLAT.toFixed(2)} flat</span>
              </div>
            </div>
          </div>

          <div>
            <p
              className="text-xs font-semibold uppercase mb-2"
              style={{ letterSpacing: "0.1em", color: "var(--fg-muted)" }}
            >
              Delivery Hours
            </p>
            <p className="text-sm" style={{ color: "var(--fg)" }}>
              8:00 AM - 10:00 PM
            </p>
          </div>

          <div>
            <p
              className="text-xs font-semibold uppercase mb-2"
              style={{ letterSpacing: "0.1em", color: "var(--fg-muted)" }}
            >
              Kitchen Location
            </p>
            <p className="text-sm" style={{ color: "var(--fg)" }}>
              {KITCHEN_LOCATION.name.replace("PITS Kitchen (", "").replace(")", "")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
