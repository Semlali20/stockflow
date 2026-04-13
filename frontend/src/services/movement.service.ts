// frontend/src/services/movement.service.ts
// ✅ COMPLETE - Follows Project Architecture Pattern

import { apiClient } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/constants';
import { 
  Movement, 
  MovementLine, 
  MovementTask,
  MovementRequestDto,
  MovementLineRequestDto,
  MovementTaskRequestDto,
  MovementStatus,
  MovementType,
  PaginatedResponse, 
  PaginationParams, 
  ApiResponse 
} from '@/types';
import { storage } from '@/utils/storage';

// ============================================
// HELPER FUNCTION - Get User ID for Headers
// ============================================
const getUserHeaders = (): Record<string, string> => {
  const user = storage.get<any>(STORAGE_KEYS.USER);
  const userId = user?.id || user?.userId;
  return userId ? { 'X-User-Id': userId } : {};
};

export const movementService = {
  // ========================================
  // MOVEMENTS - CRUD OPERATIONS
  // ========================================

  /**
   * Get all movements with pagination
   */
  getMovements: async (params?: PaginationParams): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENTS, 
      { params }
    );
    return response.data;
  },

  /**
   * Get movement by ID
   */
  getMovementById: async (id: string): Promise<Movement> => {
    const response = await apiClient.get<Movement>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)
    );
    return response.data;
  },

  /**
   * Get movement by reference number
   */
  getMovementByReferenceNumber: async (referenceNumber: string): Promise<Movement> => {
    const response = await apiClient.get<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/reference/${referenceNumber}`
    );
    return response.data;
  },

  /**
   * Create a new movement
   */
  createMovement: async (data: MovementRequestDto): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.post<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENTS,
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Update movement
   */
  updateMovement: async (id: string, data: Partial<MovementRequestDto>): Promise<ApiResponse<Movement>> => {
    const response = await apiClient.put<ApiResponse<Movement>>(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id),
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Delete movement (only DRAFT or CANCELLED)
   */
  deleteMovement: async (id: string): Promise<void> => {
    await apiClient.delete(
      API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id),
      { headers: getUserHeaders() }
    );
  },

  // ========================================
  // MOVEMENTS - STATUS ACTIONS
  // ========================================

  /**
   * Start movement (PENDING -> IN_PROGRESS)
   */
  startMovement: async (id: string): Promise<Movement> => {
    const response = await apiClient.post<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/start`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Complete movement
   */
  completeMovement: async (id: string): Promise<Movement> => {
    const response = await apiClient.post<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/complete`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Cancel movement
   */
  cancelMovement: async (id: string, reason: string): Promise<Movement> => {
    const response = await apiClient.post<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/cancel`,
      null,
      { 
        params: { reason },
        headers: getUserHeaders() 
      }
    );
    return response.data;
  },

  /**
   * Hold movement (set to ON_HOLD)
   */
  holdMovement: async (id: string, reason: string): Promise<Movement> => {
    const response = await apiClient.post<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/hold`,
      null,
      { 
        params: { reason },
        headers: getUserHeaders() 
      }
    );
    return response.data;
  },

  /**
   * Release movement from hold
   */
  releaseMovement: async (id: string): Promise<Movement> => {
    const response = await apiClient.post<Movement>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENT_BY_ID(id)}/release`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  // ========================================
  // MOVEMENTS - SEARCH & FILTER
  // ========================================

  /**
   * Get movements by warehouse
   */
  getMovementsByWarehouse: async (
    warehouseId: string, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/warehouse/${warehouseId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get movements by status
   */
  getMovementsByStatus: async (
    status: MovementStatus, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/status/${status}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get movements by type
   */
  getMovementsByType: async (
    type: MovementType, 
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/type/${type}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get movements by warehouse and status
   */
  getMovementsByWarehouseAndStatus: async (
    warehouseId: string,
    status: MovementStatus,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/warehouse/${warehouseId}/status/${status}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get movements created by user
   */
  getMovementsByCreatedBy: async (
    userId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/created-by/${userId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Search movements by reference or notes
   */
  searchMovements: async (
    searchTerm: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/search`,
      { params: { searchTerm, ...params } }
    );
    return response.data;
  },

  /**
   * Advanced search with multiple filters
   */
  advancedSearch: async (filters: {
    warehouseId?: string;
    type?: MovementType;
    status?: MovementStatus;
    startDate?: string;
    endDate?: string;
  }, params?: PaginationParams): Promise<PaginatedResponse<Movement>> => {
    const response = await apiClient.get<PaginatedResponse<Movement>>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/advanced-search`,
      { params: { ...filters, ...params } }
    );
    return response.data;
  },

  /**
   * Get overdue movements
   */
  getOverdueMovements: async (): Promise<Movement[]> => {
    const response = await apiClient.get<Movement[]>(
      `${API_ENDPOINTS.MOVEMENTS.MOVEMENTS}/overdue`
    );
    return response.data;
  },

  // ========================================
  // MOVEMENT LINES - CRUD OPERATIONS
  // ========================================

  /**
   * Get line by ID
   */
  getMovementLineById: async (id: string): Promise<MovementLine> => {
    const response = await apiClient.get<MovementLine>(
      `/api/movement-lines/${id}`
    );
    return response.data;
  },

  /**
   * Get all lines for a movement
   */
  getLinesByMovement: async (movementId: string): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      `/api/movement-lines/movement/${movementId}`
    );
    return response.data || [];
  },

  /**
   * Get lines by item
   */
  getLinesByItem: async (itemId: string): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      `/api/movement-lines/item/${itemId}`
    );
    return response.data || [];
  },

  /**
   * Get lines by status
   */
  getLinesByStatus: async (status: string): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      `/api/movement-lines/status/${status}`
    );
    return response.data || [];
  },

  /**
   * Add line to movement
   */
  addLineToMovement: async (
    movementId: string,
    data: MovementLineRequestDto
  ): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.post<ApiResponse<MovementLine>>(
      `/api/movement-lines/movement/${movementId}`,
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Update movement line
   */
  updateMovementLine: async (
    id: string,
    data: Partial<MovementLineRequestDto>
  ): Promise<ApiResponse<MovementLine>> => {
    const response = await apiClient.put<ApiResponse<MovementLine>>(
      `/api/movement-lines/${id}`,
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Delete movement line
   */
  deleteMovementLine: async (id: string): Promise<void> => {
    await apiClient.delete(
      `/api/movement-lines/${id}`,
      { headers: getUserHeaders() }
    );
  },

  /**
   * Update line actual quantity
   */
  updateLineActualQuantity: async (
    id: string,
    actualQuantity: number
  ): Promise<MovementLine> => {
    const response = await apiClient.patch<MovementLine>(
      `/api/movement-lines/${id}/quantity`,
      null,
      { 
        params: { actualQuantity },
        headers: getUserHeaders() 
      }
    );
    return response.data;
  },

  /**
   * Complete line
   */
  completeMovementLine: async (id: string): Promise<MovementLine> => {
    const response = await apiClient.post<MovementLine>(
      `/api/movement-lines/${id}/complete`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Get lines with variance (actual != requested)
   */
  getLinesWithVariance: async (): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      '/api/movement-lines/variance'
    );
    return response.data || [];
  },

  /**
   * Get short picked lines
   */
  getShortPickedLines: async (): Promise<MovementLine[]> => {
    const response = await apiClient.get<MovementLine[]>(
      '/api/movement-lines/short-picked'
    );
    return response.data || [];
  },

  // ========================================
  // MOVEMENT TASKS - CRUD OPERATIONS
  // ========================================

  /**
   * Get task by ID
   */
  getMovementTaskById: async (id: string): Promise<MovementTask> => {
    const response = await apiClient.get<MovementTask>(
      `/api/movement-tasks/${id}`
    );
    return response.data;
  },

  /**
   * Get all tasks for a movement
   */
  getTasksByMovement: async (movementId: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      `/api/movement-tasks/movement/${movementId}`
    );
    return response.data || [];
  },

  /**
   * Get tasks assigned to user
   */
  getTasksByAssignedUser: async (userId: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      `/api/movement-tasks/assigned/${userId}`
    );
    return response.data || [];
  },

  /**
   * Get tasks by status
   */
  getTasksByStatus: async (status: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      `/api/movement-tasks/status/${status}`
    );
    return response.data || [];
  },

  /**
   * Get tasks by type
   */
  getTasksByType: async (taskType: string): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      `/api/movement-tasks/type/${taskType}`
    );
    return response.data || [];
  },

  /**
   * Create task for movement
   */
  createTask: async (
    movementId: string,
    data: MovementTaskRequestDto
  ): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.post<ApiResponse<MovementTask>>(
      `/api/movement-tasks/movement/${movementId}`,
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Update movement task
   */
  updateMovementTask: async (
    id: string,
    data: Partial<MovementTaskRequestDto>
  ): Promise<ApiResponse<MovementTask>> => {
    const response = await apiClient.put<ApiResponse<MovementTask>>(
      `/api/movement-tasks/${id}`,
      data,
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Delete movement task
   */
  deleteMovementTask: async (id: string): Promise<void> => {
    await apiClient.delete(
      `/api/movement-tasks/${id}`,
      { headers: getUserHeaders() }
    );
  },

  // ========================================
  // MOVEMENT TASKS - STATUS ACTIONS
  // ========================================

  /**
   * Assign task to user
   */
  assignTask: async (taskId: string, userId: string): Promise<MovementTask> => {
    const response = await apiClient.post<MovementTask>(
      `/api/movement-tasks/${taskId}/assign`,
      null,
      { 
        params: { userId },
        headers: getUserHeaders() 
      }
    );
    return response.data;
  },

  /**
   * Start task
   */
  startTask: async (taskId: string): Promise<MovementTask> => {
    const response = await apiClient.post<MovementTask>(
      `/api/movement-tasks/${taskId}/start`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Complete task
   */
  completeTask: async (taskId: string): Promise<MovementTask> => {
    const response = await apiClient.post<MovementTask>(
      `/api/movement-tasks/${taskId}/complete`,
      {},
      { headers: getUserHeaders() }
    );
    return response.data;
  },

  /**
   * Cancel task
   */
  cancelTask: async (taskId: string, reason: string): Promise<MovementTask> => {
    const response = await apiClient.post<MovementTask>(
      `/api/movement-tasks/${taskId}/cancel`,
      null,
      { 
        params: { reason },
        headers: getUserHeaders() 
      }
    );
    return response.data;
  },

  /**
   * Get overdue tasks
   */
  getOverdueTasks: async (): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      '/api/movement-tasks/overdue'
    );
    return response.data || [];
  },

  /**
   * Get pending tasks
   */
  getPendingTasks: async (): Promise<MovementTask[]> => {
    const response = await apiClient.get<MovementTask[]>(
      '/api/movement-tasks/pending'
    );
    return response.data || [];
  },

  /**
   * Export movements to CSV
   */
  exportMovementsCsv: async (params?: { status?: string; type?: string; startDate?: string; endDate?: string }): Promise<Blob> => {
    const response = await apiClient.get(API_ENDPOINTS.MOVEMENTS.MOVEMENTS_EXPORT_CSV, {
      responseType: 'blob',
      params,
    });
    return response.data;
  },
};