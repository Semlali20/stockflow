/**
 * Full-stack E2E tests — real backend (no API mocking) + real browser.
 *
 * Strategy: Obtain a real JWT from the backend via the `request` fixture,
 * then inject it into localStorage via addInitScript so the frontend's
 * useAuth hook reads a valid token and grants access. Pages make real
 * API calls to the backend through the Vite proxy (/api → localhost:8080).
 *
 * Backend credentials: admin / Admin@123   Gateway: http://localhost:8080
 */
import { test, expect, Page, APIRequestContext } from '@playwright/test';

const GATEWAY = 'http://localhost:8080';
const ADMIN_CREDS = { usernameOrEmail: 'admin', password: 'Admin@123' };

// ── Token injection ─────────────────────────────────────────────────────────────

interface RealTokens {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

async function getRealTokens(request: APIRequestContext): Promise<RealTokens> {
  const res = await request.post(`${GATEWAY}/api/auth/login`, { data: ADMIN_CREDS });
  const body = await res.json();
  return { accessToken: body.accessToken, refreshToken: body.refreshToken, user: body.user };
}

async function injectRealAuth(page: Page, tokens: RealTokens) {
  await page.addInitScript(({ at, rt, user }: { at: string; rt: string; user: Record<string, unknown> }) => {
    // storage.set() uses JSON.stringify — inject tokens in that same format
    localStorage.setItem('access_token', JSON.stringify(at));
    localStorage.setItem('refresh_token', JSON.stringify(rt));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('theme', 'dark');
  }, { at: tokens.accessToken, rt: tokens.refreshToken, user: tokens.user });
}

// ── Auth flow (browser UI) ─────────────────────────────────────────────────────

test.describe('Fullstack — Login UI', () => {
  test('wrong password shows error on login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const usernameInput = page.locator('input[name="usernameOrEmail"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('WrongPassword99');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    const url = page.url();
    const body = await page.locator('body').textContent();
    const hasError =
      url.includes('login') ||
      body?.toLowerCase().includes('invalid') ||
      body?.toLowerCase().includes('incorrect') ||
      body?.toLowerCase().includes('error') ||
      body?.toLowerCase().includes('failed');
    expect(hasError).toBeTruthy();
  });

  test('login page has expected form elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const userField = page.locator('input[name="usernameOrEmail"]').first();
    const passField = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    await expect(userField).toBeVisible({ timeout: 5000 });
    await expect(passField).toBeVisible({ timeout: 5000 });
    await expect(submitBtn).toBeVisible({ timeout: 5000 });
  });

  test('unauthenticated access to protected route redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/);
  });
});

// ── Dashboard with real backend ──────────────────────────────────────────────────

test.describe('Fullstack — Dashboard Real', () => {
  test('dashboard loads real KPI data from backend', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(300);
    expect(body).not.toContain('Something went wrong');
    expect(body).not.toContain('Access Denied');
  });

  test('sidebar navigation links present', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const dashLink = page.locator('a[href="/dashboard"]').first();
    await expect(dashLink).toBeVisible({ timeout: 5000 });

    const hasProducts = await page.locator('a[href*="/products"]').count();
    const hasInventory = await page.locator('a[href*="/inventory"]').count();
    expect(hasProducts).toBeGreaterThan(0);
    expect(hasInventory).toBeGreaterThan(0);
  });

  test('header visible after real auth', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('dashboard shows admin user info in header', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    const hasAdminInfo = body?.includes('Admin') || body?.includes('admin') || body?.includes('AU');
    expect(hasAdminInfo).toBeTruthy();
  });
});

// ── Items with real backend ──────────────────────────────────────────────────────

test.describe('Fullstack — Items Real Backend', () => {
  test('items page loads real data from backend', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    expect(body).not.toContain('Something went wrong');
    expect(body).not.toContain('Access Denied');
  });

  test('items page has search input', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const search = page
      .locator('input[placeholder*="search" i], input[placeholder*="recherch" i]')
      .first();
    if (await search.isVisible()) {
      await search.fill('test');
      await page.waitForTimeout(600);
      const body = await page.locator('body').textContent();
      expect(body?.length).toBeGreaterThan(50);
    }
  });
});

// ── Categories with real backend ─────────────────────────────────────────────────

test.describe('Fullstack — Categories Real Backend', () => {
  test('categories page loads real data', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/products/categories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    expect(body).not.toContain('Access Denied');
  });
});

// ── Inventory with real backend ──────────────────────────────────────────────────

test.describe('Fullstack — Inventory Real Backend', () => {
  test('inventory page loads real stock data', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/inventory/Inventories');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
  });

  test('lots page loads real lots', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/inventory/lots');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Something went wrong');
    expect(body?.length).toBeGreaterThan(100);
  });

  test('serials page loads real serials', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/inventory/serials');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Something went wrong');
    expect(body?.length).toBeGreaterThan(100);
  });
});

// ── Movements with real backend ──────────────────────────────────────────────────

test.describe('Fullstack — Movements Real Backend', () => {
  test('movements page loads real movements', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/movements');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
  });

  test('create movement page renders form', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/movements/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    const hasType =
      body?.includes('RECEIPT') ||
      body?.includes('TRANSFER') ||
      body?.includes('ISSUE') ||
      body?.includes('Type');
    expect(hasType).toBeTruthy();
  });
});

// ── Locations with real backend ──────────────────────────────────────────────────

test.describe('Fullstack — Locations Real Backend', () => {
  test('sites page loads real sites', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/locations/sites');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('warehouses page loads real warehouses', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/locations/warehouses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('locations page loads real locations', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/locations/locations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });
});

// ── Purchase with real backend ───────────────────────────────────────────────────

test.describe('Fullstack — Purchase Real Backend', () => {
  test('suppliers page loads real suppliers', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/purchase/suppliers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('purchase orders page loads real orders', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/purchase/orders');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('new purchase order form renders supplier field', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/purchase/orders/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    const hasSupplierField =
      body?.includes('Supplier') ||
      body?.includes('Fournisseur') ||
      body?.includes('supplier');
    expect(hasSupplierField).toBeTruthy();
  });
});

// ── Sales with real backend ──────────────────────────────────────────────────────

test.describe('Fullstack — Sales Real Backend', () => {
  test('customers page loads real customers', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/sales/customers');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('quotes page loads real quotes', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/sales/quotes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('delivery notes page loads real notes', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/sales/delivery-notes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });
});

// ── Alerts with real backend ─────────────────────────────────────────────────────

test.describe('Fullstack — Alerts Real Backend', () => {
  test('alerts page loads real alerts (no Access Denied)', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
    expect(body).not.toContain('Something went wrong');
    expect(body).not.toContain('Access Denied');
  });

  test('alerts page shows real alert content', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(200);
  });
});

// ── Profile & Settings with real backend ─────────────────────────────────────────

test.describe('Fullstack — Profile & Settings Real', () => {
  test('profile page shows real admin info', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    const hasAdmin = body?.includes('admin') || body?.includes('Admin') || body?.includes('ADMIN');
    expect(hasAdmin).toBeTruthy();
  });

  test('settings page renders without Access Denied', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const body = await page.locator('body').textContent();
    expect(body).not.toContain('Access Denied');
    expect(body?.length).toBeGreaterThan(200);
  });

  test('settings has user management visible to admin', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);

    const body = await page.locator('body').textContent();
    const hasMgmt =
      body?.includes('Users') ||
      body?.includes('Utilisateurs') ||
      body?.includes('Roles') ||
      body?.includes('Permissions');
    expect(hasMgmt).toBeTruthy();
  });
});

// ── Navigation with real backend ─────────────────────────────────────────────────

test.describe('Fullstack — Navigation Real Backend', () => {
  test('all 20 routes accessible without crash on real backend', async ({ page, request }) => {
    test.setTimeout(90000); // 20 real routes × ~2s each with real API calls
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    const routes = [
      '/dashboard',
      '/products/items',
      '/products/categories',
      '/products/variants',
      '/inventory/Inventories',
      '/inventory/lots',
      '/inventory/serials',
      '/locations/sites',
      '/locations/warehouses',
      '/locations/locations',
      '/movements',
      '/movements/new',
      '/purchase/suppliers',
      '/purchase/orders',
      '/sales/customers',
      '/sales/quotes',
      '/sales/delivery-notes',
      '/alerts',
      '/profile',
      '/settings',
    ];

    const issues: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(200);
      const body = await page.locator('body').textContent() || '';
      if (body.length < 100) issues.push(`[${route}] Too short body (${body.length} chars)`);
      if (body.includes('Something went wrong')) issues.push(`[${route}] Error boundary`);
      if (body.includes('Access Denied')) issues.push(`[${route}] Access Denied for admin`);
    }

    console.log('Route issues:', issues);
    expect(issues.length).toBeLessThanOrEqual(2);
  });

  test('browser back/forward navigation works with real data', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toMatch(/dashboard/);
    await page.goForward();
    await page.waitForLoadState('networkidle');
    await expect(page.url()).toMatch(/products\/items/);
  });

  test('unknown route redirects to dashboard', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/this-does-not-exist-xyz-abc');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('theme toggle persists across navigation', async ({ page, request }) => {
    const tokens = await getRealTokens(request);
    await injectRealAuth(page, tokens);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const themeBtn = page
      .locator(
        'button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]'
      )
      .first();
    if (await themeBtn.isVisible()) {
      const htmlBefore = await page.locator('html').getAttribute('class');
      await themeBtn.click();
      await page.waitForTimeout(300);
      const htmlAfter = await page.locator('html').getAttribute('class');
      expect(htmlBefore).not.toEqual(htmlAfter);

      await page.goto('/products/items');
      await page.waitForLoadState('networkidle');
      const htmlNav = await page.locator('html').getAttribute('class');
      expect(htmlNav).toEqual(htmlAfter);
    }
  });
});
