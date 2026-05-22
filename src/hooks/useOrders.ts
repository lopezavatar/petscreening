"use client";

import { useState, useEffect, useCallback } from "react";
import type { Order } from "@/types/order";

interface UseOrdersOptions {
  userId?: string;
}

export function useOrders({ userId }: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ userId });
      const res = await fetch(`/api/orders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setError(null);
      } else {
        setError("Failed to fetch orders");
        setOrders([]);
      }
    } catch {
      setError("Failed to fetch orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}
