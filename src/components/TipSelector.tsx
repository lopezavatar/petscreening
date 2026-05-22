"use client";

import { useState, useEffect, useRef } from "react";
import { ValidationError } from "./ValidationError";
import type { ValidationResult } from "@/types/validation";

interface TipSelectorProps {
  orderSubtotal: number;
  tip: number;
  onTipChange: (tip: number) => void;
  onValidationChange?: (valid: boolean) => void;
}

const TIP_PERCENTAGES = [15, 18, 20, 25];
const MAX_TIP = 100;

function validateTip(tip: number | null, rawInput?: string): ValidationResult {
  if (rawInput !== undefined && rawInput !== "" && isNaN(Number(rawInput))) {
    return { status: "error", message: "Please enter a valid amount" };
  }

  if (tip === null || tip === undefined || isNaN(tip)) {
    return { status: "valid", message: "" }; // No tip is valid
  }

  if (tip < 0) {
    return { status: "error", message: "Tip cannot be negative" };
  }

  if (tip > MAX_TIP) {
    return { status: "error", message: `Maximum tip is $${MAX_TIP}` };
  }

  return { status: "valid", message: "" };
}

export function TipSelector({
  orderSubtotal,
  tip,
  onTipChange,
  onValidationChange,
}: TipSelectorProps) {
  const [mode, setMode] = useState<"preset" | "custom" | "none">("preset");
  const [selectedPercent, setSelectedPercent] = useState<number | null>(18);
  const [customAmount, setCustomAmount] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState(false);

  // Use refs for callbacks to avoid infinite loops
  const onTipChangeRef = useRef(onTipChange);
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onTipChangeRef.current = onTipChange;
    onValidationChangeRef.current = onValidationChange;
  });

  useEffect(() => {
    if (mode === "preset" && selectedPercent !== null) {
      const tipAmount = orderSubtotal * (selectedPercent / 100);
      onTipChangeRef.current(Math.round(tipAmount * 100) / 100);
      onValidationChangeRef.current?.(true);
    } else if (mode === "custom") {
      const tipValue = customAmount === "" ? 0 : parseFloat(customAmount);
      const result = validateTip(tipValue, customAmount);
      setValidation(result);
      onValidationChangeRef.current?.(result.status === "valid");
      if (result.status === "valid") {
        onTipChangeRef.current(tipValue);
      }
    } else if (mode === "none") {
      onTipChangeRef.current(0);
      onValidationChangeRef.current?.(true);
    }
  }, [mode, selectedPercent, customAmount, orderSubtotal]);

  const handlePresetClick = (percent: number) => {
    setMode("preset");
    setSelectedPercent(percent);
    setCustomAmount("");
    setTouched(true);
  };

  const handleCustomClick = () => {
    setMode("custom");
    setSelectedPercent(null);
    setTouched(true);
  };

  const handleNoTipClick = () => {
    setMode("none");
    setSelectedPercent(null);
    setCustomAmount("");
    setTouched(true);
  };

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Add a tip for your drone pilot
      </label>

      <div className="flex flex-wrap gap-2">
        {TIP_PERCENTAGES.map((percent) => (
          <button
            key={percent}
            type="button"
            onClick={() => handlePresetClick(percent)}
            className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            style={{
              background:
                mode === "preset" && selectedPercent === percent
                  ? "var(--action)"
                  : "var(--bg-raised)",
              color:
                mode === "preset" && selectedPercent === percent
                  ? "var(--action-fg)"
                  : "var(--fg-muted)",
              border: `1px solid ${
                mode === "preset" && selectedPercent === percent
                  ? "var(--action)"
                  : "var(--border)"
              }`,
              cursor: "pointer",
            }}
          >
            {percent}%
          </button>
        ))}
        <button
          type="button"
          onClick={handleCustomClick}
          className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          style={{
            background: mode === "custom" ? "var(--action)" : "var(--bg-raised)",
            color: mode === "custom" ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${mode === "custom" ? "var(--action)" : "var(--border)"}`,
            cursor: "pointer",
          }}
        >
          Custom
        </button>
        <button
          type="button"
          onClick={handleNoTipClick}
          className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
          style={{
            background: mode === "none" ? "var(--action)" : "var(--bg-raised)",
            color: mode === "none" ? "var(--action-fg)" : "var(--fg-muted)",
            border: `1px solid ${mode === "none" ? "var(--action)" : "var(--border)"}`,
            cursor: "pointer",
          }}
        >
          No tip
        </button>
      </div>

      {mode === "custom" && (
        <div className="pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder="0.00"
              className="w-32 rounded-xl border px-4 py-3 text-sm outline-none"
              style={{
                borderColor:
                  touched && validation?.status === "error"
                    ? "var(--status-error)"
                    : "var(--border)",
                background: "var(--bg-raised)",
                fontFamily: "var(--font-body)",
                color: "var(--fg)",
              }}
            />
          </div>
          {touched && validation && validation.status !== "valid" && (
            <ValidationError validation={validation} />
          )}
        </div>
      )}

      {mode === "preset" && selectedPercent !== null && (
        <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
          ${(orderSubtotal * (selectedPercent / 100)).toFixed(2)} tip
        </p>
      )}
    </div>
  );
}
