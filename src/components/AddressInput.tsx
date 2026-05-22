"use client";

import { useState, useEffect, useRef } from "react";
import { useGeocoding } from "@/hooks/useGeocoding";
import { KITCHEN_LOCATION } from "@/lib/constants";

interface AddressInputProps {
  onDistanceResolved: (distanceKm: number, displayAddress: string) => void;
}

export function AddressInput({ onDistanceResolved }: AddressInputProps) {
  const [address, setAddress] = useState("");
  const { result, distanceKm, loading, error, lookup } = useGeocoding();
  const notifiedRef = useRef<string | null>(null);

  const handleLookup = async () => {
    await lookup(address);
  };

  useEffect(() => {
    if (result && distanceKm !== null && notifiedRef.current !== result.displayName) {
      notifiedRef.current = result.displayName;
      onDistanceResolved(distanceKm, result.displayName);
    }
  }, [result, distanceKm, onDistanceResolved]);

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Delivery address
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLookup()}
          placeholder="Enter your address"
          className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-raised)",
            fontFamily: "var(--font-body)",
            color: "var(--fg)",
          }}
        />
        <button
          onClick={handleLookup}
          disabled={loading}
          className="rounded-xl px-5 py-3 text-sm font-semibold transition-all"
          style={{
            background: loading ? "var(--cream-400)" : "var(--action)",
            color: "var(--action-fg)",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "var(--shadow-btn)",
          }}
        >
          {loading ? "Looking up..." : "Look up"}
        </button>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "var(--status-error)" }}>
          {error}
        </p>
      )}

      {result && distanceKm !== null && (
        <div
          className="rounded-xl p-4 space-y-1"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {result.displayName}
          </p>
          <p className="text-base font-medium" style={{ color: "var(--fg)" }}>
            {distanceKm.toFixed(1)} km from {KITCHEN_LOCATION.name}
          </p>
          <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
            Straight-line distance (as the drone flies)
          </p>
        </div>
      )}
    </div>
  );
}
