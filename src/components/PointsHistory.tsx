"use client";

import { format, parseISO } from "date-fns";
import type { PointsTransaction } from "@/lib/loyalty";

interface PointsHistoryProps {
  transactions: PointsTransaction[];
}

export function PointsHistory({ transactions }: PointsHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: "var(--bg-subtle)" }}
      >
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          No points activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const isPositive = tx.type === "earned";
        const date = format(parseISO(tx.date), "MMM d, yyyy");

        return (
          <div
            key={tx.id}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                {tx.description}
              </p>
              <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                {date}
              </p>
            </div>
            <span
              className="text-sm font-semibold"
              style={{
                color: isPositive ? "var(--status-success)" : "var(--status-error)",
              }}
            >
              {isPositive ? "+" : "-"}{Math.abs(tx.amount).toLocaleString()} pts
            </span>
          </div>
        );
      })}
    </div>
  );
}
