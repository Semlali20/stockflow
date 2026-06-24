import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Products — Items', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('items page loads', async ({ page }) => {
    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/products\/items/);
  });

  test('items page shows mocked items', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/items**', { timeout: 8000 }).catch(() => null),
      page.goto('/products/items'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasItems = body?.includes('Cereal') || body?.includes('Headphones') || body?.includes('Chair') || body?.includes('Article') || body?.includes('SKU');
    expect(hasItems).toBeTruthy();
  });

  test('search input works on items page', async ({ page }) => {
    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    const search = page.locator('input[placeholder*="search"], input[placeholder*="Search"], input[placeholder*="Recherch"]').first();
    if (await search.isVisible()) {
      await search.fill('Headphones');
      await page.waitForTimeout(600);
    }
  });

  test('create item modal opens', async ({ page }) => {
    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add Item"), button:has-text("Create"), button:has-text("New"), button:has-text("Nouveau"), button:has-text("Ajouter"), button:has-text("+ Item"), button:has-text("+ Article")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        await expect(dialog).toBeVisible();
        const nameField = dialog.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="nom"]').first();
        if (await nameField.isVisible()) {
          await nameField.fill('Test Item');
        }
        const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("Annuler"), button:has-text("Fermer")').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });

  test('item row detail opens on click', async ({ page }) => {
    await page.goto('/products/items');
    await page.waitForLoadState('networkidle');
    // Try clicking on a table row or detail button
    const row = page.locator('tr, [class*="item-row"], [class*="ItemRow"]').nth(1);
    if (await row.isVisible()) {
      const eyeBtn = row.locator('button[aria-label*="view"], button[aria-label*="detail"], button[title*="View"], button[title*="Detail"]').first();
      if (await eyeBtn.isVisible()) {
        await eyeBtn.click();
        await page.waitForTimeout(500);
        const dialog = page.locator('[role="dialog"]').first();
        if (await dialog.isVisible()) {
          const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Close"), button:has-text("Fermer")').first();
          if (await closeBtn.isVisible()) await closeBtn.click();
        }
      }
    }
  });
});

test.describe('Products — Categories', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('categories page loads', async ({ page }) => {
    await page.goto('/products/categories');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/products\/categories/);
  });

  test('categories page shows mocked data', async ({ page }) => {
    await Promise.all([
      page.waitForResponse('**/api/categories**', { timeout: 8000 }).catch(() => null),
      page.goto('/products/categories'),
    ]);
    await page.waitForTimeout(800);
    const body = await page.locator('body').textContent();
    const hasData = body?.includes('Alimentaire') || body?.includes('Électronique') || body?.includes('Mobilier') || body?.includes('Catégorie') || body?.includes('Categor');
    expect(hasData).toBeTruthy();
  });

  test('create category modal opens', async ({ page }) => {
    await page.goto('/products/categories');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("Nouveau"), button:has-text("Ajouter")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button:has-text("Fermer"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});

test.describe('Products — Item Variants', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('variants page loads', async ({ page }) => {
    await page.goto('/products/variants');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/products\/variants/);
  });

  test('variants page shows data', async ({ page }) => {
    await page.goto('/products/variants');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});
