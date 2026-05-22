"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { KITCHEN_LOCATION } from "@/lib/constants";
import {
  getStatusFromProgress,
  calculateETA,
  interpolatePosition,
  type DeliveryStatus,
} from "@/lib/tracking";
import { TrackingMap } from "@/components/TrackingMap";
import { DeliveryProgress } from "@/components/DeliveryProgress";
import type { Order } from "@/types/order";

interface TrackingPageProps {
  params: Promise<{ orderId: string }>;
}

export default function TrackingPage({ params }: TrackingPageProps) {
  const { orderId } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<DeliveryStatus>("preparing");
  const [currentPosition, setCurrentPosition] = useState({
    lat: KITCHEN_LOCATION.lat,
    lon: KITCHEN_LOCATION.lon,
  });

  // Load order from session storage
  useEffect(() => {
    const stored = sessionStorage.getItem("pits_order");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.orderId === orderId) {
        setOrder(parsed);
      }
    }
  }, [orderId]);

  // Simulate delivery progress
  useEffect(() => {
    if (!order) return;

    const totalDuration = calculateETA(order.distanceKm, order.isRaining) * 60 * 1000; // Convert to ms
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);

      setProgress(newProgress);
      setStatus(getStatusFromProgress(newProgress));

      // Update position
      const startPos = { lat: KITCHEN_LOCATION.lat, lon: KITCHEN_LOCATION.lon };
      // Parse destination from display address (mock - just offset from kitchen)
      const endPos = {
        lat: KITCHEN_LOCATION.lat + order.distanceKm * 0.009, // Rough km to degrees
        lon: KITCHEN_LOCATION.lon + order.distanceKm * 0.012,
      };
      setCurrentPosition(interpolatePosition(startPos, endPos, newProgress));

      if (newProgress >= 100) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [order]);

  if (!order) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: "var(--bg)" }}
      >
        <p className="text-lg mb-4" style={{ color: "var(--fg)" }}>
          Order not found
        </p>
        <button
          onClick={() => router.push("/")}
          className="text-sm"
          style={{ color: "var(--brand)", background: "none", border: "none", cursor: "pointer" }}
        >
          Return to menu
        </button>
      </div>
    );
  }

  const etaMinutes = Math.max(
    0,
    Math.ceil(calculateETA(order.distanceKm, order.isRaining) * (1 - progress / 100))
  );

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
      <div className="max-w-md mx-auto px-6 py-8 space-y-6">
        {/* Order ID */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--fg)",
            }}
          >
            Track Your Order
          </h1>
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
        </div>

        {/* Map */}
        <TrackingMap
          currentPosition={currentPosition}
          destinationPosition={{
            lat: KITCHEN_LOCATION.lat + order.distanceKm * 0.009,
            lon: KITCHEN_LOCATION.lon + order.distanceKm * 0.012,
          }}
          progress={progress}
          isRaining={order.isRaining}
        />

        {/* Progress */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <DeliveryProgress
            status={status}
            progress={progress}
            etaMinutes={etaMinutes}
            isRaining={order.isRaining}
          />
        </div>

        {/* Order summary */}
        <div
          className="rounded-xl p-5 space-y-3"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-sm font-semibold uppercase"
            style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
          >
            Order Summary
          </h2>

          <div className="space-y-2 text-sm">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between" style={{ color: "var(--fg)" }}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span className="font-medium">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div
            className="pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="flex justify-between text-sm" style={{ color: "var(--fg-muted)" }}>
              <span>Delivery to</span>
              <span
                className="text-right max-w-[60%] font-medium"
                style={{ color: "var(--fg)" }}
              >
                {order.displayAddress.split(",").slice(0, 2).join(",")}
              </span>
            </div>
          </div>
        </div>

        {/* Help link */}
        <div className="text-center">
          <button
            className="text-sm"
            style={{
              color: "var(--fg-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Need help with your order?
          </button>
        </div>
      </div>
    </div>
  );
}
