import { KITCHEN_LOCATION } from "./constants";
import type { GeocodingResult } from "@/types/order";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: {
      "User-Agent": "PieInTheSky/1.0 (drone-pie-delivery-app)",
    },
  });

  if (!response.ok) return null;

  const data = await response.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function getDistanceFromKitchen(lat: number, lon: number): number {
  return haversineDistance(
    KITCHEN_LOCATION.lat,
    KITCHEN_LOCATION.lon,
    lat,
    lon
  );
}
