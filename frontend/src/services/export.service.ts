import { downloadFile } from "@/utils/file.utils";
import { ordersApi } from "@/api/orders.api";

export const exportService = {
  exportOrders: async (filename: string = "orders-export.csv"): Promise<void> => {
    try {
      const blob = await ordersApi.export();
      downloadFile(blob, filename);
    } catch (error) {
      throw error;
    }
  },
};
