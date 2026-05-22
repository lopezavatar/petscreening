"use client";

import { useRain } from "@/hooks/useRain";

export function RainBanner() {
  const { isRaining } = useRain();

  if (!isRaining) return null;

  return (
    <div
      className="w-full text-center py-2.5 px-4 text-sm font-medium"
      style={{
        background: "linear-gradient(90deg, #BAE0F9, #E0F0FC)",
        color: "var(--sky-700)",
      }}
    >
      It&apos;s raining — drone waterproofing fee applies (+$10.00)
    </div>
  );
}
