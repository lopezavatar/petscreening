"use client";

import { useState, useEffect } from "react";

function Cloud({
  x,
  y,
  scale = 1,
  opacity = 0.6,
}: {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}) {
  return (
    <g
      transform={`translate(${x},${y}) scale(${scale})`}
      opacity={opacity}
    >
      <ellipse cx="40" cy="20" rx="30" ry="14" fill="white" />
      <ellipse cx="60" cy="16" rx="22" ry="12" fill="white" />
      <ellipse cx="20" cy="22" rx="18" ry="10" fill="white" />
      <ellipse cx="50" cy="26" rx="35" ry="10" fill="white" />
    </g>
  );
}

export function SkyScene() {
  const [t, setT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setT((p) => p + 1), 50);
    return () => clearInterval(id);
  }, []);

  const droneY = Math.sin(t * 0.04) * 7;

  return (
    <div
      className="w-full"
      style={{
        background:
          "linear-gradient(180deg, #BAE0F9 0%, #E0F0FC 55%, #FDFAF5 100%)",
      }}
    >
      <svg
        viewBox="0 0 390 220"
        style={{ width: "100%", display: "block" }}
        preserveAspectRatio="xMidYMax meet"
      >
        <Cloud x={10} y={20} scale={0.9} opacity={0.5} />
        <Cloud x={230} y={35} scale={0.7} opacity={0.4} />
        <Cloud x={110} y={60} scale={1.1} opacity={0.35} />

        {/* Drone with pie */}
        <g transform={`translate(175, ${50 + droneY})`}>
          <ellipse
            cx="20" cy="8" rx="14" ry="5.5"
            fill="#D97D18" opacity="0.9"
            transform="rotate(-20 20 8)"
          />
          <ellipse
            cx="20" cy="8" rx="14" ry="5.5"
            fill="#D97D18" opacity="0.45"
            transform="rotate(70 20 8)"
          />
          <circle cx="20" cy="8" r="4.5" fill="#8F4A0D" />
          <line x1="20" y1="12" x2="20" y2="26" stroke="#5C3A1E" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="20" cy="32" rx="18" ry="7" fill="#F5BC6E" />
          <path d="M2 32 Q2 50 20 50 Q38 50 38 32 Z" fill="#EF9C38" />
          <ellipse cx="20" cy="32" rx="18" ry="7" fill="none" stroke="#D97D18" strokeWidth="2" />
          <path d="M10 26 Q8 21 10 17" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M20 24 Q18 19 20 15" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <path d="M30 26 Q28 21 30 17" stroke="#BAE0F9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}
