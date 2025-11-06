import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display the hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero section
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');

    // Click on "Shop Now" or products link
    await page.click('text=Shop Now');

    // Verify we're on the products page
    await expect(page).toHaveURL(/.*products/);
  });

  test('should display featured products', async ({ page }) => {
    await page.goto('/');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Count product cards
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should open cart drawer', async ({ page }) => {
    await page.goto('/');

    // Click cart button
    await page.click('[data-testid="cart-button"]');

    // Verify cart drawer is visible
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });
});
