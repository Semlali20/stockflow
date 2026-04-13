// frontend/src/services/sales.service.ts

import { apiClient } from './api';
import type { Customer } from '../types';

const BASE = '/api';

export const salesService = {
  // Customers
  getCustomers: (params?: { page?: number; size?: number; search?: string; status?: string }) =>
    apiClient.get(`${BASE}/customers`, { params, silent: true } as any),
  getCustomerById: (id: string) => apiClient.get(`${BASE}/customers/${id}`, { silent: true } as any),
  createCustomer: (data: Partial<Customer>) => apiClient.post(`${BASE}/customers`, data),
  updateCustomer: (id: string, data: Partial<Customer>) => apiClient.put(`${BASE}/customers/${id}`, data),
  deleteCustomer: (id: string) => apiClient.delete(`${BASE}/customers/${id}`),
  getActiveCustomers: () => apiClient.get(`${BASE}/customers/active`, { silent: true } as any),

  // Quotes
  getQuotes: (params?: { page?: number; size?: number; status?: string; customerId?: string }) =>
    apiClient.get(`${BASE}/quotes`, { params, silent: true } as any),
  getQuoteById: (id: string) => apiClient.get(`${BASE}/quotes/${id}`, { silent: true } as any),
  createQuote: (data: any) => apiClient.post(`${BASE}/quotes`, data),
  updateQuote: (id: string, data: any) => apiClient.put(`${BASE}/quotes/${id}`, data),
  deleteQuote: (id: string) => apiClient.delete(`${BASE}/quotes/${id}`),
  sendQuote: (id: string) => apiClient.post(`${BASE}/quotes/${id}/send`),
  acceptQuote: (id: string) => apiClient.post(`${BASE}/quotes/${id}/accept`),
  rejectQuote: (id: string) => apiClient.post(`${BASE}/quotes/${id}/reject`),
  convertToDelivery: (id: string, data: any) => apiClient.post(`${BASE}/quotes/${id}/convert-to-delivery`, data),

  // Delivery Notes
  getDeliveryNotes: (params?: { page?: number; size?: number; status?: string; customerId?: string }) =>
    apiClient.get(`${BASE}/delivery-notes`, { params, silent: true } as any),
  getDeliveryNoteById: (id: string) => apiClient.get(`${BASE}/delivery-notes/${id}`, { silent: true } as any),
  createDeliveryNote: (data: any) => apiClient.post(`${BASE}/delivery-notes`, data),
  updateDeliveryNote: (id: string, data: any) => apiClient.put(`${BASE}/delivery-notes/${id}`, data),
  deleteDeliveryNote: (id: string) => apiClient.delete(`${BASE}/delivery-notes/${id}`),
  validateDeliveryNote: (id: string) => apiClient.post(`${BASE}/delivery-notes/${id}/validate`),
};
