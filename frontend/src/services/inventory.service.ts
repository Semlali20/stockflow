
import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';

export interface InventoryCreateRequest {
  itemId: string;
  warehouseId: string;
  locationId: string;
  lotId?: string;
  serialId?: string;
  quantity: number;
  reservedQuantity?: number;
  quantityDamaged?: number;
  uom: string;
  status: string;
  unitCost?: number;
  expiryDate?: string;
  manufactureDate?: string;
  attributes?: string;
}

export interface InventoryUpdateRequest {
  warehouseId?: string;
  locationId?: string;
  lotId?: string;
  serialId?: string;
  quantity?: number;
  reservedQuantity?: number;
  quantityDamaged?: number;
  uom?: string;
  status?: string;
  unitCost?: number;
  expiryDate?: string;
  manufactureDate?: string;
  attributes?: string;
}

export interface LotCreateRequest {
  itemId: string;
  lotNumber: string;
  code: string;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  supplierId?: string | null;
  status: string;
  attributes?: string | null;
}

export interface LotUpdateRequest {
  lotNumber?: string;
  expiryDate?: string | null;
  manufactureDate?: string | null;
  supplierId?: string | null;
  status?: string;
  attributes?: string | null;
}

export interface SerialCreateRequest {
  itemId: string;
  code: string;
  serialNumber: string;
  status: string;
  locationId?: string | null;
}

export interface SerialUpdateRequest {
  serialNumber?: string;
  locationId?: string | null;
  status?: string;
}

export const inventoryService = {
  // ========== INVENTORY OPERATIONS ==========
  
  getAllInventories: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY);
    return response.data;
  },

  getInventory: async (params?: any): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY, { params });
    return response.data;
  },

  getInventoryById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id));
    return response.data;
  },

  createInventory: async (data: InventoryCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.INVENTORY, data);
    return response.data;
  },

  updateInventory: async (id: string, data: InventoryUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id), data);
    return response.data;
  },

  deleteInventory: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.INVENTORY_BY_ID(id));
  },

  getInventoriesByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/item/${itemId}`);
    return response.data;
  },

  getInventoriesByWarehouse: async (warehouseId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/warehouse/${warehouseId}`);
    return response.data;
  },

  getInventoriesByLocation: async (locationId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/location/${locationId}`);
    return response.data;
  },

  getLowStockItems: async (threshold: number = 10): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.INVENTORY}/low-stock`, {
      params: { threshold }
    });
    return response.data;
  },

  // ✅ NEW: Check stock availability
  checkStockAvailability: async (itemId: string, locationId: string, quantity: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(
        `${API_ENDPOINTS.INVENTORY.INVENTORY}/check-availability`,
        {
          params: { itemId, locationId, quantity }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Check availability error:', error);
      return false;
    }
  },

  // ✅ NEW: Get available quantity
  getAvailableQuantity: async (itemId: string, locationId: string): Promise<number> => {
    try {
      const response = await apiClient.get<number>(
        `${API_ENDPOINTS.INVENTORY.INVENTORY}/available-quantity`,
        {
          params: { itemId, locationId }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get available quantity error:', error);
      return 0;
    }
  },

  // ✅ NEW: Get inventory with item details
  getInventoryWithItems: async (locationId: string): Promise<any[]> => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.INVENTORY.INVENTORY}/location/${locationId}/with-items`
      );
      return response.data;
    } catch (error) {
      console.error('Get inventory with items error:', error);
      return [];
    }
  },

  // ✅ NEW: Adjust inventory
  adjustInventory: async (data: {
    itemId: string;
    locationId: string;
    quantityChange: number;
    reason: string;
  }): Promise<any> => {
    try {
      const response = await apiClient.post(
        `${API_ENDPOINTS.INVENTORY.INVENTORY}/adjust`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Adjust inventory error:', error);
      throw error;
    }
  },

  // ========== LOT OPERATIONS ==========
  
  getAllLots: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOTS);
    return response.data;
  },

  getLots: async (params?: any): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOTS, { params });
    return response.data;
  },

  getLotById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
    return response.data;
  },

  createLot: async (data: LotCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.LOTS, data);
    return response.data;
  },

  updateLot: async (id: string, data: LotUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id), data);
    return response.data;
  },

  deleteLot: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.LOT_BY_ID(id));
  },

  getLotsByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.LOTS}/item/${itemId}`);
    return response.data;
  },

  // ========== SERIAL OPERATIONS ==========
  
  getAllSerials: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.SERIALS);
    return response.data;
  },

  getSerials: async (params?: any): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.SERIALS, { params });
    return response.data;
  },

  getSerialById: async (id: string): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
    return response.data;
  },

  createSerial: async (data: SerialCreateRequest): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.SERIALS, data);
    return response.data;
  },

  updateSerial: async (id: string, data: SerialUpdateRequest): Promise<any> => {
    const response = await apiClient.put(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id), data);
    return response.data;
  },

  deleteSerial: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.INVENTORY.SERIAL_BY_ID(id));
  },

  getSerialsByItem: async (itemId: string): Promise<any> => {
    const response = await apiClient.get(`${API_ENDPOINTS.INVENTORY.SERIALS}/item/${itemId}`);
    return response.data;
  },

  // CSV Export/Import - Inventory
  exportInventoryCsv: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.INVENTORY_EXPORT_CSV, { responseType: 'blob' });
    return response.data;
  },

  importInventoryCsv: async (file: File): Promise<{ imported: number; failed: number; errors: Array<{ row: number; message: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.INVENTORY_IMPORT_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // CSV Export/Import - Lots
  exportLotsCsv: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTORY.LOTS_EXPORT_CSV, { responseType: 'blob' });
    return response.data;
  },

  importLotsCsv: async (file: File): Promise<{ imported: number; failed: number; errors: Array<{ row: number; message: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.INVENTORY.LOTS_IMPORT_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};