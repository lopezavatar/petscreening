"use client";

import { useState } from "react";

interface PaymentFormProps {
  onPaymentReady: (ready: boolean) => void;
}

export function PaymentForm({ onPaymentReady }: PaymentFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      return digits.slice(0, 2) + " / " + digits.slice(2);
    }
    return digits;
  };

  const handleCardChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);
    checkReady(formatted, expiry, cvv, name);
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiry(value);
    setExpiry(formatted);
    checkReady(cardNumber, formatted, cvv, name);
  };

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCvv(digits);
    checkReady(cardNumber, expiry, digits, name);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    checkReady(cardNumber, expiry, cvv, value);
  };

  const checkReady = (card: string, exp: string, cv: string, nm: string) => {
    const cardDigits = card.replace(/\s/g, "");
    const expDigits = exp.replace(/\D/g, "");
    const ready =
      cardDigits.length >= 13 &&
      expDigits.length === 4 &&
      cv.length >= 3 &&
      nm.trim().length > 0;
    onPaymentReady(ready);
  };

  const inputStyle = {
    borderColor: "var(--border)",
    background: "var(--bg-raised)",
    fontFamily: "var(--font-body)",
    color: "var(--fg)",
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: "var(--bg-raised)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="text-xs font-semibold uppercase"
        style={{ letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
      >
        Payment
      </div>

      <div className="space-y-3">
        {/* Name on card */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "var(--fg-muted)" }}
          >
            Name on card
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="J. Doe"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Card number */}
        <div>
          <label
            className="block text-xs font-medium mb-1"
            style={{ color: "var(--fg-muted)" }}
          >
            Card number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => handleCardChange(e.target.value)}
            placeholder="4242 4242 4242 4242"
            inputMode="numeric"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>

        {/* Expiry + CVV row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Expiry
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM / YY"
              inputMode="numeric"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
          <div className="w-24">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: "var(--fg-muted)" }}
            >
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              placeholder="123"
              inputMode="numeric"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      <p className="text-xs" style={{ color: "var(--fg-subtle)" }}>
        This is a demo. No real charges will be made.
      </p>
    </div>
  );
}
