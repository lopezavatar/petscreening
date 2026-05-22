"use client";

import { createContext, useState, useEffect, type ReactNode } from "react";
import { isCurrentlyRaining } from "@/lib/rain";

export const RainContext = createContext<{ isRaining: boolean }>({
  isRaining: false,
});

async function fetchWeatherStatus(): Promise<boolean> {
  try {
    const res = await fetch("/api/weather");
    if (res.ok) {
      const data = await res.json();
      return data.isRaining;
    }
  } catch {
    // API not available, fall back to computed
  }
  return isCurrentlyRaining();
}

export function RainProvider({ children }: { children: ReactNode }) {
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchWeatherStatus().then(setIsRaining);

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchWeatherStatus().then(setIsRaining);
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RainContext.Provider value={{ isRaining }}>{children}</RainContext.Provider>
  );
}
