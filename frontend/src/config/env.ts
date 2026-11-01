export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    REFRESH: "/api/v1/auth/refresh",
    LOGOUT: "/api/v1/auth/logout",
    ME: "/api/v1/auth/me",
  },
  HEALTH: {
    CHECK: "/health",
  },
  ORDERS: {
    LIST: "/api/v1/orders",
    CREATE: "/api/v1/orders",
    EXPORT: "/api/v1/orders/export",
  },
} as const;
