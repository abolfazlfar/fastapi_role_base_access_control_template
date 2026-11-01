import React from "react";
import { Database, User, Shield, CreditCard } from "lucide-react";

export const DatabasePage: React.FC = () => {
  const tables = [
    {
      name: "users",
      icon: User,
      rows: 1240,
      size: "2.4 MB",
      status: "active",
    },
    {
      name: "roles",
      icon: Shield,
      rows: 5,
      size: "45 KB",
      status: "active",
    },
    {
      name: "permissions",
      icon: Shield,
      rows: 12,
      size: "89 KB",
      status: "active",
    },
    {
      name: "orders",
      icon: CreditCard,
      rows: 3420,
      size: "1.8 MB",
      status: "active",
    },
    {
      name: "refresh_tokens",
      icon: CreditCard,
      rows: 890,
      size: "150 KB",
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Database</h1>
          <p className="text-slate-600">Manage your database tables and schema</p>
        </div>
        <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Refresh Schema
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">Tables</h2>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search tables..."
              className="w-full pl-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rows</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tables.map((table) => (
                <tr key={table.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 text-sm">
                      <table.icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-slate-900">{table.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{table.rows}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{table.size}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {table.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-brand-600 font-medium hover:text-brand-700">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
