"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import type { Order } from "@/types/order";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/mockOrders";

interface OrderRowProps {
  order: Order;
}

export function OrderRow({ order }: OrderRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedDate = format(parseISO(order.createdAt), "MMM d, yyyy");
  const total =
    order.subtotal + order.billing.total - (order.appliedPromo?.discountAmount || 0) + order.tip;
  const statusColors = STATUS_COLORS[order.status];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Summary row */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-4">
          <div>
            <p
              className="text-sm font-mono font-medium"
              style={{ color: "var(--fg)" }}
            >
              {order.orderId}
            </p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: statusColors.bg,
              color: statusColors.text,
            }}
          >
            {STATUS_LABELS[order.status]}
          </span>
          <span className="font-medium" style={{ color: "var(--fg)" }}>
            ${total.toFixed(2)}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--fg-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 150ms ease",
            }}
          >
            <path d="M4 6 L8 10 L12 6" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          className="px-4 pb-4 pt-2 space-y-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {/* Items */}
          <div>
            <p
              className="text-xs font-semibold uppercase mb-1.5"
              style={{ letterSpacing: "0.08em", color: "var(--fg-subtle)" }}
            >
              Items
            </p>
            <div className="space-y-1">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm"
                  style={{ color: "var(--fg)" }}
                >
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div>
            <p
              className="text-xs font-semibold uppercase mb-1.5"
              style={{ letterSpacing: "0.08em", color: "var(--fg-subtle)" }}
            >
              Delivery
            </p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between" style={{ color: "var(--fg)" }}>
                <span>Address</span>
                <span className="text-right max-w-[60%]">{order.displayAddress}</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--fg)" }}>
                <span>Distance</span>
                <span>{order.distanceKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--fg)" }}>
                <span>Delivery fee</span>
                <span>${order.billing.total.toFixed(2)}</span>
              </div>
              {order.isRaining && (
                <div className="flex justify-between" style={{ color: "var(--sky-600)" }}>
                  <span>Weather</span>
                  <span>Raining</span>
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div
            className="pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="space-y-1 text-sm">
              <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                <span>Delivery</span>
                <span>${order.billing.total.toFixed(2)}</span>
              </div>
              {order.appliedPromo && (
                <div className="flex justify-between" style={{ color: "var(--status-success)" }}>
                  <span>Promo ({order.appliedPromo.code})</span>
                  <span>-${order.appliedPromo.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {order.tip > 0 && (
                <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                  <span>Tip</span>
                  <span>${order.tip.toFixed(2)}</span>
                </div>
              )}
              <div
                className="flex justify-between font-medium pt-1"
                style={{ color: "var(--fg)" }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Points earned */}
          {order.pointsEarned && order.pointsEarned > 0 && (
            <div
              className="flex items-center gap-2 pt-2 text-sm"
              style={{ color: "var(--brand)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 21 12 16.5 5.8 21l2.4-7.1L2 9.4h7.6L12 2z" />
              </svg>
              <span>+{order.pointsEarned} points earned</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
