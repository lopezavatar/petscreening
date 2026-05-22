"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { RainBanner } from "@/components/RainBanner";
import { PieGrid } from "@/components/PieGrid";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product";

export default function Home() {
  const router = useRouter();
  const { addToCart, getItemCount, getSubtotal } = useCart();

  const handleAddToCart = (product: Product, quantity: number) => {
    addToCart(product, quantity);
  };

  const itemCount = getItemCount();
  const subtotal = getSubtotal();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      <RainBanner />

      {/* Header */}
      <div
        className="sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, var(--bg) 0%, var(--bg) 80%, transparent 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <Header />
        </div>
      </div>

      {/* Hero section */}
      <div
        className="relative w-full py-12 px-6"
        style={{
          background: "linear-gradient(180deg, #3DAAE8 0%, #BAE0F9 60%, var(--bg) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--fg)",
              letterSpacing: "-0.02em",
            }}
          >
            Fresh Pies, Delivered by Drone
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: "var(--fg-muted)" }}
          >
            From our kitchen to your door in minutes. Browse our handcrafted pies
            and experience the future of pie delivery.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <PieGrid onAddToCart={handleAddToCart} />
        </div>
      </main>

      {/* Cart bar (sticky bottom) */}
      {itemCount > 0 && (
        <div
          className="sticky bottom-0 z-40 px-6 py-4"
          style={{
            background: "var(--bg-raised)",
            borderTop: "1px solid var(--border)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
                {itemCount} {itemCount === 1 ? "item" : "items"} in cart
              </p>
              <p
                className="text-xl font-semibold"
                style={{ color: "var(--fg)" }}
              >
                ${subtotal.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => router.push("/checkout")}
              className="px-8 py-3 rounded-full text-base font-semibold uppercase transition-all"
              style={{
                background: "var(--action)",
                color: "var(--action-fg)",
                letterSpacing: "0.08em",
                boxShadow: "var(--shadow-btn)",
              }}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
