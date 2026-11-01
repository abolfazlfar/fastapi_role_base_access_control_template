export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderCreate {
  customer_name: string;
  customer_email: string;
  items: OrderItemCreate[];
}

export interface OrderItemCreate {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderFilter {
  status?: Order["status"];
  search?: string;
  page?: number;
  page_size?: number;
}

export interface OrderStats {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  shipped_orders: number;
  cancelled_orders: number;
}
