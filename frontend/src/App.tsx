import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { routes } from "@/config/routes";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { DatabasePage } from "@/pages/DatabasePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  if (state.isAuthenticated) {
    return <Navigate to={routes.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-brand-50">
      {children}
    </div>
  );
};

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path={routes.LOGIN}
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route index element={<Navigate to={routes.DASHBOARD} replace />} />
                  <Route path={routes.DASHBOARD} element={<DashboardPage />} />
                  <Route path={routes.ORDERS} element={<OrdersPage />} />
                  <Route path={routes.DATABASE} element={<DatabasePage />} />
                  <Route path={routes.NOT_FOUND} element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to={routes.NOT_FOUND} replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthContextProvider>
      <AppContent />
    </AuthContextProvider>
  );
}
