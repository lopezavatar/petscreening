"use client";

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function DistanceSlider({
  value,
  onChange,
  min = 0,
  max = 50,
  step = 0.5,
}: DistanceSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  // Step markers
  const markers = [0, 10, 20, 30, 40, 50];

  return (
    <div className="space-y-3">
      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--brand) ${percentage}%, var(--cream-200) ${percentage}%)`,
          }}
        />
        {/* Current value indicator */}
        <div
          className="absolute -top-8 px-2 py-1 rounded text-xs font-medium transform -translate-x-1/2"
          style={{
            left: `${percentage}%`,
            background: "var(--brand)",
            color: "var(--action-fg)",
          }}
        >
          {value.toFixed(1)} km
        </div>
      </div>

      {/* Markers */}
      <div className="flex justify-between text-xs" style={{ color: "var(--fg-muted)" }}>
        {markers.map((marker) => (
          <span key={marker}>{marker} km</span>
        ))}
      </div>

      {/* Threshold indicator */}
      <div className="flex items-center gap-2 text-xs">
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full"
          style={{
            background: value <= 10 ? "#D1F0E2" : "var(--cream-100)",
            color: value <= 10 ? "#1A6B42" : "var(--fg-muted)",
          }}
        >
          <span className="font-medium">
            {value <= 10 ? "$10 base" : "$25 base"}
          </span>
          <span>
            ({value <= 10 ? "within 10km" : "over 10km"})
          </span>
        </div>
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--brand);
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
