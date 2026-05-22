"use client";

import type { ValidationResult } from "@/types/validation";

interface ValidationErrorProps {
  validation: ValidationResult | null;
}

export function ValidationError({ validation }: ValidationErrorProps) {
  if (!validation || validation.status === "valid") return null;

  const isError = validation.status === "error";

  return (
    <div
      className="flex items-start gap-2 text-sm mt-2"
      style={{
        color: isError ? "var(--status-error)" : "var(--status-warning)",
      }}
    >
      <span className="flex-shrink-0">{isError ? "⛔" : "⚠️"}</span>
      <span>{validation.message}</span>
    </div>
  );
}

export function ValidationSuccess({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 text-sm mt-2"
      style={{ color: "var(--status-success)" }}
    >
      <span className="flex-shrink-0">✓</span>
      <span>{message}</span>
    </div>
  );
}
