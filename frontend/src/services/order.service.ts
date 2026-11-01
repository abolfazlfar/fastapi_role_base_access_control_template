import { ordersApi } from "@/api/orders.api";
import type { OrderCreate, OrderFilter } from "@/types/order.types";

export const orderService = {
  getOrders: async (filter?: OrderFilter) => ordersApi.list(filter),
  createOrder: async (data: OrderCreate) => ordersApi.create(data),
  getStats: async () => ordersApi.stats(),
};
