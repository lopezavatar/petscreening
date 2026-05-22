"use client";

import { STATUS_CONFIG, type DeliveryStatus } from "@/lib/tracking";

interface DeliveryProgressProps {
  status: DeliveryStatus;
  progress: number;
  etaMinutes: number;
  isRaining?: boolean;
}

const STATUS_ORDER: DeliveryStatus[] = [
  "preparing",
  "dispatched",
  "in_flight",
  "arriving",
  "delivered",
];

export function DeliveryProgress({
  status,
  progress,
  etaMinutes,
  isRaining,
}: DeliveryProgressProps) {
  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-6">
      {/* ETA */}
      <div className="text-center">
        <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
          Estimated arrival
        </p>
        <p
          className="text-3xl font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--fg)",
          }}
        >
          {etaMinutes <= 0 ? "Now" : `${etaMinutes} min`}
        </p>
        {isRaining && (
          <p className="text-xs mt-1" style={{ color: "var(--sky-600)" }}>
            Weather may affect delivery time
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "var(--cream-200)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background:
                status === "delivered"
                  ? "var(--status-success)"
                  : "var(--brand)",
            }}
          />
        </div>
        {/* BUG: Progress percentage doesn't always match status text */}
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--fg-muted)" }}>{Math.round(progress)}%</span>
          <span style={{ color: "var(--fg-subtle)" }}>
            {STATUS_CONFIG[status].label}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      <div className="space-y-3">
        {STATUS_ORDER.map((s, i) => {
          const config = STATUS_CONFIG[s];
          const isComplete = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isPending = i > currentIndex;

          return (
            <div key={s} className="flex items-start gap-3">
              {/* Status indicator */}
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{
                    background: isComplete
                      ? "var(--status-success)"
                      : isCurrent
                      ? "var(--brand)"
                      : "var(--cream-200)",
                  }}
                >
                  {isComplete ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M2 6l3 3 5-6" />
                    </svg>
                  ) : isCurrent ? (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: "white" }}
                    />
                  ) : null}
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div
                    className="w-0.5 h-8"
                    style={{
                      background: isComplete
                        ? "var(--status-success)"
                        : "var(--cream-200)",
                    }}
                  />
                )}
              </div>

              {/* Status text */}
              <div className="flex-1 pt-0.5">
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isPending ? "var(--fg-subtle)" : "var(--fg)",
                  }}
                >
                  {config.label}
                </p>
                {isCurrent && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                    {config.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
