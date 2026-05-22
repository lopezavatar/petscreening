"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/types/product";
import { PIE_CATALOG } from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(PIE_CATALOG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setProducts(data);
            setError(null);
          }
        } else {
          // Fall back to local data
          if (!cancelled) {
            setProducts(PIE_CATALOG);
          }
        }
      } catch {
        // Fall back to local data
        if (!cancelled) {
          setProducts(PIE_CATALOG);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setError(null);
      }
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, error, refetch };
}
