export interface AppConfig {
  apiBaseUrl: string;
  appName: string;
  version: string;
}

export const appConfig: AppConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  appName: "FullStack Template",
  version: "1.0.0",
};
