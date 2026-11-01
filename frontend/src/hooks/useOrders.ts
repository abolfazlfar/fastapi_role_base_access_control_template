import { useState, useCallback } from "react";
import { orderService } from "@/services/order.service";
import type { Order, OrderFilter } from "@/types/order.types";
import type { PaginatedResponse } from "@/types/api.types";

export const useOrders = (initialFilter?: OrderFilter) => {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async (filter?: OrderFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrders(filter);
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData: unknown) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await orderService.createOrder(orderData as never);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [newOrder as Order, ...prev.items],
          total: prev.total + 1,
        };
      });
      return newOrder;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchOrders,
    createOrder,
    refetch: () => fetchOrders(initialFilter),
  };
};
