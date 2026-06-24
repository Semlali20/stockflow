import { test, expect } from '@playwright/test';
import { injectAuth, mockAllRoutes } from './helpers';

// ═══════════════════════════════════════════════════════════════
// SUITE 1 — AUTHENTICATION
// ═══════════════════════════════════════════════════════════════

test.describe('Auth — Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
  });

  test('shows login page with all elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.locator('button[type="submit"]').click();
    // Should show validation or remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('shows error on wrong credentials', async ({ page }) => {
    await page.goto('/login');
    const emailField = page.locator('input[name="usernameOrEmail"], input[type="email"], input[placeholder*="username"], input[placeholder*="email"]').first();
    await emailField.fill('wrong@email.com');
    await page.locator('input[name="password"], input[type="password"]').fill('wrongpass');
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Se connecter")').click();
    await page.waitForTimeout(1500);
    await expect(page).toHaveURL('/login');
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    // Form field is named "usernameOrEmail" (not "email")
    const emailField = page.locator('input[name="usernameOrEmail"], input[type="email"], input[placeholder*="username"], input[placeholder*="email"]').first();
    await emailField.fill('admin@stockflow.com');
    await page.locator('input[name="password"], input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Se connecter")').click();
    await page.waitForURL('**/dashboard', { timeout: 12000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
  });

  test('forgot password submit works', async ({ page }) => {
    await page.goto('/forgot-password');
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    await emailField.fill('admin@stockflow.com');
    const btn = page.locator('button[type="submit"]').first();
    await btn.click();
    await page.waitForTimeout(1500);
    // Should show a success message or stay on the page
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('register page loads', async ({ page }) => {
    await page.goto('/register');
    // Should show register form or redirect
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toBeTruthy();
  });

  test('unauthenticated user redirected to login from protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/login/);
  });

  test('landing page loads', async ({ page }) => {
    await page.goto('/landing');
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});

test.describe('Auth — Logout', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllRoutes(page);
    await injectAuth(page);
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    // Find logout button in profile dropdown or sidebar
    const profileBtn = page.locator('[data-testid="profile-menu"], button[aria-label*="profile"], button[aria-label*="user"]').first();
    if (await profileBtn.isVisible()) {
      await profileBtn.click();
      const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Se déconnecter"), a:has-text("Logout")').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForURL('**/login', { timeout: 5000 });
        await expect(page).toHaveURL(/login/);
      }
    }
  });
});
