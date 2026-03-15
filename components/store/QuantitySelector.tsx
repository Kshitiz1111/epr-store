"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = Infinity,
  size = "md",
}: QuantitySelectorProps) {
  const isSmall = size === "sm";

  return (
    <div
      className={`flex items-center border border-gray-300 overflow-hidden ${
        isSmall ? "rounded-lg" : "rounded-xl"
      }`}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`hover:bg-gray-100 active:bg-gray-200 transition-colors ${
          isSmall ? "px-2.5 py-1.5" : "px-3 py-2.5"
        }`}
        style={{ color: "#333" }}
      >
        <Minus className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>

      {isSmall ? (
        <span
          className="w-8 text-center text-sm font-semibold"
          style={{ color: "#1a1a1a" }}
        >
          {value}
        </span>
      ) : (
        <input
          type="number"
          value={value}
          onChange={(e) =>
            onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || min)))
          }
          className="w-14 text-center text-sm font-semibold border-x border-gray-300 py-2.5 outline-none"
          style={{ color: "#1a1a1a" }}
          min={min}
          max={max}
        />
      )}

      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`hover:bg-gray-100 active:bg-gray-200 transition-colors ${
          isSmall ? "px-2.5 py-1.5" : "px-3 py-2.5"
        }`}
        style={{ color: "#333" }}
        disabled={value >= max}
      >
        <Plus className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </div>
  );
}
