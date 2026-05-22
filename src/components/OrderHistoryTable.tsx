"use client";

import { useState, useMemo } from "react";
import type { Order } from "@/types/order";
import { ORDERS_PER_PAGE } from "@/lib/mockOrders";
import { OrderRow } from "./OrderRow";
import { OrderFilters, type OrderFilterState } from "./OrderFilters";
import { Pagination } from "./Pagination";

type SortField = "date" | "total";
type SortDirection = "asc" | "desc";

interface OrderHistoryTableProps {
  orders: Order[];
}

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OrderFilterState>({
    status: "all",
    dateFrom: "",
    dateTo: "",
    minTotal: null,
    maxTotal: null,
    searchId: "",
  });

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search by order ID
      if (
        filters.searchId &&
        !order.orderId.toLowerCase().includes(filters.searchId.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }

      // Date range
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59); // End of day
        if (orderDate > toDate) return false;
      }

      // Total range
      const total =
        order.subtotal +
        order.billing.total -
        (order.appliedPromo?.discountAmount || 0) +
        order.tip;
      if (filters.minTotal !== null && total < filters.minTotal) return false;
      if (filters.maxTotal !== null && total > filters.maxTotal) return false;

      return true;
    });
  }, [orders, filters]);

  // Sort orders
  // BUG: Uses unstable sort - orders with same date/total may appear in inconsistent order
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortField === "date") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === "total") {
        const totalA =
          a.subtotal + a.billing.total - (a.appliedPromo?.discountAmount || 0) + a.tip;
        const totalB =
          b.subtotal + b.billing.total - (b.appliedPromo?.discountAmount || 0) + b.tip;
        comparison = totalA - totalB;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
    return sorted;
  }, [filteredOrders, sortField, sortDirection]);

  // Paginate
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return sortedOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [sortedOrders, currentPage]);

  const handleFilterChange = (newFilters: OrderFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const activeFilterCount = [
    filters.status !== "all",
    filters.dateFrom !== "",
    filters.dateTo !== "",
    filters.minTotal !== null,
    filters.maxTotal !== null,
    filters.searchId !== "",
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: showFilters ? "var(--brand)" : "var(--bg-raised)",
              color: showFilters ? "var(--action-fg)" : "var(--fg)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M2 4h12M4 8h8M6 12h4" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span
                className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold"
                style={{
                  background: showFilters ? "var(--action-fg)" : "var(--brand)",
                  color: showFilters ? "var(--brand)" : "var(--action-fg)",
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {sortedOrders.length} {sortedOrders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {/* Sort buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>
            Sort by:
          </span>
          <button
            onClick={() => handleSortChange("date")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: sortField === "date" ? "var(--brand)" : "var(--bg-subtle)",
              color: sortField === "date" ? "var(--action-fg)" : "var(--fg)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Date {sortField === "date" && (sortDirection === "desc" ? "↓" : "↑")}
          </button>
          <button
            onClick={() => handleSortChange("total")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: sortField === "total" ? "var(--brand)" : "var(--bg-subtle)",
              color: sortField === "total" ? "var(--action-fg)" : "var(--fg)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Total {sortField === "total" && (sortDirection === "desc" ? "↓" : "↑")}
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <OrderFilters filters={filters} onChange={handleFilterChange} />
      )}

      {/* Orders list */}
      {paginatedOrders.length > 0 ? (
        <div className="space-y-3">
          {paginatedOrders.map((order) => (
            <OrderRow key={order.orderId} order={order} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-xl"
          style={{ background: "var(--bg-subtle)" }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: "var(--fg)" }}>
            No orders found
          </p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            {activeFilterCount > 0
              ? "Try adjusting your filters"
              : "You haven't placed any orders yet"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {sortedOrders.length > ORDERS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={sortedOrders.length}
          itemsPerPage={ORDERS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
