import React from "react";
import { LayoutDashboard, Activity, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
  trend,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
          </div>
          <p className={`text-xs font-medium mt-2 ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-slate-500"
          }`}>
            {change}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { state } = useAuth();

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.80",
      icon: TrendingUp,
      color: "bg-brand-100 text-brand-600",
      change: "+12.5% from last month",
      trend: "up" as const,
    },
    {
      title: "Active Users",
      value: "1,240",
      icon: Users,
      color: "bg-emerald-100 text-emerald-600",
      change: "+8.3% from last month",
      trend: "up" as const,
    },
    {
      title: "Orders",
      value: "342",
      icon: LayoutDashboard,
      color: "bg-blue-100 text-blue-600",
      change: "+5.1% from last month",
      trend: "up" as const,
    },
    {
      title: "System Health",
      value: "99.8%",
      icon: Activity,
      color: "bg-purple-100 text-purple-600",
      change: "All systems operational",
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome back, {state.user?.username}</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Export Report
          </button>
          <button className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-slate-50 rounded-xl hover:bg-brand-50 text-brand-600 text-sm font-medium transition-colors border border-transparent">
              <LayoutDashboard className="w-4 h-4" />
              View Analytics
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-slate-50 rounded-xl hover:bg-brand-50 text-brand-600 text-sm font-medium transition-colors border border-transparent">
              <Users className="w-4 h-4" />
              Manage Users
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-slate-50 rounded-xl hover:bg-brand-50 text-brand-600 text-sm font-medium transition-colors border border-transparent">
              <TrendingUp className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Info</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 text-sm">
                {state.user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{state.user?.username}</p>
                <p className="text-xs text-slate-500">{state.user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</p>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {state.user?.roles_token?.[0] || "user"}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</p>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">User #{100 + i} logged in</p>
                  <p className="text-xs text-slate-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
