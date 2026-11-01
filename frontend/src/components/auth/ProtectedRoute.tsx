import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { state, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (roles && roles.length > 0) {
    const userRoles = state.user?.roles_token || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-6">
          <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-12a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-1 text-sm text-slate-600">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
  }

  return <>{children}</>;
};
