import React from "react";
import { OrderSummary, OrderTable } from "@/components/orders";
import { useOrders } from "@/hooks/useOrders";
import type { OrderFilter } from "@/types/order.types";
import { exportService } from "@/services/export.service";

export const OrdersPage: React.FC = () => {
  const [filter, setFilter] = React.useState<OrderFilter>({ page: 1, page_size: 10 });
  const { data, loading, error, fetchOrders } = useOrders(filter);

  React.useEffect(() => {
    fetchOrders(filter);
  }, [filter, fetchOrders]);

  const handleExport = async () => {
    try {
      await exportService.exportOrders();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Export failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-600">Manage customer orders</p>
        </div>
        <button
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">All Orders</h2>
              <select
                className="text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:ring-2 focus:ring-brand-500 outline-none"
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <OrderTable
              orders={data?.items || []}
              onExport={handleExport}
            />
            {loading && (
              <div className="p-4 text-center text-slate-500 text-sm">Loading...</div>
            )}
            {error && (
              <div className="p-4 text-center text-red-600 text-sm">{error}</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            stats={{
              totalOrders: data?.total || 0,
              totalRevenue: data?.items?.reduce((sum, o) => sum + o.total, 0) || 0,
              pendingOrders: data?.items?.filter((o) => o.status === "pending").length || 0,
              shippedOrders: data?.items?.filter((o) => o.status === "shipped").length || 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};
