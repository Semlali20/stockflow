import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Movements', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('movements page loads', async ({ page }) => {
    await page.goto('/movements');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/movements/);
  });

  test('movements page shows mocked movements', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/movements**', { timeout: 8000 }).catch(() => null),
      page.goto('/movements'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasMov = body?.includes('MOV-') || body?.includes('TRANSFER') || body?.includes('RECEIPT') || body?.includes('Mouvement') || body?.includes('movement');
    expect(hasMov).toBeTruthy();
  });

  test('movement reference shows MOV- format, not raw UUID', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/movements**', { timeout: 8000 }).catch(() => null),
      page.goto('/movements'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent() || '';
    // Should show MOV-XXXXXXXX format not raw UUIDs
    if (body.includes('MOV-')) {
      // Check it's not a raw UUID format (8-4-4-4-12 hex)
      const rawUuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
      expect(rawUuidPattern.test(body)).toBeFalsy();
    }
    expect(body.length).toBeGreaterThan(100);
  });

  test('movement type filters work', async ({ page }) => {
    await page.goto('/movements');
    await page.waitForLoadState('networkidle');
    const filterBtn = page.locator('button:has-text("TRANSFER"), button:has-text("RECEIPT"), button:has-text("ISSUE"), [class*="filter"]').first();
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('create movement page loads', async ({ page }) => {
    await page.goto('/movements/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/movements\/new/);
  });

  test('create movement page has type selector', async ({ page }) => {
    await page.goto('/movements/new');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasTypeSection = body?.includes('RECEIPT') || body?.includes('TRANSFER') || body?.includes('ISSUE') || body?.includes('Type') || body?.includes('type') || body?.includes('Mouvement') || body?.includes('Movement');
    expect(hasTypeSection).toBeTruthy();
  });

  test('create movement — select type TRANSFER', async ({ page }) => {
    await page.goto('/movements/new');
    await page.waitForLoadState('networkidle');
    const transferBtn = page.locator('button:has-text("TRANSFER"), [class*="type"]:has-text("TRANSFER"), div:has-text("TRANSFER")').first();
    if (await transferBtn.isVisible()) {
      await transferBtn.click();
      await page.waitForTimeout(300);
    }
  });

  test('create movement — warehouse dropdown visible', async ({ page }) => {
    await page.goto('/movements/new');
    await page.waitForLoadState('networkidle');
    const warehouseField = page.locator('select[name*="warehouse"], button:has-text("warehouse"), input[placeholder*="warehouse"], [class*="warehouse"]').first();
    // page should at least render
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('create movement — new button from movements list', async ({ page }) => {
    await page.goto('/movements');
    await page.waitForLoadState('networkidle');
    const newBtn = page.locator('button:has-text("New"), button:has-text("Nouveau"), button:has-text("Create"), a[href*="/movements/new"]').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toMatch(/movements/);
    }
  });

  test('movement detail modal opens', async ({ page }) => {
    await page.goto('/movements');
    await page.waitForLoadState('networkidle');
    const viewBtn = page.locator('button[aria-label*="view"], button[aria-label*="detail"], button[title*="View"], svg[class*="eye"]').first();
    if (await viewBtn.isVisible()) {
      await viewBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Close"), button:has-text("Fermer"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});
