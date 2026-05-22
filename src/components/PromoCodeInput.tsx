"use client";

import { useState } from "react";
import { validatePromoCode } from "@/lib/promoCodes";
import { ValidationError, ValidationSuccess } from "./ValidationError";
import type { AppliedPromo } from "@/types/promo";

interface PromoCodeInputProps {
  orderSubtotal: number;
  deliveryCost: number;
  appliedPromo: AppliedPromo | null;
  onPromoApplied: (promo: AppliedPromo | null) => void;
}

export function PromoCodeInput({
  orderSubtotal,
  deliveryCost,
  appliedPromo,
  onPromoApplied,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    const result = validatePromoCode(code, orderSubtotal, deliveryCost);

    if (result.success && result.appliedPromo) {
      onPromoApplied(result.appliedPromo);
      setError(null);
    } else {
      setError(result.error || "Invalid code");
      onPromoApplied(null);
    }
  };

  const handleRemove = () => {
    setCode("");
    setError(null);
    onPromoApplied(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Promo code
      </label>

      {appliedPromo ? (
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            background: "rgba(45, 158, 95, 0.1)",
            border: "1px solid rgba(45, 158, 95, 0.3)",
          }}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>
              {appliedPromo.code}
            </p>
            <p className="text-xs" style={{ color: "var(--status-success)" }}>
              ✓ {appliedPromo.description}: -${appliedPromo.discountAmount.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              color: "var(--fg-muted)",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter code"
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none uppercase"
              style={{
                borderColor: error ? "var(--status-error)" : "var(--border)",
                background: "var(--bg-raised)",
                fontFamily: "var(--font-body)",
                color: "var(--fg)",
                letterSpacing: "0.05em",
              }}
            />
            <button
              type="button"
              onClick={handleApply}
              className="rounded-xl px-5 py-3 text-sm font-semibold transition-all"
              style={{
                background: "var(--action)",
                color: "var(--action-fg)",
                cursor: "pointer",
                boxShadow: "var(--shadow-btn)",
              }}
            >
              Apply
            </button>
          </div>

          {error && (
            <ValidationError validation={{ status: "error", message: error }} />
          )}
        </>
      )}
    </div>
  );
}
