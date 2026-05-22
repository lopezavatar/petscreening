"use client";

import { useState, useMemo } from "react";
import type { Product, PieCategory } from "@/types/product";
import { ITEMS_PER_PAGE } from "@/lib/products";
import { useProducts } from "@/hooks/useProducts";
import { PieCard } from "./PieCard";
import { Pagination } from "./Pagination";
import { SortDropdown, type SortOption } from "./SortDropdown";
import { CatalogFilters, type CatalogFilterState } from "./CatalogFilters";

interface PieGridProps {
  onAddToCart: (product: Product, quantity: number) => void;
}

export function PieGrid({ onAddToCart }: PieGridProps) {
  const { products } = useProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>("popularity");
  const [filters, setFilters] = useState<CatalogFilterState>({
    category: "all",
    minPrice: null,
    maxPrice: null,
    availableOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }
      // Price filters
      if (filters.minPrice !== null && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && product.price > filters.maxPrice) {
        return false;
      }
      // Availability filter
      if (filters.availableOnly && !product.available) {
        return false;
      }
      return true;
    });
  }, [filters]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case "popularity":
        sorted.sort((a, b) => b.popularity - a.popularity);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
    }
    return sorted;
  }, [filteredProducts, sortBy]);

  // Paginate
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilters: CatalogFilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    filters.category !== "all",
    filters.minPrice !== null,
    filters.maxPrice !== null,
    filters.availableOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
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
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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
            {sortedProducts.length} {sortedProducts.length === 1 ? "pie" : "pies"}
          </span>
        </div>
        <SortDropdown value={sortBy} onChange={handleSortChange} />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <CatalogFilters filters={filters} onChange={handleFilterChange} />
      )}

      {/* Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((product) => (
            <PieCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-12 rounded-xl"
          style={{ background: "var(--bg-subtle)" }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: "var(--fg)" }}>
            No pies match your filters
          </p>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
            Try adjusting your filters to find more options
          </p>
        </div>
      )}

      {/* Pagination */}
      {sortedProducts.length > ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalItems={sortedProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
