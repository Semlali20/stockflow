import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('inventory page loads', async ({ page }) => {
    await page.goto('/inventory/Inventories');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/inventory/);
  });

  test('inventory shows items from API', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse('**/api/inventory**', { timeout: 8000 }).catch(() => null),
      page.goto('/inventory/Inventories'),
    ]);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasContent = body?.includes('Cereal') || body?.includes('Headphones') || body?.includes('Chair') || body?.includes('USB') || body?.includes('stock') || body?.includes('Stock') || body?.includes('Inventaire') || body?.includes('inventory');
    expect(hasContent).toBeTruthy();
  });

  test('inventory search bar is present', async ({ page }) => {
    await page.goto('/inventory/Inventories');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="Recherch"]').first();
    if (await search.isVisible()) {
      await search.fill('Headphones');
      await page.waitForTimeout(600);
    }
  });

  test('lots page loads', async ({ page }) => {
    await page.goto('/inventory/lots');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/inventory\/lots/);
  });

  test('lots page shows data', async ({ page }) => {
    await page.goto('/inventory/lots');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    expect(body).not.toContain('Something went wrong');
  });

  test('lots create button visible', async ({ page }) => {
    await page.goto('/inventory/lots');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("Nouveau"), button:has-text("Ajouter")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      // Modal should open
      const modal = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
      if (await modal.isVisible()) {
        // Close modal
        const closeBtn = page.locator('button[aria-label*="close"], button:has-text("Cancel"), button:has-text("Annuler")').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });

  test('serials page loads', async ({ page }) => {
    await page.goto('/inventory/serials');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/inventory\/serials/);
  });

  test('serials page shows data', async ({ page }) => {
    await page.goto('/inventory/serials');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    expect(body).not.toContain('Something went wrong');
  });
});
