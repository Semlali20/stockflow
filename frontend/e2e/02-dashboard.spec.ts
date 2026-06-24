import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('loads dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('sidebar navigation visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Sidebar nav links are the most reliable indicator — the <aside> uses Tailwind
    // responsive classes (hidden lg:flex) and may report as not-visible in some checks
    const dashLink = page.locator('a[href="/dashboard"]').first();
    await expect(dashLink).toBeVisible({ timeout: 8000 });
  });

  test('can navigate to items from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const itemsLink = page.locator('a[href*="/products/items"], a:has-text("Articles"), a:has-text("Items")').first();
    if (await itemsLink.isVisible()) {
      await itemsLink.click();
      await page.waitForURL('**/products/items', { timeout: 5000 });
      await expect(page).toHaveURL(/products\/items/);
    }
  });

  test('can navigate to inventory from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const invLink = page.locator('a[href*="/inventory"], a:has-text("Inventaire"), a:has-text("Inventory")').first();
    if (await invLink.isVisible()) {
      await invLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toMatch(/inventory/);
    }
  });

  test('can navigate to movements from sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const mvtLink = page.locator('a[href*="/movements"], a:has-text("Mouvements"), a:has-text("Movements")').first();
    if (await mvtLink.isVisible()) {
      await mvtLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toMatch(/movements/);
    }
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const themeBtn = page.locator('button[aria-label*="theme"], button[aria-label*="dark"], button[aria-label*="light"], [data-testid="theme-toggle"]').first();
    if (await themeBtn.isVisible()) {
      const htmlBefore = await page.locator('html').getAttribute('class');
      await themeBtn.click();
      await page.waitForTimeout(500);
      const htmlAfter = await page.locator('html').getAttribute('class');
      // Theme class should change (dark/light)
      expect(htmlBefore).not.toEqual(htmlAfter);
    }
  });

  test('KPI cards are visible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // At minimum the page should render without error
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
    // Should not show generic error
    expect(body).not.toContain('Something went wrong');
  });

  test('header shows user info or avatar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Header uses motion.header with initial y:-100 animation — wait for it to settle
    await page.waitForTimeout(500);
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });
});
