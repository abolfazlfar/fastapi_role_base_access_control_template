import React from "react";
import { formatCurrency } from "@/utils/data.utils";

interface OrderSummaryProps {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    shippedOrders: number;
  };
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ stats }) => {
  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "📦",
      color: "bg-blue-500",
      change: "+12% from last month",
      trend: "up" as const,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: "💰",
      color: "bg-emerald-500",
      change: "+8.5% from last month",
      trend: "up" as const,
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: "⏳",
      color: "bg-amber-500",
      change: "-5 from last month",
      trend: "down" as const,
    },
    {
      title: "Shipped Orders",
      value: stats.shippedOrders,
      icon: "🚚",
      color: "bg-purple-500",
      change: "+22% from last month",
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl border border-slate-100 shadow-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.title}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-slate-900">{card.value}</span>
              </div>
              <p className={`text-xs font-medium mt-2 ${
                card.trend === "up" ? "text-emerald-600" : "text-rose-600"
              }`}>
                {card.change}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} text-white`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
