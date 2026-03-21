import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { Item, Category, ItemVariant, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const productService = {
  // Items
  getItems: async (params?: PaginationParams): Promise<PaginatedResponse<Item>> => {
    const response = await apiClient.get<PaginatedResponse<Item>>(API_ENDPOINTS.PRODUCTS.ITEMS, { params });
    return response.data;
  },

  getItemById: async (id: string): Promise<Item> => {
    const response = await apiClient.get<Item>(API_ENDPOINTS.PRODUCTS.ITEM_BY_ID(id));
    return response.data;
  },

  createItem: async (data: Partial<Item>): Promise<ApiResponse<Item>> => {
    const response = await apiClient.post<ApiResponse<Item>>(API_ENDPOINTS.PRODUCTS.ITEMS, data);
    return response.data;
  },

  updateItem: async (id: string, data: Partial<Item>): Promise<ApiResponse<Item>> => {
    const response = await apiClient.put<ApiResponse<Item>>(API_ENDPOINTS.PRODUCTS.ITEM_BY_ID(id), data);
    return response.data;
  },

  deleteItem: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.PRODUCTS.ITEM_BY_ID(id));
    return response.data;
  },

  // Categories
  getCategories: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get<PaginatedResponse<Category>>(API_ENDPOINTS.PRODUCTS.CATEGORIES, { params });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<Category>(API_ENDPOINTS.PRODUCTS.CATEGORY_BY_ID(id));
    return response.data;
  },

  createCategory: async (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>(API_ENDPOINTS.PRODUCTS.CATEGORIES, data);
    return response.data;
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put<ApiResponse<Category>>(API_ENDPOINTS.PRODUCTS.CATEGORY_BY_ID(id), data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.PRODUCTS.CATEGORY_BY_ID(id));
    return response.data;
  },

  // Item Variants
  getItemVariants: async (params?: PaginationParams): Promise<PaginatedResponse<ItemVariant>> => {
    const response = await apiClient.get<PaginatedResponse<ItemVariant>>(API_ENDPOINTS.PRODUCTS.ITEM_VARIANTS, { params });
    return response.data;
  },

  getItemVariantById: async (id: string): Promise<ItemVariant> => {
    const response = await apiClient.get<ItemVariant>(API_ENDPOINTS.PRODUCTS.ITEM_VARIANT_BY_ID(id));
    return response.data;
  },

  createItemVariant: async (data: Partial<ItemVariant>): Promise<ApiResponse<ItemVariant>> => {
    const response = await apiClient.post<ApiResponse<ItemVariant>>(API_ENDPOINTS.PRODUCTS.ITEM_VARIANTS, data);
    return response.data;
  },

  updateItemVariant: async (id: string, data: Partial<ItemVariant>): Promise<ApiResponse<ItemVariant>> => {
    const response = await apiClient.put<ApiResponse<ItemVariant>>(API_ENDPOINTS.PRODUCTS.ITEM_VARIANT_BY_ID(id), data);
    return response.data;
  },

  deleteItemVariant: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.PRODUCTS.ITEM_VARIANT_BY_ID(id));
    return response.data;
  },

  // CSV Export/Import - Items
  exportItemsCsv: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.ITEMS_EXPORT_CSV, {
      responseType: 'blob',
    });
    return response.data;
  },

  importItemsCsv: async (file: File): Promise<{ imported: number; failed: number; errors: Array<{ row: number; message: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.ITEMS_IMPORT_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // CSV Export/Import - Categories
  exportCategoriesCsv: async (): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.CATEGORIES_EXPORT_CSV, {
      responseType: 'blob',
    });
    return response.data;
  },

  importCategoriesCsv: async (file: File): Promise<{ imported: number; failed: number; errors: Array<{ row: number; message: string }> }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.CATEGORIES_IMPORT_CSV, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

