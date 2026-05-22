"use client";

import { PRICING } from "@/lib/constants";

interface WeatherToggleProps {
  isRaining: boolean;
  onRainingChange: (isRaining: boolean) => void;
}

export function WeatherToggle({ isRaining, onRainingChange }: WeatherToggleProps) {
  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Weather simulation
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onRainingChange(false)}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: !isRaining ? "var(--action)" : "var(--bg-raised)",
            color: !isRaining ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${!isRaining ? "var(--action)" : "var(--border)"}`,
          }}
        >
          <span>☀️</span>
          <span>Clear</span>
        </button>
        <button
          type="button"
          onClick={() => onRainingChange(true)}
          className="flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: isRaining ? "var(--sky-500)" : "var(--bg-raised)",
            color: isRaining ? "white" : "var(--fg-muted)",
            border: `1px solid ${isRaining ? "var(--sky-500)" : "var(--border)"}`,
          }}
        >
          <span>🌧️</span>
          <span>Raining</span>
        </button>
      </div>

      <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
        Rain adds ${PRICING.RAIN_SURCHARGE.toFixed(2)} surcharge (weekdays only)
      </p>
    </div>
  );
}
