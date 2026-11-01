export const APP_NAME = "FullStack Template";
export const APP_DESCRIPTION = "Modern Full-Stack JWT RBAC Template";

export const THEME = {
  primary: "#0ea5e9",
  primaryHover: "#0284c7",
  dark: "#0f172a",
  light: "#f8fafc",
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ORDERS: "/orders",
  DATABASE: "/database",
  NOT_FOUND: "/not-found",
} as const;
