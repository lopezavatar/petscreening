"use client";

import { useState, useRef, useEffect } from "react";

export type SortOption = "popularity" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "Sort";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          background: "var(--bg-raised)",
          border: "1px solid var(--border)",
          color: "var(--fg)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 6h8M6 10h4M7 14h2" />
        </svg>
        {currentLabel}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 150ms ease",
          }}
        >
          <path d="M3 4.5 L6 7.5 L9 4.5" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-lg py-1 z-10"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-elevated)",
          }}
        >
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm transition-colors"
              style={{
                background: option.value === value ? "var(--bg-subtle)" : "transparent",
                color: option.value === value ? "var(--brand)" : "var(--fg)",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
