"use client";

import { useState, useEffect, useRef } from "react";
import { useGeocoding } from "@/hooks/useGeocoding";
import { KITCHEN_LOCATION, PRICING } from "@/lib/constants";
import { ValidationError, ValidationSuccess } from "./ValidationError";
import { DistanceSlider } from "./DistanceSlider";
import type { ValidationResult } from "@/types/validation";

type InputMode = "address" | "slider" | "manual";

interface DistanceInputProps {
  onDistanceResolved: (distanceKm: number, displayAddress: string) => void;
  onValidationChange?: (valid: boolean) => void;
}

function validateDistance(distance: number | null): ValidationResult {
  if (distance === null) {
    return { status: "error", message: "Please enter a distance" };
  }
  if (isNaN(distance)) {
    return { status: "error", message: "Please enter a valid number" };
  }
  if (distance < 0) {
    return { status: "error", message: "Distance must be positive" };
  }
  if (distance === 0) {
    return { status: "error", message: "Distance cannot be zero" };
  }
  if (distance > 100) {
    return { status: "warning", message: "Distance exceeds typical drone range (100 km)" };
  }
  return { status: "valid", message: "Distance accepted" };
}

export function DistanceInput({ onDistanceResolved, onValidationChange }: DistanceInputProps) {
  const [mode, setMode] = useState<InputMode>("address");
  const [address, setAddress] = useState("");
  const [manualDistance, setManualDistance] = useState("");
  const [sliderDistance, setSliderDistance] = useState(10);
  const { result, distanceKm, loading, error, lookup } = useGeocoding();
  const notifiedRef = useRef<string | null>(null);
  const [manualValidation, setManualValidation] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState(false);

  // Use refs for callbacks to avoid infinite loops
  const onDistanceResolvedRef = useRef(onDistanceResolved);
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onDistanceResolvedRef.current = onDistanceResolved;
    onValidationChangeRef.current = onValidationChange;
  });

  const handleLookup = async () => {
    await lookup(address);
  };

  useEffect(() => {
    if (mode === "address" && result && distanceKm !== null && notifiedRef.current !== result.displayName) {
      notifiedRef.current = result.displayName;
      onDistanceResolvedRef.current(distanceKm, result.displayName);
      onValidationChangeRef.current?.(true);
    }
  }, [result, distanceKm, mode]);

  useEffect(() => {
    if (mode === "manual") {
      const distance = manualDistance === "" ? null : parseFloat(manualDistance);
      const validation = validateDistance(distance);
      setManualValidation(validation);

      const isValid = validation.status === "valid" || validation.status === "warning";
      onValidationChangeRef.current?.(isValid);

      if (isValid && distance !== null) {
        onDistanceResolvedRef.current(distance, `Manual entry: ${distance} km from kitchen`);
      }
    }
  }, [manualDistance, mode]);

  // Handle slider mode
  useEffect(() => {
    if (mode === "slider" && sliderDistance > 0) {
      onDistanceResolvedRef.current(sliderDistance, `Slider: ${sliderDistance.toFixed(1)} km from kitchen`);
      onValidationChangeRef.current?.(true);
    }
  }, [sliderDistance, mode]);

  const handleSliderChange = (value: number) => {
    setSliderDistance(value);
  };

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--bg-raised)",
    fontFamily: "var(--font-body)",
    color: "var(--fg)",
  };

  return (
    <div className="space-y-4">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        How would you like to set your delivery location?
      </label>

      {/* Mode toggle - three-way */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("address")}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
          style={{
            background: mode === "address" ? "var(--action)" : "var(--bg-raised)",
            color: mode === "address" ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${mode === "address" ? "var(--action)" : "var(--border)"}`,
          }}
        >
          Address
        </button>
        <button
          type="button"
          onClick={() => setMode("slider")}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
          style={{
            background: mode === "slider" ? "var(--action)" : "var(--bg-raised)",
            color: mode === "slider" ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${mode === "slider" ? "var(--action)" : "var(--border)"}`,
          }}
        >
          Slider
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
          style={{
            background: mode === "manual" ? "var(--action)" : "var(--bg-raised)",
            color: mode === "manual" ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${mode === "manual" ? "var(--action)" : "var(--border)"}`,
          }}
        >
          Manual
        </button>
      </div>

      {mode === "address" && (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="Enter your address"
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all"
              style={inputStyle}
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
        </>
      )}

      {mode === "slider" && (
        <div className="space-y-3 pt-6">
          <DistanceSlider
            value={sliderDistance}
            onChange={handleSliderChange}
            min={0.5}
            max={50}
            step={0.5}
          />
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-base font-medium" style={{ color: "var(--fg)" }}>
              {sliderDistance.toFixed(1)} km from {KITCHEN_LOCATION.name}
            </p>
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-3">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--fg-muted)" }}
            >
              Distance from kitchen (km)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={manualDistance}
              onChange={(e) => {
                setManualDistance(e.target.value);
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder="e.g. 10.5"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                ...inputStyle,
                borderColor: touched && manualValidation?.status === "error"
                  ? "var(--status-error)"
                  : "var(--border)",
              }}
            />
            {touched && manualValidation && (
              manualValidation.status === "valid" ? (
                <ValidationSuccess message={manualValidation.message} />
              ) : (
                <ValidationError validation={manualValidation} />
              )
            )}
          </div>

          <div
            className="rounded-xl p-4 space-y-2"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--fg-muted)" }}>
              Pricing thresholds:
            </p>
            <ul className="text-xs space-y-1" style={{ color: "var(--fg-subtle)" }}>
              <li>&le;{PRICING.DISTANCE_THRESHOLD_KM} km = ${PRICING.BASE_NEAR.toFixed(2)} base</li>
              <li>&gt;{PRICING.DISTANCE_THRESHOLD_KM} km = ${PRICING.BASE_FAR.toFixed(2)} base</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
