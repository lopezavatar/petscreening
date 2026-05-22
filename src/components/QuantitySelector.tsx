"use client";

import { useState, useEffect, useRef } from "react";
import { MIN_QUANTITY, MAX_QUANTITY } from "@/lib/products";
import { ValidationError } from "./ValidationError";
import type { ValidationResult } from "@/types/validation";

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onValidationChange?: (valid: boolean) => void;
}

function validateQuantity(quantity: number | null, rawInput?: string): ValidationResult {
  // Check for non-numeric input
  if (rawInput !== undefined && rawInput !== "" && isNaN(Number(rawInput))) {
    return { status: "error", message: "Please enter a number" };
  }

  if (quantity === null || quantity === undefined) {
    return { status: "error", message: "Please enter a quantity" };
  }

  if (isNaN(quantity)) {
    return { status: "error", message: "Please enter a valid number" };
  }

  if (quantity < MIN_QUANTITY) {
    return { status: "error", message: `Minimum quantity is ${MIN_QUANTITY}` };
  }

  if (quantity > MAX_QUANTITY) {
    return { status: "error", message: `Maximum ${MAX_QUANTITY} pies per order` };
  }

  return { status: "valid", message: "" };
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  onValidationChange,
}: QuantitySelectorProps) {
  const [inputValue, setInputValue] = useState(quantity.toString());
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState(false);

  // Use refs for callbacks to avoid infinite loops
  const onQuantityChangeRef = useRef(onQuantityChange);
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onQuantityChangeRef.current = onQuantityChange;
    onValidationChangeRef.current = onValidationChange;
  });

  // Sync input value with external quantity prop
  useEffect(() => {
    setInputValue(quantity.toString());
  }, [quantity]);

  useEffect(() => {
    const numValue = parseInt(inputValue, 10);
    const result = validateQuantity(isNaN(numValue) ? null : numValue, inputValue);
    setValidation(result);
    onValidationChangeRef.current?.(result.status === "valid");

    if (result.status === "valid") {
      onQuantityChangeRef.current(numValue);
    }
  }, [inputValue]);

  const handleDecrement = () => {
    const current = parseInt(inputValue, 10) || 0;
    const newValue = Math.max(0, current - 1);
    setInputValue(newValue.toString());
    setTouched(true);
  };

  const handleIncrement = () => {
    const current = parseInt(inputValue, 10) || 0;
    const newValue = current + 1;
    setInputValue(newValue.toString());
    setTouched(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setTouched(true);
  };

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Quantity
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => setTouched(true)}
          className="w-20 h-12 rounded-xl border text-center text-lg font-medium outline-none"
          style={{
            borderColor: touched && validation?.status === "error"
              ? "var(--status-error)"
              : "var(--border)",
            background: "var(--bg-raised)",
            fontFamily: "var(--font-body)",
            color: "var(--fg)",
          }}
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-medium transition-all"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
      {touched && validation && validation.status !== "valid" && (
        <ValidationError validation={validation} />
      )}
    </div>
  );
}
