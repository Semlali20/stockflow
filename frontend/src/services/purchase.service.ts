// frontend/src/services/purchase.service.ts

import { apiClient } from './api';
import type { Supplier, PurchaseOrder } from '../types';

const BASE = '/api';

export const purchaseService = {
  // Suppliers
  getSuppliers: (params?: { page?: number; size?: number; search?: string; status?: string }) =>
    apiClient.get(`${BASE}/suppliers`, { params, silent: true } as any),
  getSupplierById: (id: string) => apiClient.get(`${BASE}/suppliers/${id}`, { silent: true } as any),
  createSupplier: (data: Partial<Supplier>) => apiClient.post(`${BASE}/suppliers`, data),
  updateSupplier: (id: string, data: Partial<Supplier>) => apiClient.put(`${BASE}/suppliers/${id}`, data),
  deleteSupplier: (id: string) => apiClient.delete(`${BASE}/suppliers/${id}`),
  getActiveSuppliers: () => apiClient.get(`${BASE}/suppliers/active`, { silent: true } as any),

  // Purchase Orders
  getPurchaseOrders: (params?: { page?: number; size?: number; status?: string; supplierId?: string }) =>
    apiClient.get(`${BASE}/purchase-orders`, { params, silent: true } as any),
  getPurchaseOrderById: (id: string) => apiClient.get(`${BASE}/purchase-orders/${id}`, { silent: true } as any),
  createPurchaseOrder: (data: any) => apiClient.post(`${BASE}/purchase-orders`, data),
  updatePurchaseOrder: (id: string, data: any) => apiClient.put(`${BASE}/purchase-orders/${id}`, data),
  deletePurchaseOrder: (id: string) => apiClient.delete(`${BASE}/purchase-orders/${id}`),
  confirmOrder: (id: string) => apiClient.post(`${BASE}/purchase-orders/${id}/confirm`),
  sendOrder: (id: string) => apiClient.post(`${BASE}/purchase-orders/${id}/send`),
  receiveOrder: (id: string, data: any) => apiClient.post(`${BASE}/purchase-orders/${id}/receive`, data),
  cancelOrder: (id: string) => apiClient.post(`${BASE}/purchase-orders/${id}/cancel`),
};
