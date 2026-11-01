import { apiClient } from "@/api/apiClient";

export const healthApi = {
  check: async (): Promise<{ status: string; env?: string }> => {
    const response = await apiClient.get<{ status: string; env?: string }>(
      "/health"
    );
    return response.data;
  },
};
