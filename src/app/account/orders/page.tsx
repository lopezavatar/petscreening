"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AccountNav } from "@/components/AccountNav";
import { OrderHistoryTable } from "@/components/OrderHistoryTable";
import { useOrders } from "@/hooks/useOrders";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { orders, isLoading: ordersLoading } = useOrders({ userId: user?.id });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || ordersLoading) {
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
              Order History
            </h1>

            <OrderHistoryTable orders={orders} />
          </div>
        </div>
      </div>
    </div>
  );
}
