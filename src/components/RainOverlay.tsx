"use client";

import { useRain } from "@/hooks/useRain";

export function RainOverlay() {
  const { isRaining } = useRain();

  if (!isRaining) return null;

  const drops = Array.from({ length: 50 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    animationDuration: `${0.6 + Math.random() * 0.8}s`,
    animationDelay: `${Math.random() * 2}s`,
    opacity: 0.15 + Math.random() * 0.2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 50 }}>
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute w-px"
          style={{
            left: drop.left,
            top: 0,
            height: "15px",
            background: "linear-gradient(to bottom, transparent, #7EC8F4)",
            opacity: drop.opacity,
            animation: `rain-fall ${drop.animationDuration} linear infinite`,
            animationDelay: drop.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
