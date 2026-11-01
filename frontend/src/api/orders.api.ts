import { apiClient } from "@/api/apiClient";
import type { Order, OrderCreate, OrderFilter } from "@/types/order.types";
import type { PaginatedResponse } from "@/types/api.types";

export const ordersApi = {
  list: async (filter?: OrderFilter): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams();
    if (filter?.status) params.set("status", filter.status);
    if (filter?.search) params.set("search", filter.search);
    if (filter?.page) params.set("page", String(filter.page));
    if (filter?.page_size) params.set("page_size", String(filter.page_size));

    const response = await apiClient.get<PaginatedResponse<Order>>(
      `/api/v1/orders?${params.toString()}`
    );
    return response.data;
  },

  create: async (data: OrderCreate): Promise<Order> => {
    const response = await apiClient.post<Order>("/api/v1/orders", data);
    return response.data;
  },

  stats: async (): Promise<{ totalOrders: number; totalRevenue: number; pendingOrders: number; shippedOrders: number }> => {
    const response = await apiClient.get<{ totalOrders: number; totalRevenue: number; pendingOrders: number; shippedOrders: number }>(
      "/api/v1/orders/stats"
    );
    return response.data;
  },

  export: async (): Promise<Blob> => {
    const response = await apiClient.get("/api/v1/orders/export", {
      responseType: "blob",
    });
    return response.data as Blob;
  },
};
