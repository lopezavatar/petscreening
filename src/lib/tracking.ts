export type DeliveryStatus =
  | "preparing"
  | "dispatched"
  | "in_flight"
  | "arriving"
  | "delivered";

export interface TrackingState {
  status: DeliveryStatus;
  progress: number; // 0-100
  etaMinutes: number;
  currentPosition: { lat: number; lon: number };
  startPosition: { lat: number; lon: number };
  endPosition: { lat: number; lon: number };
}

export const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; description: string; progressRange: [number, number] }
> = {
  preparing: {
    label: "Preparing",
    description: "Your order is being prepared in our kitchen",
    progressRange: [0, 15],
  },
  dispatched: {
    label: "Dispatched",
    description: "Your pie is loaded and the drone is ready for takeoff",
    progressRange: [15, 25],
  },
  in_flight: {
    label: "In Flight",
    description: "Your drone is on its way to you",
    progressRange: [25, 85],
  },
  arriving: {
    label: "Arriving",
    description: "Almost there! The drone is approaching your location",
    progressRange: [85, 98],
  },
  delivered: {
    label: "Delivered",
    description: "Your pie has arrived! Enjoy!",
    progressRange: [98, 100],
  },
};

// Calculate status from progress percentage
// BUG: Sometimes skips "arriving" status - the progress check doesn't align properly
export function getStatusFromProgress(progress: number): DeliveryStatus {
  if (progress < 15) return "preparing";
  if (progress < 25) return "dispatched";
  if (progress < 90) return "in_flight"; // BUG: Should be 85, causes skip of "arriving"
  if (progress < 100) return "arriving";
  return "delivered";
}

// BUG: Doesn't account for rain in ETA calculation
// In rain, delivery should take 20% longer but this just returns base time
export function calculateETA(distanceKm: number, isRaining: boolean): number {
  // Base speed: 60 km/h
  const baseSpeedKmh = 60;
  const preparationMinutes = 5;

  // Calculate flight time
  const flightTimeHours = distanceKm / baseSpeedKmh;
  const flightTimeMinutes = flightTimeHours * 60;

  // Note: isRaining parameter is accepted but not used (intentional bug)
  return Math.ceil(preparationMinutes + flightTimeMinutes);
}

// Calculate current position between two points based on progress
export function interpolatePosition(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  progress: number
): { lat: number; lon: number } {
  const t = Math.min(Math.max(progress / 100, 0), 1);
  return {
    lat: start.lat + (end.lat - start.lat) * t,
    lon: start.lon + (end.lon - start.lon) * t,
  };
}

// Progress ranges don't perfectly align with status boundaries (intentional bug)
// This causes the progress bar to sometimes not match the displayed status
export function getProgressForStatus(status: DeliveryStatus, elapsed: number, total: number): number {
  const statusRanges = STATUS_CONFIG[status].progressRange;
  const statusProgress = Math.min((elapsed / total) * 100, 100);

  // BUG: Progress calculation doesn't properly map to status ranges
  // This causes mismatches between progress percentage and status text
  return statusProgress;
}
