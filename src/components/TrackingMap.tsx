"use client";

import { KITCHEN_LOCATION } from "@/lib/constants";

interface TrackingMapProps {
  currentPosition: { lat: number; lon: number };
  destinationPosition: { lat: number; lon: number };
  progress: number;
  isRaining?: boolean;
}

export function TrackingMap({
  currentPosition,
  destinationPosition,
  progress,
  isRaining,
}: TrackingMapProps) {
  // Calculate positions for the map visualization
  // Map kitchen to left side, destination to right side
  const mapWidth = 300;
  const mapHeight = 200;
  const padding = 40;

  const kitchenX = padding;
  const kitchenY = mapHeight / 2;
  const destX = mapWidth - padding;
  const destY = mapHeight / 2;

  // Drone position based on progress
  const droneX = kitchenX + (destX - kitchenX) * (progress / 100);
  const droneY = kitchenY - Math.sin((progress / 100) * Math.PI) * 30; // Arc path

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: isRaining
          ? "linear-gradient(180deg, #6B7B8A 0%, #8FA4B4 50%, #B8C9D4 100%)"
          : "linear-gradient(180deg, #3DAAE8 0%, #7EC8F4 50%, #BAE0F9 100%)",
      }}
    >
      {/* Rain overlay */}
      {isRaining && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              transparent,
              transparent 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 12px
            )`,
            animation: "rain-fall 0.5s linear infinite",
          }}
        />
      )}

      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-48"
        style={{ display: "block" }}
      >
        {/* Ground */}
        <rect x="0" y={mapHeight - 20} width={mapWidth} height="20" fill="#8BC34A" />

        {/* Flight path (dashed line) */}
        <path
          d={`M ${kitchenX} ${kitchenY} Q ${mapWidth / 2} ${kitchenY - 50} ${destX} ${destY}`}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="2"
          strokeDasharray="8 4"
        />

        {/* Progress path (solid) */}
        <path
          d={`M ${kitchenX} ${kitchenY} Q ${mapWidth / 2} ${kitchenY - 50} ${destX} ${destY}`}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
          strokeDasharray={`${progress * 2.5} 1000`}
        />

        {/* Kitchen building */}
        <g transform={`translate(${kitchenX - 15}, ${kitchenY - 20})`}>
          <rect x="0" y="10" width="30" height="25" fill="#8F4A0D" rx="2" />
          <polygon points="0,10 15,-5 30,10" fill="#D97D18" />
          <rect x="10" y="18" width="10" height="17" fill="#5C3A1E" />
          <text
            x="15"
            y="50"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
          >
            PITS
          </text>
        </g>

        {/* Destination marker */}
        <g transform={`translate(${destX}, ${destY})`}>
          <circle r="12" fill="white" opacity="0.9" />
          <circle r="8" fill="var(--brand)" />
          <circle r="3" fill="white" />
          <text
            y="25"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
          >
            You
          </text>
        </g>

        {/* Drone */}
        {progress < 100 && (
          <g
            transform={`translate(${droneX}, ${droneY})`}
            style={{ animation: "drone-bob 2s ease-in-out infinite" }}
          >
            {/* Propellers */}
            <ellipse
              cx="-8"
              cy="-8"
              rx="6"
              ry="2"
              fill="#D97D18"
              opacity="0.7"
              style={{ animation: "spin 0.1s linear infinite" }}
            />
            <ellipse
              cx="8"
              cy="-8"
              rx="6"
              ry="2"
              fill="#D97D18"
              opacity="0.7"
              style={{ animation: "spin 0.1s linear infinite reverse" }}
            />
            {/* Body */}
            <circle r="5" fill="#5C3A1E" />
            {/* Pie box underneath */}
            <rect x="-8" y="2" width="16" height="10" fill="#EF9C38" rx="2" />
            <ellipse cx="0" cy="5" rx="6" ry="3" fill="#F5BC6E" />
          </g>
        )}

        {/* Delivered checkmark */}
        {progress >= 100 && (
          <g transform={`translate(${destX}, ${destY - 20})`}>
            <circle r="12" fill="#2D9E5F" />
            <path
              d="M-4 0l3 3 6-7"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}
      </svg>

      {/* Distance label */}
      <div
        className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium"
        style={{
          background: "rgba(0,0,0,0.5)",
          color: "white",
        }}
      >
        {((100 - progress) / 100 * 10).toFixed(1)} km remaining
      </div>
    </div>
  );
}
