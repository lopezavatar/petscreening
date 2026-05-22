"use client";

import { useState } from "react";
import { geocodeAddress, getDistanceFromKitchen } from "@/lib/geocoding";
import type { GeocodingResult } from "@/types/order";

interface UseGeocodingReturn {
  result: GeocodingResult | null;
  distanceKm: number | null;
  loading: boolean;
  error: string | null;
  lookup: (address: string) => Promise<void>;
}

export function useGeocoding(): UseGeocodingReturn {
  const [result, setResult] = useState<GeocodingResult | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = async (address: string) => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const geocoded = await geocodeAddress(address);
      if (!geocoded) {
        setError("Could not find that address. Try a more specific location.");
        setResult(null);
        setDistanceKm(null);
        return;
      }

      const distance = getDistanceFromKitchen(geocoded.lat, geocoded.lon);
      setResult(geocoded);
      setDistanceKm(distance);
    } catch {
      setError("Something went wrong looking up that address. Try again.");
      setResult(null);
      setDistanceKm(null);
    } finally {
      setLoading(false);
    }
  };

  return { result, distanceKm, loading, error, lookup };
}
