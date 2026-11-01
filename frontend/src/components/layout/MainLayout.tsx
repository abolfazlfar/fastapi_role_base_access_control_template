import React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Database,
  LogOut,
  User,
  Shield,
  Settings,
  Bell,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { routes } from "@/config/routes";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: routes.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { href: routes.ORDERS, label: "Orders", icon: ShoppingCart },
  { href: routes.DATABASE, label: "Database", icon: Database },
  { href: "/roles", label: "Roles & Permissions", icon: Shield, roles: ["admin", "manager"] },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { state } = useAuth();
  const location = useLocation();
  const userRoles = state.user?.roles_token || [];

  return (
    <aside className="hidden lg:flex lg:w-64 flex-col border-r border-slate-200 bg-white">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            FullStack
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems
          .filter((item) => !item.roles || item.roles.some((r) => userRoles.includes(r)))
          .map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "bg-brand-50 text-brand-600 shadow-[0_0_0_1px_rgba(14,165,233,0.15)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-brand-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Link
          to={routes.LOGIN}
          onClick={() => {
            localStorage.clear();
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { state } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 lg:hidden">
          <button
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={onMenuToggle}
          >
            <span className="w-5 h-5 [mask-image:linear-gradient(to_right,#000,#000,_#000_30%,#000_70%,#000),linear-gradient(to_bottom,#000,#000)] [mask-100%] [mask-size:100%_100%,200%_100%] [mask-position:0%_0%,0%_0%] [mask-composite:intersect] [transition:mask-position_0.3s_ease]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900 hidden sm:block">
              {state.user?.username}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm text-slate-900 bg-slate-100 border border-transparent rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all duration-200 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-brand-600 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{state.user?.email}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider">{state.user?.roles_token?.[0] || "user"}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {state.user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:static lg:translate-x-0 border-r border-slate-200 shadow-lg`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 tracking-tight">FullStack</span>
            </div>
            <button
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="w-5 h-5 [mask-image:linear-gradient(to_right,#000,#000,_#000_30%,#000_70%,#000),linear-gradient(to_bottom,#000,#000)] [mask-100%] [mask-size:100%_100%,200%_100%] [mask-position:0%_0%,0%_0%] [mask-composite:intersect] [transition:mask-position_0.3s_ease]">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = typeof window !== "undefined" && window.location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 ${
                    isActive
                      ? "bg-brand-50 text-brand-600 shadow-[0_0_0_1px_rgba(14,165,233,0.15)]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-brand-600"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => {
                localStorage.clear();
                setSidebarOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
