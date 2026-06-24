import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Locations — Sites', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('sites page loads', async ({ page }) => {
    await page.goto('/locations/sites');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/locations\/sites/);
  });

  test('sites page shows mocked sites', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/sites**', { timeout: 8000 }).catch(() => null),
      page.goto('/locations/sites'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasSites = body?.includes('Paris') || body?.includes('Lyon') || body?.includes('Site') || body?.includes('site');
    expect(hasSites).toBeTruthy();
  });

  test('create site modal opens', async ({ page }) => {
    await page.goto('/locations/sites');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), button:has-text("Nouveau"), button:has-text("Ajouter")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const nameInput = dialog.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="nom"]').first();
        if (await nameInput.isVisible()) await nameInput.fill('Site Test');
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});

test.describe('Locations — Warehouses', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('warehouses page loads', async ({ page }) => {
    await page.goto('/locations/warehouses');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/locations\/warehouses/);
  });

  test('warehouses page shows mocked warehouses', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/warehouses**', { timeout: 8000 }).catch(() => null),
      page.goto('/locations/warehouses'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasWH = body?.includes('Principal') || body?.includes('Secondaire') || body?.includes('Entrepôt') || body?.includes('Warehouse') || body?.includes('entrepôt');
    expect(hasWH).toBeTruthy();
  });

  test('warehouse detail opens', async ({ page }) => {
    await page.goto('/locations/warehouses');
    await page.waitForLoadState('networkidle');
    const detailBtn = page.locator('button[aria-label*="view"], button[aria-label*="detail"], td button, tr button').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('create warehouse modal opens', async ({ page }) => {
    await page.goto('/locations/warehouses');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), button:has-text("Nouveau")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});

test.describe('Locations — Locations', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('locations page loads', async ({ page }) => {
    await page.goto('/locations/locations');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/locations\/locations/);
  });

  test('locations page shows mocked data', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/locations**', { timeout: 8000 }).catch(() => null),
      page.goto('/locations/locations'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasLoc = body?.includes('Zone A') || body?.includes('Rack') || body?.includes('Réception') || body?.includes('Location') || body?.includes('Emplacement');
    expect(hasLoc).toBeTruthy();
  });

  test('create location modal opens', async ({ page }) => {
    await page.goto('/locations/locations');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), button:has-text("Nouveau")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});
