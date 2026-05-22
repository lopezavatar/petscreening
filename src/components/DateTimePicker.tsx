"use client";

import { useState, useEffect, useRef } from "react";
import { isWeekend, format, isBefore, startOfDay, parseISO } from "date-fns";
import { ValidationError, ValidationSuccess } from "./ValidationError";
import type { ValidationResult } from "@/types/validation";

interface DateTimePickerProps {
  onDateTimeChange: (date: string, time: string, weekend: boolean) => void;
  onValidationChange?: (dateValid: boolean, timeValid: boolean) => void;
}

const DELIVERY_START_HOUR = 8; // 8 AM
const DELIVERY_END_HOUR = 22; // 10 PM

function validateDate(dateString: string): ValidationResult {
  if (!dateString) {
    return { status: "error", message: "Please select a delivery date" };
  }

  const selectedDate = startOfDay(parseISO(dateString));
  const today = startOfDay(new Date());

  if (isBefore(selectedDate, today)) {
    return { status: "error", message: "This date is in the past. Delivery not available." };
  }

  return { status: "valid", message: "Available for delivery" };
}

function validateTime(timeString: string): ValidationResult {
  if (!timeString) {
    return { status: "error", message: "Please select a delivery time" };
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const timeInMinutes = hours * 60 + minutes;
  const startInMinutes = DELIVERY_START_HOUR * 60;
  const endInMinutes = DELIVERY_END_HOUR * 60;

  if (timeInMinutes < startInMinutes || timeInMinutes > endInMinutes) {
    return {
      status: "error",
      message: `Outside delivery hours (${DELIVERY_START_HOUR} AM - ${DELIVERY_END_HOUR > 12 ? DELIVERY_END_HOUR - 12 : DELIVERY_END_HOUR} ${DELIVERY_END_HOUR >= 12 ? "PM" : "AM"})`,
    };
  }

  return { status: "valid", message: "Within delivery window" };
}

export function DateTimePicker({ onDateTimeChange, onValidationChange }: DateTimePickerProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const nowTime = format(new Date(), "HH:mm");

  const [date, setDate] = useState(today);
  const [time, setTime] = useState(nowTime);
  const [dateValidation, setDateValidation] = useState<ValidationResult | null>(null);
  const [timeValidation, setTimeValidation] = useState<ValidationResult | null>(null);
  const [touched, setTouched] = useState({ date: false, time: false });

  // Use refs for callbacks to avoid infinite loops
  const onDateTimeChangeRef = useRef(onDateTimeChange);
  const onValidationChangeRef = useRef(onValidationChange);

  useEffect(() => {
    onDateTimeChangeRef.current = onDateTimeChange;
    onValidationChangeRef.current = onValidationChange;
  });

  // BUG: Uses UTC time for weekend check instead of local timezone
  // This can cause incorrect weekend detection for users in certain timezones
  // e.g., Friday 11PM in PST is Saturday in UTC
  const selectedIsWeekend = date ? isWeekend(new Date(date)) : false;

  useEffect(() => {
    if (date && time) {
      onDateTimeChangeRef.current(date, time, selectedIsWeekend);
    }

    // Validate on change
    const dateResult = validateDate(date);
    const timeResult = validateTime(time);
    setDateValidation(dateResult);
    setTimeValidation(timeResult);

    onValidationChangeRef.current?.(dateResult.status === "valid", timeResult.status === "valid");
  }, [date, time, selectedIsWeekend]);

  return (
    <div className="space-y-3">
      <label
        className="block text-sm font-medium"
        style={{ letterSpacing: "0.06em", color: "var(--fg-muted)" }}
      >
        Delivery date and time
      </label>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setTouched((t) => ({ ...t, date: true }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{
              borderColor: touched.date && dateValidation?.status === "error"
                ? "var(--status-error)"
                : "var(--border)",
              background: "var(--bg-raised)",
              fontFamily: "var(--font-body)",
              color: "var(--fg)",
            }}
          />
          {touched.date && dateValidation && (
            dateValidation.status === "valid" ? (
              <ValidationSuccess message={dateValidation.message} />
            ) : (
              <ValidationError validation={dateValidation} />
            )
          )}
        </div>
        <div className="flex-1">
          <input
            type="time"
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              setTouched((t) => ({ ...t, time: true }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, time: true }))}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={{
              borderColor: touched.time && timeValidation?.status === "error"
                ? "var(--status-error)"
                : "var(--border)",
              background: "var(--bg-raised)",
              fontFamily: "var(--font-body)",
              color: "var(--fg)",
            }}
          />
          {touched.time && timeValidation && (
            timeValidation.status === "valid" ? (
              <ValidationSuccess message={timeValidation.message} />
            ) : (
              <ValidationError validation={timeValidation} />
            )
          )}
        </div>
      </div>

      {selectedIsWeekend && (
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1.5 self-start inline-flex"
          style={{
            background: "var(--crust-100)",
            color: "var(--crust-700)",
          }}
        >
          <span className="text-xs font-semibold">Weekend rate applies</span>
        </div>
      )}
    </div>
  );
}
