"use client";

import type { OrderStatus } from "@/types/order";
import { STATUS_LABELS } from "@/lib/mockOrders";

export interface OrderFilterState {
  status: OrderStatus | "all";
  dateFrom: string;
  dateTo: string;
  minTotal: number | null;
  maxTotal: number | null;
  searchId: string;
}

interface OrderFiltersProps {
  filters: OrderFilterState;
  onChange: (filters: OrderFilterState) => void;
}

export function OrderFilters({ filters, onChange }: OrderFiltersProps) {
  const clearFilters = () => {
    onChange({
      status: "all",
      dateFrom: "",
      dateTo: "",
      minTotal: null,
      maxTotal: null,
      searchId: "",
    });
  };

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.minTotal !== null ||
    filters.maxTotal !== null ||
    filters.searchId !== "";

  return (
    <div
      className="p-4 rounded-xl space-y-4"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Search by order ID */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Search Order ID
        </label>
        <input
          type="text"
          placeholder="PIE-XXXXXX"
          value={filters.searchId}
          onChange={(e) => onChange({ ...filters, searchId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        />
      </div>

      {/* Status filter */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Status
        </label>
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as OrderStatus | "all" })
          }
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            color: "var(--fg)",
          }}
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Date Range
        </label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          />
          <span style={{ color: "var(--fg-subtle)" }}>to</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            className="flex-1 px-3 py-2 rounded-lg text-sm"
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      {/* Price range */}
      <div>
        <label
          className="block text-xs font-semibold uppercase mb-2"
          style={{ letterSpacing: "0.1em", color: "var(--fg-subtle)" }}
        >
          Total Range
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
              value={filters.minTotal ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minTotal: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
              min={0}
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
              value={filters.maxTotal ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxTotal: e.target.value === "" ? null : parseFloat(e.target.value),
                })
              }
              min={0}
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
