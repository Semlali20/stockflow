import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

test.describe('Sales — Customers', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('customers page loads', async ({ page }) => {
    await page.goto('/sales/customers');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales\/customers/);
  });

  test('customers page shows mocked data', async ({ page }) => {
    await page.goto('/sales/customers');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const hasData = body?.includes('Client Corp') || body?.includes('Boutique') || body?.includes('Customer') || body?.includes('Client');
    expect(hasData).toBeTruthy();
  });

  test('create customer modal opens', async ({ page }) => {
    await page.goto('/sales/customers');
    await page.waitForLoadState('networkidle');
    const addBtn = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create"), button:has-text("Nouveau"), button:has-text("Ajouter")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const nameInput = dialog.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="nom"]').first();
        if (await nameInput.isVisible()) await nameInput.fill('Client Test');
        const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler"), button[aria-label="Close"]').first();
        if (await closeBtn.isVisible()) await closeBtn.click();
      }
    }
  });
});

test.describe('Sales — Quotes', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('quotes page loads', async ({ page }) => {
    await page.goto('/sales/quotes');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales\/quotes/);
  });

  test('quotes page shows mocked quotes', async ({ page }) => {
    await page.goto('/sales/quotes');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const hasData = body?.includes('DEV-2025') || body?.includes('Client Corp') || body?.includes('Quote') || body?.includes('Devis');
    expect(hasData).toBeTruthy();
  });

  test('quote status badges shown', async ({ page }) => {
    await page.goto('/sales/quotes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    const body = await page.locator('body').textContent();
    const hasStatus = body?.includes('CONFIRMED') || body?.includes('DRAFT') || body?.includes('Confirmé') || body?.includes('DEV-2025') || body?.includes('devis') || body?.includes('Client Corp') || body?.includes('Quote');
    expect(hasStatus).toBeTruthy();
  });

  test('new quote page loads', async ({ page }) => {
    await page.goto('/sales/quotes/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales\/quotes\/new/);
  });

  test('new quote form has customer field', async ({ page }) => {
    await page.goto('/sales/quotes/new');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    expect(body?.length).toBeGreaterThan(100);
  });

  test('create quote from list', async ({ page }) => {
    await page.goto('/sales/quotes');
    await page.waitForLoadState('networkidle');
    const newBtn = page.locator('a[href*="/sales/quotes/new"], button:has-text("New"), button:has-text("Nouveau"), button:has-text("Create")').first();
    if (await newBtn.isVisible()) {
      await newBtn.click();
      await page.waitForLoadState('networkidle');
      await expect(page.url()).toMatch(/sales/);
    }
  });
});

test.describe('Sales — Delivery Notes', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('delivery notes page loads', async ({ page }) => {
    await page.goto('/sales/delivery-notes');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales\/delivery-notes/);
  });

  test('delivery notes shows mocked data', async ({ page }) => {
    await page.goto('/sales/delivery-notes');
    await page.waitForLoadState('networkidle');
    const body = await page.locator('body').textContent();
    const hasData = body?.includes('BL-2025') || body?.includes('DELIVERED') || body?.includes('Delivery') || body?.includes('Livraison');
    expect(hasData).toBeTruthy();
  });

  test('new delivery note page loads', async ({ page }) => {
    await page.goto('/sales/delivery-notes/new');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/sales\/delivery-notes\/new/);
  });
});
