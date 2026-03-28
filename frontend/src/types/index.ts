// frontend/src/types/index.ts
// ✅ COMPLETE TYPES - Matching Backend DTOs

// ============================================
// ENUMS - Movement Related
// ============================================

export enum MovementType {
  RECEIPT = 'RECEIPT',
  ISSUE = 'ISSUE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  PICKING = 'PICKING',
  PUTAWAY = 'PUTAWAY',
  CYCLE_COUNT = 'CYCLE_COUNT',
  RELOCATION = 'RELOCATION',
  QUARANTINE = 'QUARANTINE'
}

export enum MovementStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED'
}

export enum MovementPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum LineStatus {
  PENDING = 'PENDING',
  ALLOCATED = 'ALLOCATED',
  PICKED = 'PICKED',
  PACKED = 'PACKED',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskType {
  PICK = 'PICK',
  PACK = 'PACK',
  SHIP = 'SHIP',
  RECEIVE = 'RECEIVE',
  COUNT = 'COUNT',
  PUTAWAY = 'PUTAWAY',
  TRANSFER = 'TRANSFER',
  INSPECT = 'INSPECT',
  LOAD = 'LOAD',
  UNLOAD = 'UNLOAD'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// ============================================
// REQUEST DTOs - For CREATE/UPDATE Operations
// ============================================

export interface MovementRequestDto {
  type: MovementType;
  movementDate?: string;
  status?: MovementStatus;
  priority?: MovementPriority;
  expectedDate?: string;
  scheduledDate?: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  sourceUserId?: string;
  destinationUserId?: string;
  warehouseId: string;
  referenceNumber?: string;
  notes?: string;
  reason?: string;
  lines: MovementLineRequestDto[];
  tasks?: MovementTaskRequestDto[];
}

export interface MovementLineRequestDto {
  itemId: string;
  requestedQuantity: number;
  actualQuantity?: number;
  uom?: string;
  lotId?: string;
  serialId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  status?: LineStatus;
  lineNumber: number;
  notes?: string;
  reason?: string;
}

export interface MovementTaskRequestDto {
  movementLineId?: string;
  assignedUserId?: string;
  taskType: TaskType;
  status?: TaskStatus;
  priority?: number;
  scheduledStartTime?: string;
  expectedCompletionTime?: string;
  locationId?: string;
  instructions?: string;
  notes?: string;
}

// ============================================
// RESPONSE ENTITIES - From Backend
// ============================================

export interface Movement {
  id: string;
  referenceNumber?: string;
  type: MovementType;
  status: MovementStatus;
  priority: MovementPriority;
  
  // IDs
  warehouseId: string;
  sourceLocationId?: string;
  destinationLocationId?: string;
  sourceUserId?: string;
  destinationUserId?: string;
  
  // Display Names (may be populated by frontend)
  warehouseName?: string;
  sourceLocationName?: string;
  destinationLocationName?: string;
  
  // Dates
  movementDate: string;
  expectedDate?: string;
  actualDate?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Additional Info
  notes?: string;
  reason?: string;
  
  // User Info
  createdBy: string;
  completedBy?: string;
  createdByName?: string;
  completedByName?: string;
  
  // Related Data
  lines: MovementLine[];
  tasks?: MovementTask[];
  
  // Calculated Fields (from backend)
  totalLines?: number;
  completedLines?: number;
  pendingTasks?: number;
  totalQuantityRequested?: number;
  totalQuantityActual?: number;
}

export interface MovementLine {
  id: string;
  movementId: string;
  lineNumber: number;
  
  // Item IDs
  itemId: string;
  lotId?: string;
  serialId?: string;
  
  // Display Names (may be populated by frontend)
  itemName?: string;
  itemSKU?: string;
  itemDescription?: string;
  lotNumber?: string;
  serialNumber?: string;
  
  // Movement Reference
  movementReferenceNumber?: string;
  movementType?: MovementType;
  
  // Quantities
  requestedQuantity: number;
  actualQuantity?: number;
  varianceQuantity?: number;
  uom?: string;
  
  // Location IDs
  fromLocationId?: string;
  toLocationId?: string;
  
  // Location Names (may be populated by frontend)
  fromLocationName?: string;
  toLocationName?: string;
  
  // Status
  status: LineStatus;
  
  // Additional Info
  notes?: string;
  reason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Related Objects (optional - for detailed views)
  item?: Item;
  lot?: Lot;
  serial?: Serial;
}

export interface MovementTask {
  id: string;
  movementId: string;
  movementLineId?: string;
  
  // Task Info
  taskType: TaskType;
  status: TaskStatus;
  priority: number;
  
  // Movement Reference
  movementReferenceNumber?: string;
  movementType?: MovementType;
  
  // Assignment
  assignedUserId?: string;
  assignedToId?: string;
  assignedToName?: string;
  assignedTo?: string;
  
  // Location
  locationId?: string;
  locationName?: string;
  
  // Timeline
  scheduledStartTime?: string;
  actualStartTime?: string;
  expectedCompletionTime?: string;
  actualCompletionTime?: string;
  actualEndTime?: string;
  
  // Additional Info
  instructions?: string;
  description?: string;
  notes?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Calculated Fields
  durationMinutes?: number;
  isOverdue?: boolean;
  
  // Related Objects (optional)
  movement?: {
    id: string;
    referenceNumber?: string;
    movementNumber?: string;
    type: MovementType;
  };
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Item {
  id: string;
  name: string;
  sku: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  category?: Category;
  uom: string;
  weight?: number;
  dimensions?: string;
  status: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  leadTime?: number;
  cost?: number;
  price?: number;
  barcode?: string;
  imageUrl?: string;
  attributes?: Record<string, any>;
  tags?: string;
  isSerialized: boolean;
  isLotManaged: boolean;
  shelfLifeDays?: number;
  hazardousMaterial: boolean;
  temperatureControl?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  status: string;
  isActive?: boolean;
  parentCategoryId?: string;
  displayOrder?: number;
  attributeSchemas?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemVariant {
  id: string;
  itemId: string;
  item?: Item;
  variantName: string;
  sku: string;
  barcode?: string;
  attributes?: Record<string, any>;
  status: string;
  isActive?: boolean;
  parentItemId?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INVENTORY TYPES
// ============================================

export interface Lot {
  id: string;
  code: string;
  lotNumber: string;
  itemId: string;
  item?: Item;
  quantity: number;
  expiryDate?: string;
  manufactureDate?: string;
  supplierId?: string;
  status: string;
  attributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Serial {
  id: string;
  code: string;
  serialNumber: string;
  itemId: string;
  item?: Item;
  lotId?: string;
  lot?: Lot;
  locationId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: string;
  itemId: string;
  item?: Item;
  warehouseId: string;
  locationId: string;
  location?: Location;
  lotId?: string;
  lot?: Lot;
  serialId?: string;
  serial?: Serial;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityDamaged?: number;
  uom: string;
  status: string;
  unitCost?: number;
  expiryDate?: string;
  manufactureDate?: string;
  lastCountDate?: string;
  attributes?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LOCATION TYPES
// ============================================

export interface Site {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  siteId: string;
  siteName?: string;
  site?: Site;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  isActive?: boolean;
  status?: string;
  settings?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  warehouseId: string;
  warehouseName?: string;
  warehouse?: Warehouse;
  locationType: string;
  type: string;
  parentId?: string;
  parent?: Location;
  aisle?: string;
  rack?: string;
  level?: string;
  shelf?: string;
  bin?: string;
  zone?: string;
  capacity?: number;
  restrictions?: string;
  coordinates?: string;
  isActive?: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ALERT TYPES
// ============================================

export interface Alert {
  id: string;
  alertNumber: string;
  title: string;
  type: string;
  severity: string;
  status: string;
  message: string;
  entityType?: string;
  entityId?: string;
  triggeredBy?: string;
  triggeredByName?: string;
  triggeredAt: string;
  acknowledgedBy?: string;
  acknowledgedByName?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  status: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  ruleType: string;
  entityType: string;
  condition: string;
  threshold?: number;
  severity: string;
  enabled: boolean;
  actions?: string[];
  notificationChannels?: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: string;
  subject?: string;
  body: string;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role?: string;
  roles?: string[];
  status: string;
  isActive?: boolean;
  isLocked?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  status?: number;
}

// ===== PURCHASE SERVICE TYPES =====

export type SupplierStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type PurchaseOrderStatus = 'DRAFT' | 'CONFIRMED' | 'SENT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTermsDays?: number;
  leadTimeDays?: number;
  status: SupplierStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  itemId: string;
  itemName: string;
  itemSku?: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  remainingQuantity: number;
  fullyReceived: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  supplierId: string;
  supplierName: string;
  inventoryId?: string;
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string;
  notes?: string;
  totalAmount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lines: PurchaseOrderLine[];
}

// ===== SALES SERVICE TYPES =====

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
export type DeliveryNoteStatus = 'DRAFT' | 'VALIDATED';

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  paymentTermsDays?: number;
  status: CustomerStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteLine {
  id: string;
  itemId: string;
  itemName: string;
  itemSku?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  totalPrice: number;
  notes?: string;
}

export interface Quote {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  inventoryId?: string;
  locationId?: string;
  status: QuoteStatus;
  validUntil?: string;
  notes?: string;
  discountPercent: number;
  subtotal: number;
  totalAmount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lines: QuoteLine[];
}

export interface DeliveryNoteLine {
  id: string;
  itemId: string;
  itemName: string;
  itemSku?: string;
  orderedQuantity: number;
  deliveredQuantity: number;
  lotId?: string;
  serialId?: string;
  notes?: string;
}

export interface DeliveryNote {
  id: string;
  reference: string;
  quoteId?: string;
  customerId: string;
  customerName: string;
  inventoryId?: string;
  locationId?: string;
  status: DeliveryNoteStatus;
  deliveryDate?: string;
  deliveryAddress?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  lines: DeliveryNoteLine[];
}

// ============================================
// EXPORT ALL TYPES
// ============================================
