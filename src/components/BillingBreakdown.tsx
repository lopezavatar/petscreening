"use client";

import type { BillingResult } from "@/types/order";

interface BillingBreakdownProps {
  billing: BillingResult;
}

export function BillingBreakdown({ billing }: BillingBreakdownProps) {
  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "var(--bg-raised)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="text-xs font-semibold uppercase"
        style={{
          letterSpacing: "0.14em",
          color: "var(--fg-subtle)",
        }}
      >
        Delivery cost
      </div>

      <div className="space-y-2">
        {billing.lineItems.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center text-sm"
            style={{
              color: item.applies ? "var(--fg)" : "var(--fg-subtle)",
              textDecoration: !item.applies && item.amount > 0 ? "line-through" : "none",
            }}
          >
            <span>{item.label}</span>
            <span className="font-medium">
              {item.applies
                ? `$${item.amount.toFixed(2)}`
                : item.amount > 0
                ? `$${item.amount.toFixed(2)}`
                : "—"}
            </span>
          </div>
        ))}
      </div>

      <hr style={{ borderColor: "var(--border)" }} />

      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
          Total
        </span>
        <div className="flex items-baseline gap-2">
          {billing.isWeekendFlat && (
            <span
              className="text-xs font-semibold rounded-md px-2 py-0.5"
              style={{
                background: "var(--crust-100)",
                color: "var(--crust-700)",
              }}
            >
              Weekend flat
            </span>
          )}
          <span
            className="text-2xl font-light"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--brand)",
              letterSpacing: "-0.02em",
            }}
          >
            ${billing.total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
