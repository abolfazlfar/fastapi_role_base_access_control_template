export const routes = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  ORDERS: "/orders",
  DATABASE: "/database",
  NOT_FOUND: "/not-found",
  ROOT: "/",
} as const;

export type RouteName = (typeof routes)[keyof typeof routes];
