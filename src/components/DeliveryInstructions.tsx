"use client";

import { useState, useEffect, useRef } from "react";
import { ValidationError } from "./ValidationError";
import type { ValidationResult } from "@/types/validation";

interface DeliveryInstructionsProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (valid: boolean) => void;
}

const MAX_CHARS = 200;

function validateInstructions(text: string): ValidationResult {
  if (text.length > MAX_CHARS) {
    return {
      status: "warning",
      message: `Instructions too long (max ${MAX_CHARS} characters)`,
    };
  }
  return { status: "valid", message: "" };
}

export function DeliveryInstructions({
  value,
  onChange,
  onValidationChange,
}: DeliveryInstructionsProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Use ref for callback to avoid infinite loops
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  });

  useEffect(() => {
    const result = validateInstructions(value);
    setValidation(result);
    // Warning is still considered valid for submission
    onValidationChangeRef.current?.(result.status !== "error");
  }, [value]);

  const charCount = value.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Delivery instructions (optional)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Gate code: 1234#. Ring doorbell twice. Leave on porch if no answer."
        rows={3}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none"
        style={{
          borderColor: isOverLimit ? "var(--status-warning)" : "var(--border)",
          background: "var(--bg-raised)",
          fontFamily: "var(--font-body)",
          color: "var(--fg)",
        }}
      />
      <div className="flex justify-between items-center">
        <div>
          {validation && validation.status !== "valid" && (
            <ValidationError validation={validation} />
          )}
        </div>
        <span
          className="text-xs"
          style={{
            color: isOverLimit ? "var(--status-warning)" : "var(--fg-subtle)",
          }}
        >
          {charCount}/{MAX_CHARS} characters
        </span>
      </div>
    </div>
  );
}
