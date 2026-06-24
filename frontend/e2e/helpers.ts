import { Page, Route } from '@playwright/test';

// ── Mock data ─────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@stockflow.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  roles: ['ADMIN'],
  // Explicit full-admin permission list — avoids relying on role-based fallback
  permissions: [
    'dashboard:view',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    'categories:view', 'categories:create', 'categories:edit', 'categories:delete',
    'inventory:view', 'inventory:create', 'inventory:edit', 'inventory:delete',
    'lots:view', 'lots:create', 'lots:edit', 'lots:delete',
    'serials:view', 'serials:create', 'serials:edit', 'serials:delete',
    'locations:view', 'locations:create', 'locations:edit', 'locations:delete',
    'movements:view', 'movements:create', 'movements:edit', 'movements:delete', 'movements:approve', 'movements:cancel',
    'alerts:view', 'alerts:manage', 'alerts:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete',
    'permissions:view', 'permissions:manage',
    'audit:view',
    'settings:view', 'settings:manage',
  ],
  active: true,
  profilePicture: null,
};

export const MOCK_TOKENS = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-12345',
};

export const MOCK_ITEMS = {
  content: [
    { id: 'item-1', name: 'Eco-friendly Cereal Box', sku: 'SMA-F00-0012', description: 'Organic cereal packaging', categoryId: 'cat-1', categoryName: 'Alimentaire', unitPrice: 12.9, purchasePrice: 8.0, unitOfMeasure: 'UNIT', active: true, minQuantity: 10, maxQuantity: 200 },
    { id: 'item-2', name: 'Wireless Headphones Pro', sku: 'ELC-HP-0034', description: 'Premium audio headphones', categoryId: 'cat-2', categoryName: 'Électronique', unitPrice: 189.0, purchasePrice: 120.0, unitOfMeasure: 'UNIT', active: true, minQuantity: 5, maxQuantity: 100 },
    { id: 'item-3', name: 'Office Chair Premium', sku: 'FRN-CH-0089', description: 'Ergonomic office chair', categoryId: 'cat-3', categoryName: 'Mobilier', unitPrice: 349.0, purchasePrice: 200.0, unitOfMeasure: 'UNIT', active: true, minQuantity: 2, maxQuantity: 50 },
    { id: 'item-4', name: 'USB-C Hub 7-Port', sku: 'ELC-USB-007', description: 'Multi-port USB hub', categoryId: 'cat-2', categoryName: 'Électronique', unitPrice: 49.9, purchasePrice: 25.0, unitOfMeasure: 'UNIT', active: true, minQuantity: 10, maxQuantity: 300 },
  ],
  totalElements: 4,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_CATEGORIES = {
  content: [
    { id: 'cat-1', name: 'Alimentaire', description: 'Food products', itemCount: 12, active: true },
    { id: 'cat-2', name: 'Électronique', description: 'Electronic devices', itemCount: 8, active: true },
    { id: 'cat-3', name: 'Mobilier', description: 'Furniture', itemCount: 5, active: true },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_INVENTORY = [
  { id: 'inv-1', itemId: 'item-1', itemName: 'Eco-friendly Cereal Box', sku: 'SMA-F00-0012', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', quantity: 50, minQuantity: 10, maxQuantity: 200, status: 'IN_STOCK', lastUpdated: '2025-06-15T10:00:00Z' },
  { id: 'inv-2', itemId: 'item-2', itemName: 'Wireless Headphones Pro', sku: 'ELC-HP-0034', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', quantity: 23, minQuantity: 5, maxQuantity: 100, status: 'IN_STOCK', lastUpdated: '2025-06-15T10:00:00Z' },
  { id: 'inv-3', itemId: 'item-3', itemName: 'Office Chair Premium', sku: 'FRN-CH-0089', warehouseId: 'wh-2', warehouseName: 'Entrepôt Secondaire', quantity: 3, minQuantity: 5, maxQuantity: 50, status: 'LOW_STOCK', lastUpdated: '2025-06-15T10:00:00Z' },
  { id: 'inv-4', itemId: 'item-4', itemName: 'USB-C Hub 7-Port', sku: 'ELC-USB-007', warehouseId: 'wh-2', warehouseName: 'Entrepôt Secondaire', quantity: 0, minQuantity: 10, maxQuantity: 300, status: 'OUT_OF_STOCK', lastUpdated: '2025-06-15T10:00:00Z' },
];

export const MOCK_WAREHOUSES = {
  content: [
    { id: 'wh-1', name: 'Entrepôt Principal', code: 'WH-MAIN', address: '10 Rue de la Logistique, Paris', capacity: 5000, active: true, siteId: 'site-1', siteName: 'Site Paris' },
    { id: 'wh-2', name: 'Entrepôt Secondaire', code: 'WH-SEC', address: '25 Avenue du Stock, Lyon', capacity: 2000, active: true, siteId: 'site-2', siteName: 'Site Lyon' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_LOCATIONS = {
  content: [
    { id: 'loc-1', name: 'Zone A - Rack 01', code: 'ZA-R01', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', type: 'RACK', capacity: 100, active: true },
    { id: 'loc-2', name: 'Zone B - Rack 03', code: 'ZB-R03', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', type: 'RACK', capacity: 150, active: true },
    { id: 'loc-3', name: 'Réception', code: 'REC-01', warehouseId: 'wh-2', warehouseName: 'Entrepôt Secondaire', type: 'RECEIVING', capacity: 500, active: true },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_SITES = {
  content: [
    { id: 'site-1', name: 'Site Paris', code: 'PAR', address: '10 Rue de Paris', city: 'Paris', country: 'France', active: true },
    { id: 'site-2', name: 'Site Lyon', code: 'LYN', address: '25 Avenue de Lyon', city: 'Lyon', country: 'France', active: true },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_MOVEMENTS = {
  content: [
    { id: 'mov-1', referenceNumber: 'MOV-A1B2C3D4', type: 'TRANSFER', status: 'COMPLETED', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', sourceLocationId: 'loc-1', destinationLocationId: 'loc-2', createdAt: '2025-06-15T10:00:00Z', completedAt: '2025-06-15T11:00:00Z', notes: 'Transfer test', priority: 'NORMAL' },
    { id: 'mov-2', referenceNumber: 'MOV-E5F6G7H8', type: 'RECEIPT', status: 'COMPLETED', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', destinationLocationId: 'loc-1', createdAt: '2025-06-14T09:00:00Z', completedAt: '2025-06-14T10:00:00Z', notes: 'Supplier receipt', priority: 'HIGH' },
    { id: 'mov-3', referenceNumber: 'MOV-I9J0K1L2', type: 'ISSUE', status: 'PENDING', warehouseId: 'wh-2', warehouseName: 'Entrepôt Secondaire', sourceLocationId: 'loc-3', createdAt: '2025-06-14T14:00:00Z', notes: 'Client order', priority: 'NORMAL' },
    { id: 'mov-4', referenceNumber: 'MOV-M3N4O5P6', type: 'ADJUSTMENT', status: 'IN_PROGRESS', warehouseId: 'wh-1', warehouseName: 'Entrepôt Principal', createdAt: '2025-06-13T16:00:00Z', notes: 'Inventory correction', priority: 'LOW' },
  ],
  totalElements: 4,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_SUPPLIERS = {
  content: [
    { id: 'sup-1', name: 'Acme Supplies', email: 'contact@acme.com', phone: '+33 1 23 45 67 89', address: '5 Rue Acme, Paris', active: true, taxId: 'FR123456789' },
    { id: 'sup-2', name: 'Tech Import', email: 'info@techimport.fr', phone: '+33 1 98 76 54 32', address: '12 Boulevard Tech, Lyon', active: true, taxId: 'FR987654321' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_PURCHASE_ORDERS = {
  content: [
    { id: 'po-1', orderNumber: 'BC-2025-001', supplierId: 'sup-1', supplierName: 'Acme Supplies', status: 'RECEIVED', totalAmount: 1240.0, expectedDate: '2025-06-18', createdAt: '2025-06-12T10:00:00Z', notes: '' },
    { id: 'po-2', orderNumber: 'BC-2025-002', supplierId: 'sup-2', supplierName: 'Tech Import', status: 'PENDING', totalAmount: 890.0, expectedDate: '2025-06-20', createdAt: '2025-06-13T10:00:00Z', notes: '' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_CUSTOMERS = {
  content: [
    { id: 'cust-1', name: 'Client Corp A', email: 'contact@clientcorpa.com', phone: '+33 1 11 22 33 44', address: '1 Rue Client, Marseille', active: true },
    { id: 'cust-2', name: 'Boutique B', email: 'info@boutiqueb.fr', phone: '+33 1 55 66 77 88', address: '8 Avenue Boutique, Nice', active: true },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_QUOTES = {
  content: [
    { id: 'quote-1', quoteNumber: 'DEV-2025-001', customerId: 'cust-1', customerName: 'Client Corp A', status: 'CONFIRMED', totalAmount: 2350.0, validUntil: '2025-07-15', createdAt: '2025-06-10T10:00:00Z' },
    { id: 'quote-2', quoteNumber: 'DEV-2025-002', customerId: 'cust-2', customerName: 'Boutique B', status: 'DRAFT', totalAmount: 450.0, validUntil: '2025-07-20', createdAt: '2025-06-12T10:00:00Z' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_DELIVERY_NOTES = {
  content: [
    { id: 'dn-1', deliveryNumber: 'BL-2025-001', customerId: 'cust-1', customerName: 'Client Corp A', quoteId: 'quote-1', status: 'DELIVERED', totalAmount: 2350.0, deliveredAt: '2025-06-14T15:00:00Z', createdAt: '2025-06-13T10:00:00Z' },
  ],
  totalElements: 1,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_ALERTS = {
  content: [
    { id: 'alert-1', type: 'LOW_STOCK', level: 'WARNING', status: 'ACTIVE', message: 'Office Chair Premium est en dessous du seuil minimum (3/5)', entityType: 'ITEM', entityId: 'item-3', createdAt: '2025-06-15T08:00:00Z' },
    { id: 'alert-2', type: 'SYSTEM', level: 'EMERGENCY', status: 'ACTIVE', message: 'USB-C Hub 7-Port est en rupture de stock (0)', entityType: 'ITEM', entityId: 'item-4', createdAt: '2025-06-15T09:00:00Z' },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_DASHBOARD = {
  totalItems: 248,
  lowStockItems: 12,
  outOfStockItems: 8,
  totalMovements: 34,
  totalWarehouses: 3,
  totalCategories: 8,
  recentMovements: MOCK_MOVEMENTS.content.slice(0, 5),
  lowStockAlerts: MOCK_ALERTS.content,
};

export const MOCK_VARIANTS = {
  content: [
    { id: 'var-1', itemId: 'item-2', itemName: 'Wireless Headphones Pro', name: 'Noir', sku: 'ELC-HP-0034-BLK', barcode: '123456789', active: true },
    { id: 'var-2', itemId: 'item-2', itemName: 'Wireless Headphones Pro', name: 'Blanc', sku: 'ELC-HP-0034-WHT', barcode: '987654321', active: true },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const MOCK_ROLES = {
  content: [
    { id: 'role-1', name: 'ADMIN', description: 'Full administrator access', active: true, permissionCount: 50 },
    { id: 'role-2', name: 'MANAGER', description: 'Manager access', active: true, permissionCount: 30 },
    { id: 'role-3', name: 'OPERATOR', description: 'Operator access', active: true, permissionCount: 15 },
  ],
  totalElements: 3,
  totalPages: 1,
  size: 20,
  number: 0,
};

// ── Auth helper: inject mock session into localStorage ─────────────────────────

export async function injectAuth(page: Page) {
  await page.addInitScript(({ user, tokens }: { user: typeof MOCK_USER; tokens: typeof MOCK_TOKENS }) => {
    // storage.set() uses JSON.stringify — match that format so storage.get() can parse correctly.
    // If stored without JSON.stringify, storage.get() throws and useAuth() dispatches logout().
    localStorage.setItem('access_token', JSON.stringify(tokens.accessToken));
    localStorage.setItem('refresh_token', JSON.stringify(tokens.refreshToken));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('theme', 'dark');
  }, { user: MOCK_USER, tokens: MOCK_TOKENS });
}

// ── Route mocking: intercept all API calls ─────────────────────────────────────

export async function mockAllRoutes(page: Page) {
  // Auth — form sends { usernameOrEmail, password }
  await page.route('**/api/auth/login', async (route: Route) => {
    const body = route.request().postDataJSON();
    const identifier = body?.usernameOrEmail ?? body?.email ?? body?.username ?? '';
    const validIdentifiers = ['admin@stockflow.com', 'admin'];
    if (validIdentifiers.includes(identifier) && body?.password === 'admin123') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_TOKENS, user: MOCK_USER }) });
    } else {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid credentials' }) });
    }
  });

  await page.route('**/api/auth/me', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });

  await page.route('**/api/auth/refresh', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TOKENS) });
  });

  await page.route('**/api/auth/logout', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Logged out' }) });
  });

  await page.route('**/api/auth/forgot-password', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Reset email sent' }) });
  });

  // Users / me
  await page.route('**/api/users/me', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });

  await page.route('**/api/users/preferences', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ theme: 'dark', language: 'fr', notifications: true }) });
  });

  await page.route('**/api/users**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [MOCK_USER], totalElements: 1 }) });
  });

  // Dashboard
  await page.route('**/api/dashboard**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DASHBOARD) });
  });

  // Items
  await page.route('**/api/items/export**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'text/csv', body: 'id,name,sku\nitem-1,Test,SKU-001' });
  });
  await page.route('**/api/items**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'item-new', ...body }) });
    } else if (method === 'PUT' || method === 'PATCH') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'item-1', ...body }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      const url = route.request().url();
      if (url.match(/\/api\/items\/[^/]+$/)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ITEMS.content[0]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ITEMS) });
      }
    }
  });

  // Categories
  await page.route('**/api/categories**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'cat-new', ...body }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CATEGORIES) });
    }
  });

  // Item variants
  await page.route('**/api/item-variants**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'var-new', ...body }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_VARIANTS) });
    }
  });

  // Inventory
  await page.route('**/api/inventory/export**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'text/csv', body: 'id,item,qty\ninv-1,Test,50' });
  });
  await page.route('**/api/inventory**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_INVENTORY) });
  });

  // Lots
  await page.route('**/api/lots**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'lot-new', lotNumber: 'LOT-001', itemId: 'item-1', quantity: 100 }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ id: 'lot-1', lotNumber: 'LOT-001', itemId: 'item-1', itemName: 'Cereal Box', quantity: 100, expirationDate: '2026-01-01', status: 'ACTIVE' }], totalElements: 1, totalPages: 1, size: 20, number: 0 }) });
    }
  });

  // Serials
  await page.route('**/api/serials**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ id: 'ser-1', serialNumber: 'SN-00001', itemId: 'item-2', itemName: 'Wireless Headphones Pro', status: 'IN_STOCK', warehouseId: 'wh-1' }], totalElements: 1, totalPages: 1, size: 20, number: 0 }) });
  });

  // Warehouses
  await page.route('**/api/warehouses**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'wh-new', ...body }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_WAREHOUSES) });
    }
  });

  // Locations
  await page.route('**/api/locations**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'loc-new', ...body }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_LOCATIONS) });
    }
  });

  // Sites
  await page.route('**/api/sites**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'site-new', ...body }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SITES) });
    }
  });

  // Movements
  await page.route('**/api/movements/export**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'text/csv', body: 'id,ref,type\nmov-1,MOV-A1B2C3D4,TRANSFER' });
  });
  await page.route('**/api/movements**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'mov-new', referenceNumber: 'MOV-NEWW0001', ...body, status: 'PENDING' }) });
    } else {
      const url = route.request().url();
      if (url.match(/\/api\/movements\/[^/]+$/)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MOVEMENTS.content[0]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MOVEMENTS) });
      }
    }
  });

  await page.route('**/api/movement-lines**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ id: 'ml-1', movementId: 'mov-1', itemId: 'item-1', itemName: 'Cereal Box', quantity: 10 }], totalElements: 1 }) });
  });

  // Suppliers
  await page.route('**/api/suppliers**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'sup-new', ...body }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SUPPLIERS) });
    }
  });

  // Purchase orders
  await page.route('**/api/purchase-orders**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'po-new', orderNumber: 'BC-2025-NEW', ...body, status: 'DRAFT' }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PURCHASE_ORDERS) });
    }
  });

  // Customers
  await page.route('**/api/customers**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'cust-new', ...body }) });
    } else if (method === 'DELETE') {
      await route.fulfill({ status: 204 });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CUSTOMERS) });
    }
  });

  // Quotes
  await page.route('**/api/quotes**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'quote-new', quoteNumber: 'DEV-2025-NEW', ...body, status: 'DRAFT' }) });
    } else {
      const url = route.request().url();
      if (url.match(/\/api\/quotes\/[^/]+$/)) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_QUOTES.content[0]) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_QUOTES) });
      }
    }
  });

  // Delivery notes
  await page.route('**/api/delivery-notes**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      const body = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'dn-new', deliveryNumber: 'BL-2025-NEW', ...body, status: 'DRAFT' }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DELIVERY_NOTES) });
    }
  });

  // Alerts / Notifications / Rules
  await page.route('**/api/alerts**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ALERTS) });
  });
  await page.route('**/api/notifications**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0 }) });
  });
  await page.route('**/api/rules**', async (route: Route) => {
    const method = route.request().method();
    if (method === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ id: 'rule-new', name: 'New Rule', active: true }) });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ id: 'rule-1', name: 'Low Stock Alert', type: 'LOW_STOCK', threshold: 10, active: true }], totalElements: 1 }) });
    }
  });
  await page.route('**/api/notification-channels**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0 }) });
  });
  await page.route('**/api/notification-templates**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [], totalElements: 0 }) });
  });

  // Roles & Permissions
  await page.route('**/api/roles**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ROLES) });
  });
  await page.route('**/api/permissions**', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ content: [{ id: 'perm-1', name: 'VIEW_DASHBOARD', category: 'DASHBOARD', description: 'View dashboard' }], totalElements: 1 }) });
  });

  // Auth change password
  await page.route('**/api/auth/change-password', async (route: Route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Password changed' }) });
  });
}
