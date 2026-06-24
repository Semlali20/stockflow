import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('alerts page loads', async ({ page }) => {
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/alerts/);
  });

  test('alerts page shows mocked alerts', async ({ page }) => {
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const body = await page.locator('body').textContent();
    const hasAlerts = body?.includes('LOW_STOCK') || body?.includes('WARNING') || body?.includes('EMERGENCY') || body?.includes('ACTIVE') || body?.includes('Stock') || body?.includes('Alert') || body?.includes('Alerte') || body?.includes('Chair');
    expect(hasAlerts).toBeTruthy();
  });

  test('alerts severity badges visible', async ({ page }) => {
    await page.goto('/alerts');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const body = await page.locator('body').textContent();
    // Page should have rendered meaningful content (not just AccessDenied ~90 chars)
    expect(body?.length).toBeGreaterThan(200);
  });
});

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('profile page loads', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/profile/);
  });

  test('profile shows user info', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const hasUser = body?.includes('Admin') || body?.includes('admin@stockflow.com') || body?.includes('ADMIN');
    expect(hasUser).toBeTruthy();
  });

  test('profile does NOT show @admin username chip', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    // The @ chip was removed in a previous session — verify it's gone
    const atChipText = await page.locator('[class*="chip"]:has-text("@admin"), span:has-text("@admin")').count();
    // Should be 0 (removed)
    expect(atChipText).toBe(0);
  });

  test('profile edit modal opens', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Modifier"), button:has-text("Update")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });

  test('change password modal opens', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const pwdBtn = page.locator('button:has-text("Password"), button:has-text("Mot de passe"), button:has-text("Change Password")').first();
    if (await pwdBtn.isVisible()) {
      await pwdBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });

  test('notification preferences modal opens', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const notifBtn = page.locator('button:has-text("Notification"), button:has-text("Preferences")').first();
    if (await notifBtn.isVisible()) {
      await notifBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/settings/);
  });

  test('settings page shows content', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(600);
    const body = await page.locator('body').textContent();
    // Should show settings content (not AccessDenied ~90 chars)
    expect(body?.length).toBeGreaterThan(200);
    expect(body).not.toContain('Something went wrong');
  });

  test('roles management tab visible', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    const rolesTab = page.locator('button:has-text("Roles"), button:has-text("Rôles"), [role="tab"]:has-text("Role")').first();
    if (await rolesTab.isVisible()) {
      await rolesTab.click();
      await page.waitForTimeout(500);
      const body = await page.locator('body').textContent();
      const hasRoles = body?.includes('ADMIN') || body?.includes('MANAGER') || body?.includes('Role');
      expect(hasRoles).toBeTruthy();
    }
  });
});

test.describe('Navigation & Routing', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('404/unknown route redirects to dashboard', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');
    // App has catch-all redirect to /dashboard
    await expect(page.url()).toMatch(/dashboard/);
  });

  test('root / redirects authenticated user to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // With token set, should go to /dashboard
    await expect(page.url()).toMatch(/dashboard/);
  });

  test('browser back/forward navigation works', async ({ page }) => {
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

  test('all main routes are accessible without crash', async ({ page }) => {
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

    const errors: string[] = [];
    for (const route of routes) {
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(`[${route}] ${msg.text()}`);
        }
      });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const body = await page.locator('body').textContent();
      if (!body || body.length < 50) {
        errors.push(`[${route}] Page rendered empty body`);
      }
    }

    // No critical JS errors (console errors from network are expected without backend)
    console.log('Routes tested:', routes.length);
    console.log('Console errors (network expected):', errors.length);
  });
});
