import { apiClient } from './api';
import { API_ENDPOINTS } from '@/config/constants';
import { Location, Site, Warehouse, PaginatedResponse, PaginationParams, ApiResponse } from '@/types';

export const locationService = {
  // Locations
  getLocations: async (params?: PaginationParams): Promise<any> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.LOCATIONS.LOCATIONS, { params });
    return response.data;
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await apiClient.get<Location>(API_ENDPOINTS.LOCATIONS.LOCATION_BY_ID(id));
    return response.data;
  },

  createLocation: async (data: Partial<Location>): Promise<ApiResponse<Location>> => {
    const response = await apiClient.post<ApiResponse<Location>>(API_ENDPOINTS.LOCATIONS.LOCATIONS, data);
    return response.data;
  },

  updateLocation: async (id: string, data: Partial<Location>): Promise<ApiResponse<Location>> => {
    const response = await apiClient.put<ApiResponse<Location>>(API_ENDPOINTS.LOCATIONS.LOCATION_BY_ID(id), data);
    return response.data;
  },

  deleteLocation: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.LOCATIONS.LOCATION_BY_ID(id));
    return response.data;
  },
  getLocationsByWarehouse: async (warehouseId: string): Promise<any> => {
    const response = await apiClient.get('/api/locations', {
      params: { warehouseId }  // ✅ Use query parameter instead
    });
    return response.data;
  },
  // Sites
  getSites: async (params?: PaginationParams): Promise<PaginatedResponse<Site>> => {
    const response = await apiClient.get<PaginatedResponse<Site>>(API_ENDPOINTS.LOCATIONS.SITES, { params });
    return response.data;
  },

  getSiteById: async (id: string): Promise<Site> => {
    const response = await apiClient.get<Site>(API_ENDPOINTS.LOCATIONS.SITE_BY_ID(id));
    return response.data;
  },

  createSite: async (data: Partial<Site>): Promise<ApiResponse<Site>> => {
    const response = await apiClient.post<ApiResponse<Site>>(API_ENDPOINTS.LOCATIONS.SITES, data);
    return response.data;
  },

  updateSite: async (id: string, data: Partial<Site>): Promise<ApiResponse<Site>> => {
    const response = await apiClient.put<ApiResponse<Site>>(API_ENDPOINTS.LOCATIONS.SITE_BY_ID(id), data);
    return response.data;
  },

  deleteSite: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.LOCATIONS.SITE_BY_ID(id));
    return response.data;
  },

  // Warehouses
  getWarehouses: async (params?: PaginationParams): Promise<PaginatedResponse<Warehouse>> => {
    const response = await apiClient.get<PaginatedResponse<Warehouse>>(API_ENDPOINTS.LOCATIONS.WAREHOUSES, { params });
    return response.data;
  },

  getWarehouseById: async (id: string): Promise<Warehouse> => {
    const response = await apiClient.get<Warehouse>(API_ENDPOINTS.LOCATIONS.WAREHOUSE_BY_ID(id));
    return response.data;
  },

  createWarehouse: async (data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
    const response = await apiClient.post<ApiResponse<Warehouse>>(API_ENDPOINTS.LOCATIONS.WAREHOUSES, data);
    return response.data;
  },

  updateWarehouse: async (id: string, data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
    const response = await apiClient.put<ApiResponse<Warehouse>>(API_ENDPOINTS.LOCATIONS.WAREHOUSE_BY_ID(id), data);
    return response.data;
  },

  deleteWarehouse: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.LOCATIONS.WAREHOUSE_BY_ID(id));
    return response.data;
  },
};

