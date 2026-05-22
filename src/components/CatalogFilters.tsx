"use client";

import type { PieCategory } from "@/types/product";
import { CATEGORY_LABELS } from "@/lib/products";

export interface CatalogFilterState {
  category: PieCategory | "all";
  minPrice: number | null;
  maxPrice: number | null;
  availableOnly: boolean;
}

interface CatalogFiltersProps {
  filters: CatalogFilterState;
  onChange: (filters: CatalogFilterState) => void;
}

export function CatalogFilters({ filters, onChange }: CatalogFiltersProps) {
  const handleCategoryChange = (category: PieCategory | "all") => {
    onChange({ ...filters, category });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    onChange({ ...filters, minPrice: value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseFloat(e.target.value);
    onChange({ ...filters, maxPrice: value });
  };

  const handleAvailabilityToggle = () => {
    onChange({ ...filters, availableOnly: !filters.availableOnly });
  };

  const clearFilters = () => {
    onChange({
      category: "all",
      minPrice: null,
      maxPrice: null,
      availableOnly: false,
    });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.availableOnly;

  return (
    <div
      className="p-4 rounded-xl space-y-4"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Category filter */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: filters.category === "all" ? "var(--brand)" : "var(--bg-subtle)",
              color: filters.category === "all" ? "var(--action-fg)" : "var(--fg)",
            }}
          >
            All
          </button>
          {(Object.keys(CATEGORY_LABELS) as PieCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={{
                background: filters.category === cat ? "var(--brand)" : "var(--bg-subtle)",
                color: filters.category === cat ? "var(--action-fg)" : "var(--fg)",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "var(--fg-subtle)" }}
            >
              $
            </span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={handleMinPriceChange}
              min={0}
              step={1}
              className="w-full pl-7 pr-3 py-2 rounded-lg text-sm"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
              }}
            />
          </div>
          <span style={{ color: "var(--fg-subtle)" }}>—</span>
          <div className="relative flex-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: "var(--fg-subtle)" }}
            >
              $
            </span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={handleMaxPriceChange}
              min={0}
              step={1}
              className="w-full pl-7 pr-3 py-2 rounded-lg text-sm"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border)",
                color: "var(--fg)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="flex items-center justify-between">
        <label
          className="text-sm font-medium"
          style={{ color: "var(--fg)" }}
        >
          In Stock Only
        </label>
        <button
          onClick={handleAvailabilityToggle}
          className="relative w-10 h-6 rounded-full transition-colors"
          style={{
            background: filters.availableOnly ? "var(--brand)" : "var(--cream-300)",
          }}
          role="switch"
          aria-checked={filters.availableOnly}
        >
          <div
            className="absolute top-1 w-4 h-4 rounded-full transition-transform"
            style={{
              background: "white",
              left: filters.availableOnly ? "calc(100% - 20px)" : "4px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
        </button>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
          style={{
            background: "var(--bg-subtle)",
            color: "var(--fg-muted)",
            border: "1px solid var(--border)",
          }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
