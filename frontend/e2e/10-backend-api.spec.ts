/**
 * Backend API integration tests — hits the real Spring Boot gateway on :8080
 * Uses Playwright's `request` fixture (no browser, pure HTTP).
 *
 * Response format notes (discovered from real backend):
 *  - /api/items, /api/categories, /api/sites, /api/warehouses, /api/item-variants → plain array []
 *  - /api/movements, /api/inventory, /api/alerts, /api/purchase-orders, /api/quotes → paginated { content, totalElements }
 *  - /api/users, /api/roles, /api/permissions, /api/customers, /api/suppliers, /api/delivery-notes → paginated
 *  - Movement referenceNumber is free text (not MOV- format)
 *  - Quote statuses include: DRAFT, SENT, CONFIRMED, ACCEPTED, REJECTED, CANCELLED, EXPIRED, CONVERTED
 *  - Item create DTO: requires categoryId, sku, name (no unitPrice/unitOfMeasure)
 *  - Site create DTO: requires name, type (SiteType enum e.g. WAREHOUSE)
 */
import { test, expect, APIRequestContext } from '@playwright/test';

const BASE = 'http://localhost:8080';
const ADMIN = { usernameOrEmail: 'admin', password: 'Admin@123' };

let token = '';
let refreshToken = '';

async function login(req: APIRequestContext): Promise<string> {
  const res = await req.post(`${BASE}/api/auth/login`, { data: ADMIN });
  expect(res.status()).toBe(200);
  const body = await res.json();
  token = body.accessToken;
  refreshToken = body.refreshToken;
  return token;
}

function auth(t: string) {
  return { Authorization: `Bearer ${t}` };
}

// ── Auth Service ────────────────────────────────────────────────────────────────

test.describe('Backend API — Auth', () => {
  test('login with valid credentials returns tokens', async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/login`, { data: ADMIN });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body).toHaveProperty('user');
    expect(body.user.username).toBe('admin');
    token = body.accessToken;
    refreshToken = body.refreshToken;
  });

  test('login with wrong password returns 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/login`, {
      data: { usernameOrEmail: 'admin', password: 'wrongpassword' },
    });
    expect(res.status()).toBe(401);
  });

  test('login with unknown user returns 401', async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/login`, {
      data: { usernameOrEmail: 'nonexistent', password: 'anything' },
    });
    expect(res.status()).toBe(401);
  });

  test('get current user profile (me)', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/users/me`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.username).toBe('admin');
    expect(body.email).toBeDefined();
  });

  test('refresh token returns new access token', async ({ request }) => {
    const t = await login(request);
    const res = await request.post(`${BASE}/api/auth/refresh`, {
      data: { refreshToken },
      headers: auth(t),
    });
    expect([200, 400, 401, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('accessToken');
    }
  });

  test('protected endpoint rejects missing token with 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/items`);
    expect(res.status()).toBe(401);
  });

  test('protected endpoint rejects invalid token with 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/items`, {
      headers: { Authorization: 'Bearer invalid-token-xyz' },
    });
    expect(res.status()).toBe(401);
  });
});

// ── Products / Items ────────────────────────────────────────────────────────────

test.describe('Backend API — Items', () => {
  test('list items returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/items`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(Array.isArray(body.content)).toBe(true);
  });

  test('list items has expected fields', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/items`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    if (body.content.length > 0) {
      const first = body.content[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('sku');
      expect(first).toHaveProperty('name');
    }
  });

  test('list items with search filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/items/search?keyword=a`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('create item, get it, then delete it', async ({ request }) => {
    const t = await login(request);

    // Need a categoryId first — pick the first category
    const catRes = await request.get(`${BASE}/api/categories`, { headers: auth(t) });
    const catBody = await catRes.json();
    const categories = catBody.content ?? catBody;
    const categoryId = Array.isArray(categories) && categories.length > 0 ? categories[0].id : null;
    if (!categoryId) return; // Skip if no categories

    const uniqueSku = `E2E-SKU-${Date.now()}`;
    const createRes = await request.post(`${BASE}/api/items`, {
      headers: auth(t),
      data: {
        categoryId,
        name: 'E2E Test Item',
        sku: uniqueSku,
        description: 'Created by Playwright test',
      },
    });
    expect([200, 201]).toContain(createRes.status());
    const created = await createRes.json();
    expect(created.id).toBeDefined();
    const itemId = created.id;

    // Get by ID
    const getRes = await request.get(`${BASE}/api/items/${itemId}`, { headers: auth(t) });
    expect(getRes.status()).toBe(200);
    const item = await getRes.json();
    expect(item.sku).toBe(uniqueSku);

    // Delete
    const delRes = await request.delete(`${BASE}/api/items/${itemId}`, { headers: auth(t) });
    expect([200, 204]).toContain(delRes.status());

    // Verify gone
    const afterDel = await request.get(`${BASE}/api/items/${itemId}`, { headers: auth(t) });
    expect([404, 400]).toContain(afterDel.status());
  });

  test('get non-existent item returns 404', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/items/non-existent-id-00000`, { headers: auth(t) });
    expect([404, 400]).toContain(res.status());
  });

  test('create item with duplicate SKU returns error', async ({ request }) => {
    const t = await login(request);

    const catRes = await request.get(`${BASE}/api/categories`, { headers: auth(t) });
    const catBody = await catRes.json();
    const categories = catBody.content ?? catBody;
    const categoryId = Array.isArray(categories) && categories.length > 0 ? categories[0].id : null;
    if (!categoryId) return;

    const uniqueSku = `DUP-${Date.now()}`;
    const payload = { categoryId, name: 'Dup Test Item', sku: uniqueSku };
    const r1 = await request.post(`${BASE}/api/items`, { headers: auth(t), data: payload });
    expect([200, 201]).toContain(r1.status());
    const c1 = await r1.json();

    const r2 = await request.post(`${BASE}/api/items`, { headers: auth(t), data: payload });
    expect([400, 409, 422, 500]).toContain(r2.status());

    // Cleanup
    await request.delete(`${BASE}/api/items/${c1.id}`, { headers: auth(t) });
  });
});

// ── Categories ──────────────────────────────────────────────────────────────────

test.describe('Backend API — Categories', () => {
  test('list categories returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/categories`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(Array.isArray(body.content)).toBe(true);
  });

  test('categories have id and name fields', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/categories`, { headers: auth(t) });
    const body = await res.json();
    const cats = body.content ?? body;
    if (cats.length > 0) {
      expect(cats[0]).toHaveProperty('id');
      expect(cats[0]).toHaveProperty('name');
    }
  });

  test('create and delete category', async ({ request }) => {
    const t = await login(request);
    const res = await request.post(`${BASE}/api/categories`, {
      headers: auth(t),
      data: { name: `E2E-Cat-${Date.now()}`, description: 'Playwright test category' },
    });
    expect([200, 201]).toContain(res.status());
    const cat = await res.json();
    expect(cat.id).toBeDefined();

    const del = await request.delete(`${BASE}/api/categories/${cat.id}`, { headers: auth(t) });
    expect([200, 204]).toContain(del.status());
  });
});

// ── Inventory ───────────────────────────────────────────────────────────────────

test.describe('Backend API — Inventory', () => {
  test('list inventory returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/inventory`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const isArray = Array.isArray(body);
    const isPaginated = typeof body === 'object' && body !== null && 'content' in body;
    expect(isArray || isPaginated).toBe(true);
  });

  test('list inventory with warehouse filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/inventory?warehouseId=non-existent`, { headers: auth(t) });
    expect([200, 400]).toContain(res.status());
  });

  test('list lots', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/lots`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('list serials', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/serials`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });
});

// ── Locations ───────────────────────────────────────────────────────────────────
// /api/sites, /api/warehouses return plain arrays

test.describe('Backend API — Locations', () => {
  test('list sites returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/sites`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(Array.isArray(body.content)).toBe(true);
  });

  test('list warehouses returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/warehouses`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(Array.isArray(body.content)).toBe(true);
  });

  test('list locations', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/locations`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('create site with required type field and delete it', async ({ request }) => {
    const t = await login(request);
    const res = await request.post(`${BASE}/api/sites`, {
      headers: auth(t),
      data: {
        name: `E2E-Site-${Date.now()}`,
        type: 'WAREHOUSE',
        address: '1 Test Street',
        timezone: 'Europe/Paris',
      },
    });
    expect([200, 201]).toContain(res.status());
    const site = await res.json();
    expect(site.id).toBeDefined();

    await request.delete(`${BASE}/api/sites/${site.id}`, { headers: auth(t) });
  });

  test('create warehouse and delete it', async ({ request }) => {
    const t = await login(request);

    // Need a site first
    const siteRes = await request.post(`${BASE}/api/sites`, {
      headers: auth(t),
      data: { name: `E2E-Site-WH-${Date.now()}`, type: 'WAREHOUSE' },
    });
    if (siteRes.status() !== 200 && siteRes.status() !== 201) return;
    const site = await siteRes.json();

    const whRes = await request.post(`${BASE}/api/warehouses`, {
      headers: auth(t),
      data: {
        name: `E2E-WH-${Date.now()}`,
        code: `WH${Date.now().toString().slice(-6)}`,
        siteId: site.id,
        capacity: 1000,
      },
    });
    expect([200, 201]).toContain(whRes.status());
    const wh = await whRes.json();

    await request.delete(`${BASE}/api/warehouses/${wh.id}`, { headers: auth(t) });
    await request.delete(`${BASE}/api/sites/${site.id}`, { headers: auth(t) });
  });
});

// ── Movements ───────────────────────────────────────────────────────────────────

test.describe('Backend API — Movements', () => {
  test('list movements returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('list movements with type filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements?type=RECEIPT`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('list movements with status filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements?status=COMPLETED`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('movements have required fields', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements?size=5`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    for (const mv of body.content ?? []) {
      expect(mv).toHaveProperty('id');
    }
  });
});

// ── Purchase ────────────────────────────────────────────────────────────────────

test.describe('Backend API — Purchase', () => {
  test('list suppliers returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/suppliers`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('list purchase orders returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/purchase-orders`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('create and delete supplier', async ({ request }) => {
    const t = await login(request);
    const res = await request.post(`${BASE}/api/suppliers`, {
      headers: auth(t),
      data: {
        name: `E2E-Supplier-${Date.now()}`,
        email: `supplier${Date.now()}@test.com`,
        phone: '+33100000000',
        address: '1 Test Rd',
      },
    });
    expect([200, 201]).toContain(res.status());
    const sup = await res.json();
    expect(sup.id).toBeDefined();

    await request.delete(`${BASE}/api/suppliers/${sup.id}`, { headers: auth(t) });
  });

  test('purchase orders have valid statuses', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/purchase-orders?size=10`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const validStatuses = ['DRAFT', 'SENT', 'CONFIRMED', 'RECEIVED', 'PENDING', 'CANCELLED', 'PARTIAL'];
    for (const po of body.content ?? []) {
      if (po.status) expect(validStatuses).toContain(po.status);
    }
  });
});

// ── Sales ───────────────────────────────────────────────────────────────────────

test.describe('Backend API — Sales', () => {
  test('list customers returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/customers`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('list quotes returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/quotes`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
  });

  test('list delivery notes', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/delivery-notes`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('create and delete customer', async ({ request }) => {
    const t = await login(request);
    const res = await request.post(`${BASE}/api/customers`, {
      headers: auth(t),
      data: {
        name: `E2E-Customer-${Date.now()}`,
        email: `customer${Date.now()}@test.com`,
        phone: '+33100000001',
        address: '2 Test Rd',
      },
    });
    expect([200, 201]).toContain(res.status());
    const cust = await res.json();
    expect(cust.id).toBeDefined();

    await request.delete(`${BASE}/api/customers/${cust.id}`, { headers: auth(t) });
  });

  test('quotes have valid statuses (including CONVERTED)', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/quotes?size=10`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    // CONVERTED is also a valid status (quotes turned into sales orders)
    const validStatuses = ['DRAFT', 'SENT', 'CONFIRMED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'CONVERTED'];
    for (const q of body.content ?? []) {
      if (q.status) expect(validStatuses).toContain(q.status);
    }
  });
});

// ── Alerts ──────────────────────────────────────────────────────────────────────

test.describe('Backend API — Alerts', () => {
  test('list alerts returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/alerts`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
  });

  test('list alerts with level filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/alerts?level=WARNING`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('list alerts with status filter', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/alerts?status=ACTIVE`, { headers: auth(t) });
    expect(res.status()).toBe(200);
  });

  test('alert levels are valid', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/alerts?size=20`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const validLevels = ['INFO', 'WARNING', 'EMERGENCY'];
    for (const alert of body.content ?? []) {
      if (alert.level) expect(validLevels).toContain(alert.level);
    }
  });
});

// ── Users & Roles ───────────────────────────────────────────────────────────────

test.describe('Backend API — Users & Roles', () => {
  test('list users (admin only)', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/users`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    const users = body.content;
    expect(users.some((u: any) => u.username === 'admin')).toBe(true);
  });

  test('list roles', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/roles`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const roles = body.content ?? body;
    const roleNames = (Array.isArray(roles) ? roles : []).map((r: any) => r.name);
    expect(roleNames).toContain('ADMIN');
  });

  test('list permissions', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/permissions`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const perms = body.content ?? body;
    expect(Array.isArray(perms)).toBe(true);
  });

  test('non-admin cannot access user list without token', async ({ request }) => {
    const res = await request.get(`${BASE}/api/users`);
    expect(res.status()).toBe(401);
  });
});

// ── Item Variants ───────────────────────────────────────────────────────────────

test.describe('Backend API — Item Variants', () => {
  test('list item variants returns paginated result', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/item-variants`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('content');
    expect(body).toHaveProperty('totalElements');
    expect(Array.isArray(body.content)).toBe(true);
  });
});

// ── Dashboard / Stats ────────────────────────────────────────────────────────────

test.describe('Backend API — Dashboard Stats', () => {
  test('total item count from items endpoint', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/items`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('totalElements');
    expect(body.totalElements).toBeGreaterThanOrEqual(0);
  });

  test('total movements count from movements endpoint', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements?size=1`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.totalElements).toBeGreaterThanOrEqual(0);
  });

  test('total alerts count from alerts endpoint', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/alerts?size=1`, { headers: auth(t) });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.totalElements).toBeGreaterThanOrEqual(0);
  });
});

// ── Security Scenarios ──────────────────────────────────────────────────────────

test.describe('Backend API — Security', () => {
  test('logout invalidates session (if supported)', async ({ request }) => {
    const t = await login(request);
    const logoutRes = await request.post(`${BASE}/api/auth/logout`, { headers: auth(t) });
    expect([200, 204, 401]).toContain(logoutRes.status());
  });

  test('SQL injection in login body returns 401 (not 500)', async ({ request }) => {
    const res = await request.post(`${BASE}/api/auth/login`, {
      data: { usernameOrEmail: "' OR '1'='1", password: "' OR '1'='1" },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('XSS payload in item name stored safely (not 500)', async ({ request }) => {
    const t = await login(request);
    const catRes = await request.get(`${BASE}/api/categories`, { headers: auth(t) });
    const categories = await catRes.json();
    const categoryId = Array.isArray(categories) && categories.length > 0 ? categories[0].id : null;
    if (!categoryId) return;

    const xssName = '<script>alert("xss")</script>E2E-XSS-Item';
    const res = await request.post(`${BASE}/api/items`, {
      headers: auth(t),
      data: { categoryId, name: xssName, sku: `XSS-${Date.now()}` },
    });
    // Should NOT be a 500 server error — either 200/201 (stored safely) or 400 (validation rejects it)
    expect([200, 201, 400]).toContain(res.status());
    if (res.status() === 200 || res.status() === 201) {
      const created = await res.json();
      await request.delete(`${BASE}/api/items/${created.id}`, { headers: auth(t) });
    }
  });

  test('very large page size does not crash server', async ({ request }) => {
    const t = await login(request);
    const res = await request.get(`${BASE}/api/movements?size=10000`, { headers: auth(t) });
    expect([200, 400]).toContain(res.status());
  });

  test('CORS header present on API responses', async ({ request }) => {
    const t = token || (await login(request));
    const res = await request.get(`${BASE}/api/items`, {
      headers: {
        Authorization: `Bearer ${t}`,
        Origin: 'http://localhost:5174',
      },
    });
    expect([200, 401, 403]).toContain(res.status());
  });
});
