"use client";

import { useContext } from "react";
import { RainContext } from "@/context/RainContext";

export function useRain() {
  return useContext(RainContext);
}
