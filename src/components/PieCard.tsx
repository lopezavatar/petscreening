"use client";

import Image from "next/image";
import type { Product } from "@/types/product";
import { CATEGORY_LABELS } from "@/lib/products";

interface PieCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function PieCard({ product, onAddToCart }: PieCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Image */}
      <div
        className="relative w-full aspect-square flex items-center justify-center"
        style={{ background: "var(--bg-subtle)" }}
      >
        <Image
          src={product.image}
          alt={product.name}
          width={80}
          height={80}
          className="opacity-80"
        />
        {!product.available && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)" }}
          >
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{ background: "var(--bg)", color: "var(--fg-muted)" }}
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category badge */}
        <div
          className="inline-flex self-start items-center rounded-full px-2 py-0.5 text-xs font-medium mb-2"
          style={{
            background: "var(--bg-subtle)",
            color: "var(--fg-muted)",
          }}
        >
          {CATEGORY_LABELS[product.category]}
        </div>

        {/* Name */}
        <h3
          className="text-base font-semibold mb-1"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
          }}
        >
          {product.name}
        </h3>

        {/* Description */}
        <p
          className="text-sm mb-3 flex-1 line-clamp-2"
          style={{ color: "var(--fg-muted)", lineHeight: 1.5 }}
        >
          {product.description}
        </p>

        {/* Price and action */}
        <div className="flex items-center justify-between">
          <span
            className="text-lg font-medium"
            style={{ color: "var(--brand)" }}
          >
            ${product.price.toFixed(2)}
          </span>
          <button
            onClick={() => onAddToCart(product, 1)}
            disabled={!product.available}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: product.available ? "var(--action)" : "var(--cream-300)",
              color: product.available ? "var(--action-fg)" : "var(--fg-subtle)",
              cursor: product.available ? "pointer" : "not-allowed",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M8 3v10M3 8h10" />
            </svg>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
