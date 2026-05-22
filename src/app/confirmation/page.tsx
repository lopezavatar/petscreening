"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useCart } from "@/context/CartContext";
import type { Order } from "@/types/order";

export default function ConfirmationPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("pits_order");
    if (!stored) {
      router.push("/");
      return;
    }
    setOrder(JSON.parse(stored));
    clearCart();
  }, [router, clearCart]);

  if (!order) return null;

  const formattedDate = format(parseISO(order.deliveryDate), "EEEE, MMMM d, yyyy");

  // Calculate totals
  const deliveryTotal = order.billing.total;
  const promoDiscount = order.appliedPromo?.discountAmount || 0;
  const tip = order.tip || 0;
  const grandTotal = order.subtotal + deliveryTotal - promoDiscount + tip;

  const handleNewOrder = () => {
    sessionStorage.removeItem("pits_order");
    router.push("/");
  };

  const handleTrackOrder = () => {
    router.push(`/tracking/${order.orderId}`);
  };

  return (
    <div
      className="w-full max-w-md mx-auto min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Sky header */}
      <div
        className="w-full pt-8 pb-16 flex flex-col items-center"
        style={{
          background:
            "linear-gradient(180deg, #3DAAE8 0%, #BAE0F9 60%, #FDFAF5 100%)",
        }}
      >
        {/* Animated drone icon */}
        <div style={{ animation: "drone-bob 4s ease-in-out infinite" }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <ellipse cx="28" cy="10" rx="12" ry="5" fill="#D97D18" opacity="0.85" transform="rotate(-20 28 10)" />
            <ellipse cx="28" cy="10" rx="12" ry="5" fill="#D97D18" opacity="0.5" transform="rotate(70 28 10)" />
            <circle cx="28" cy="10" r="4" fill="#8F4A0D" />
            <line x1="28" y1="14" x2="28" y2="26" stroke="#5C3A1E" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="28" cy="32" rx="16" ry="6" fill="#F5BC6E" />
            <path d="M12 32 Q12 48 28 48 Q44 48 44 32 Z" fill="#EF9C38" />
            <ellipse cx="28" cy="32" rx="16" ry="6" fill="none" stroke="#D97D18" strokeWidth="2" />
          </svg>
        </div>
      </div>

      <div className="px-7 -mt-8 pb-12 flex-1 flex flex-col items-center">
        {/* Confirmation panel */}
        <div
          className="w-full rounded-3xl p-8 text-center space-y-6"
          style={{
            background: "var(--bg-overlay)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(237,228,213,0.7)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {/* Checkmark */}
          <div className="flex justify-center">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="26" fill="#D1F0E2" />
              <path
                d="M17 28 L24 35 L39 20"
                stroke="#2D9E5F"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1
            className="text-2xl font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--fg)",
            }}
          >
            Your pie is on its way!
          </h1>

          {/* Order ID */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: "var(--bg-subtle)" }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
              Order
            </span>
            <span className="text-sm font-mono font-medium" style={{ color: "var(--fg)" }}>
              {order.orderId}
            </span>
          </div>

          <p className="text-sm" style={{ color: "var(--fg-muted)", lineHeight: 1.7 }}>
            {order.items.length === 1
              ? `${order.items[0].quantity} ${order.items[0].product.name}, flying to you by drone.`
              : `${order.items.reduce((sum, i) => sum + i.quantity, 0)} items, flying to you by drone.`}
          </p>

          {/* Order details */}
          <div className="text-left space-y-3 text-sm">
            <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
              <span>Delivery to</span>
              <span className="text-right font-medium max-w-[60%]" style={{ color: "var(--fg)" }}>
                {order.displayAddress.split(",").slice(0, 2).join(",")}
              </span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
              <span>Distance</span>
              <span className="font-medium" style={{ color: "var(--fg)" }}>
                {order.distanceKm.toFixed(1)} km
              </span>
            </div>
            <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
              <span>Scheduled</span>
              <span className="font-medium" style={{ color: "var(--fg)" }}>
                {formattedDate}, {order.deliveryTime}
              </span>
            </div>
            {order.isRaining && (
              <div className="flex justify-between" style={{ color: "var(--fg-muted)" }}>
                <span>Weather</span>
                <span className="font-medium" style={{ color: "var(--sky-600)" }}>
                  Raining
                </span>
              </div>
            )}
            {order.deliveryInstructions && (
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--fg-muted)" }}>
                  Instructions:
                </span>
                <p className="text-sm mt-1" style={{ color: "var(--fg)" }}>
                  {order.deliveryInstructions}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Billing breakdown */}
        <div
          className="w-full mt-6 rounded-2xl p-6 space-y-4"
          style={{
            background: "var(--bg-raised)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-xs font-semibold uppercase"
            style={{ letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
          >
            Order Summary
          </div>

          <div className="space-y-2">
            {/* Items */}
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
                style={{ color: "var(--fg)" }}
              >
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            {/* Delivery items */}
            {order.billing.lineItems.map((item, i) =>
              item.applies ? (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm"
                  style={{ color: "var(--fg)" }}
                >
                  <span>{item.label}</span>
                  <span className="font-medium">${item.amount.toFixed(2)}</span>
                </div>
              ) : null
            )}

            {/* Promo discount */}
            {order.appliedPromo && (
              <div
                className="flex justify-between items-center text-sm"
                style={{ color: "var(--status-success)" }}
              >
                <span>Promo: {order.appliedPromo.code}</span>
                <span className="font-medium">
                  -${order.appliedPromo.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Tip */}
            {tip > 0 && (
              <div
                className="flex justify-between items-center text-sm"
                style={{ color: "var(--fg)" }}
              >
                <span>Tip</span>
                <span className="font-medium">${tip.toFixed(2)}</span>
              </div>
            )}
          </div>

          <hr style={{ borderColor: "var(--border)" }} />

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
              Total
            </span>
            <div className="flex items-baseline gap-2">
              {order.billing.isWeekendFlat && (
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
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Track Order button */}
        <button
          onClick={handleTrackOrder}
          className="mt-6 w-full py-4 rounded-full text-base font-semibold uppercase transition-all"
          style={{
            background: "var(--action)",
            color: "var(--action-fg)",
            letterSpacing: "0.08em",
            boxShadow: "var(--shadow-btn)",
            border: "none",
            cursor: "pointer",
          }}
        >
          Track Your Order
        </button>

        {/* Back button */}
        <button
          onClick={handleNewOrder}
          className="mt-4 text-sm cursor-pointer"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-subtle)",
            fontFamily: "var(--font-body)",
          }}
        >
          Place another order
        </button>
      </div>
    </div>
  );
}
