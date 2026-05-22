"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { isWeekend as checkWeekend } from "date-fns";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { calculateBilling } from "@/lib/billing";
import { calculatePointsEarned } from "@/lib/loyalty";
import { generateOrderId } from "@/lib/orderReference";
import { DistanceInput } from "@/components/DistanceInput";
import { DateTimePicker } from "@/components/DateTimePicker";
import { WeatherToggle } from "@/components/WeatherToggle";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { TipSelector } from "@/components/TipSelector";
import { DeliveryInstructions } from "@/components/DeliveryInstructions";
import { PaymentForm } from "@/components/PaymentForm";
import { BusinessRulesPanel } from "@/components/BusinessRulesPanel";
import type { BillingResult, Order, OrderItem } from "@/types/order";
import type { AppliedPromo } from "@/types/promo";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getSubtotal, getItemCount, updateQuantity, removeFromCart } = useCart();
  const { user, updatePoints } = useAuth();

  const today = format(new Date(), "yyyy-MM-dd");
  const nowTime = format(new Date(), "HH:mm");

  // Form state
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>(today);
  const [deliveryTime, setDeliveryTime] = useState<string>(nowTime);
  const [isWeekend, setIsWeekend] = useState(() => checkWeekend(new Date()));
  const [isRaining, setIsRaining] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [tip, setTip] = useState(0);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentReady, setPaymentReady] = useState(false);
  const [ordering, setOrdering] = useState(false);

  // Validation state
  const [distanceValid, setDistanceValid] = useState(false);
  const [dateValid, setDateValid] = useState(true);
  const [timeValid, setTimeValid] = useState(true);
  const [tipValid, setTipValid] = useState(true);
  const [instructionsValid, setInstructionsValid] = useState(true);

  // Billing calculation
  const [billing, setBilling] = useState<BillingResult | null>(null);

  const pieSubtotal = getSubtotal();
  const itemCount = getItemCount();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/");
    }
  }, [cart.items.length, router]);

  useEffect(() => {
    if (distanceKm !== null && deliveryDate) {
      setBilling(calculateBilling({
        distanceKm,
        isRaining,
        isWeekend,
        loyaltyTier: user?.tier,
      }));
    }
  }, [distanceKm, isRaining, isWeekend, deliveryDate, user?.tier]);

  const handleDistanceResolved = useCallback(
    (km: number, address: string) => {
      setDistanceKm(km);
      setDisplayAddress(address);
    },
    []
  );

  const handleDateTimeChange = useCallback(
    (date: string, time: string, weekend: boolean) => {
      setDeliveryDate(date);
      setDeliveryTime(time);
      setIsWeekend(weekend);
    },
    []
  );

  const handleDateTimeValidation = useCallback(
    (dValid: boolean, tValid: boolean) => {
      setDateValid(dValid);
      setTimeValid(tValid);
    },
    []
  );

  // Calculate totals
  const deliveryCost = billing?.total || 0;
  const promoDiscount = appliedPromo?.discountAmount || 0;
  const grandTotal = pieSubtotal + deliveryCost - promoDiscount + tip;

  const allValid =
    distanceValid &&
    dateValid &&
    timeValid &&
    tipValid &&
    instructionsValid &&
    itemCount >= 1;

  const canOrder = allValid && billing && paymentReady;

  const handleOrder = () => {
    if (!canOrder || !billing) return;
    setOrdering(true);

    const orderItems: OrderItem[] = cart.items.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.product.price,
    }));

    // Calculate points earned (on subtotal before discounts)
    const pointsEarned = user ? calculatePointsEarned(pieSubtotal) : 0;

    const order: Order = {
      orderId: generateOrderId(),
      items: orderItems,
      subtotal: pieSubtotal,
      address: displayAddress,
      displayAddress,
      deliveryDate,
      deliveryTime,
      deliveryInstructions: deliveryInstructions || undefined,
      distanceKm: distanceKm!,
      billing,
      appliedPromo: appliedPromo || undefined,
      tip,
      isRaining,
      createdAt: new Date().toISOString(),
      status: "pending",
      userId: user?.id,
      pointsEarned,
    };

    // Update user's points if logged in
    if (user && pointsEarned > 0) {
      updatePoints(pointsEarned);
    }

    sessionStorage.setItem("pits_order", JSON.stringify(order));
    setTimeout(() => {
      router.push("/confirmation");
    }, 1200);
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full max-w-md mx-auto min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
    >
      {/* Header */}
      <div className="px-7 pt-8 pb-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm"
          style={{
            background: "none",
            border: "none",
            color: "var(--fg-muted)",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <h1
          className="text-xl font-semibold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
          }}
        >
          Checkout
        </h1>
      </div>

      <div className="px-7 pb-12 flex-1 space-y-8">
        {/* Cart summary */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "var(--bg-raised)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="text-xs font-semibold uppercase mb-3"
            style={{ letterSpacing: "0.14em", color: "var(--fg-subtle)" }}
          >
            Your Order ({itemCount} {itemCount === 1 ? "item" : "items"})
          </div>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "var(--fg)" }}>
                    {item.product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded text-sm"
                      style={{
                        background: "var(--bg-subtle)",
                        color: "var(--fg-muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      −
                    </button>
                    <span className="text-sm w-6 text-center" style={{ color: "var(--fg)" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= 10}
                      className="w-6 h-6 flex items-center justify-center rounded text-sm"
                      style={{
                        background: item.quantity >= 10 ? "var(--cream-200)" : "var(--bg-subtle)",
                        color: item.quantity >= 10 ? "var(--fg-subtle)" : "var(--fg-muted)",
                        border: "1px solid var(--border)",
                        cursor: item.quantity >= 10 ? "not-allowed" : "pointer",
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-xs ml-2"
                      style={{ color: "var(--status-error)", background: "none", border: "none" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-medium" style={{ color: "var(--fg)" }}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between items-center pt-3 mt-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <span className="text-sm font-medium" style={{ color: "var(--fg-muted)" }}>
              Subtotal
            </span>
            <span className="font-medium" style={{ color: "var(--fg)" }}>
              ${pieSubtotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Distance input */}
        <DistanceInput
          onDistanceResolved={handleDistanceResolved}
          onValidationChange={setDistanceValid}
        />

        {/* Date & Time */}
        <DateTimePicker
          onDateTimeChange={handleDateTimeChange}
          onValidationChange={handleDateTimeValidation}
        />

        {/* Weather toggle */}
        <WeatherToggle isRaining={isRaining} onRainingChange={setIsRaining} />

        {/* Delivery instructions */}
        <DeliveryInstructions
          value={deliveryInstructions}
          onChange={setDeliveryInstructions}
          onValidationChange={setInstructionsValid}
        />

        {/* Promo code */}
        {billing && (
          <PromoCodeInput
            orderSubtotal={pieSubtotal}
            deliveryCost={deliveryCost}
            appliedPromo={appliedPromo}
            onPromoApplied={setAppliedPromo}
          />
        )}

        {/* Tip */}
        {billing && (
          <TipSelector
            orderSubtotal={pieSubtotal}
            tip={tip}
            onTipChange={setTip}
            onValidationChange={setTipValid}
          />
        )}

        {/* Billing breakdown */}
        {billing && (
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
              Order Summary
            </div>

            <div className="space-y-2">
              {/* Items subtotal */}
              <div
                className="flex justify-between items-center text-sm"
                style={{ color: "var(--fg)" }}
              >
                <span>
                  Items ({itemCount})
                </span>
                <span className="font-medium">${pieSubtotal.toFixed(2)}</span>
              </div>

              {/* Delivery */}
              {billing.lineItems.map((item, i) =>
                item.applies ? (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm"
                    style={{ color: "var(--fg)" }}
                  >
                    <span>{item.label}</span>
                    <span className="font-medium">${item.amount.toFixed(2)}</span>
                  </div>
                ) : null
              )}

              {/* Promo discount */}
              {appliedPromo && (
                <div
                  className="flex justify-between items-center text-sm"
                  style={{ color: "var(--status-success)" }}
                >
                  <span>Promo: {appliedPromo.code}</span>
                  <span className="font-medium">
                    -${appliedPromo.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Tip */}
              {tip > 0 && (
                <div
                  className="flex justify-between items-center text-sm"
                  style={{ color: "var(--fg)" }}
                >
                  <span>Tip</span>
                  <span className="font-medium">${tip.toFixed(2)}</span>
                </div>
              )}
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            <div className="flex justify-between items-baseline">
              <span
                className="text-sm font-medium"
                style={{ color: "var(--fg-muted)" }}
              >
                Total
              </span>
              <span
                className="text-2xl font-light"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--brand)",
                  letterSpacing: "-0.02em",
                }}
              >
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Payment */}
        {billing && <PaymentForm onPaymentReady={setPaymentReady} />}

        {/* Business rules reference */}
        <BusinessRulesPanel />

        {/* Order button */}
        <div className="flex flex-col items-center gap-4 pt-4">
          {!allValid && billing && (
            <p className="text-xs text-center" style={{ color: "var(--status-error)" }}>
              Please fix the validation errors above before ordering
            </p>
          )}
          <button
            onClick={handleOrder}
            disabled={!canOrder || ordering}
            className="relative inline-flex items-center justify-center gap-2.5 text-lg font-semibold uppercase transition-all"
            style={{
              background: !canOrder ? "var(--cream-400)" : "var(--action)",
              color: "var(--action-fg)",
              border: "none",
              cursor: !canOrder ? "not-allowed" : "pointer",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.08em",
              padding: "22px 64px",
              borderRadius: 9999,
              boxShadow: !canOrder ? "none" : "var(--shadow-btn)",
              transform: ordering ? "scale(0.96)" : "scale(1)",
              transition:
                "transform 150ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 300ms ease, background 200ms ease",
              minWidth: 200,
            }}
            onMouseEnter={(e) => {
              if (canOrder && !ordering) {
                e.currentTarget.style.background = "var(--action-hover)";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "var(--shadow-btn-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (canOrder && !ordering) {
                e.currentTarget.style.background = "var(--action)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "var(--shadow-btn)";
              }
            }}
          >
            {ordering ? (
              <>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <g
                    style={{
                      animation: "spin 0.8s linear infinite",
                      transformOrigin: "12px 12px",
                    }}
                  >
                    <path d="M12 2 A10 10 0 0 1 22 12" />
                  </g>
                </svg>
                <span>Placing order...</span>
              </>
            ) : (
              <span>PLACE ORDER</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
