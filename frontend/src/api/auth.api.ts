import { apiClient } from "@/api/apiClient";
import type { LoginCredentials, RegisterData, TokenPair } from "@/types/auth.types";
import type { User } from "@/types/auth.types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenPair> => {
    const formData = new FormData();
    formData.append("email", credentials.email);
    formData.append("password", credentials.password);

    const response = await apiClient.post<TokenPair>(
      "/api/v1/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  register: async (data: RegisterData): Promise<TokenPair> => {
    const response = await apiClient.post<TokenPair>(
      "/api/v1/auth/register",
      data
    );
    return response.data;
  },

  refresh: async (): Promise<TokenPair> => {
    const response = await apiClient.post<TokenPair>("/api/v1/auth/refresh");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/v1/auth/logout");
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/v1/auth/me");
    return response.data;
  },
};
