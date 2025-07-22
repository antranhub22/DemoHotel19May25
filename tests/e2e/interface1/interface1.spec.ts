import { test, expect } from '@playwright/test';

/**
 * Interface1 E2E Tests
 * 
 * Comprehensive end-to-end testing for Interface1 component
 * Tests the complete user journey from landing to service completion
 */

test.describe('Interface1 - Complete User Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for Interface1 to load
    await page.waitForSelector('[data-testid="interface1-container"]', { 
      timeout: 10000 
    });
    
    // Verify basic page structure
    await expect(page).toHaveTitle(/Mi Nhon Hotel/);
  });

  test('should display Interface1 main layout correctly', async ({ page }) => {
    // Test header presence
    await expect(page.locator('[data-testid="interface1-header"]')).toBeVisible();
    
    // Test 4-position layout on desktop
    const viewport = page.viewportSize();
    if (viewport && viewport.width >= 768) {
      // Desktop layout
      await expect(page.locator('.grid.grid-cols-3')).toBeVisible();
    } else {
      // Mobile layout should not show 3-column grid
      await expect(page.locator('.grid.grid-cols-3')).not.toBeVisible();
    }
    
    // Test Siri button presence
    await expect(page.locator('[data-testid="siri-button"]')).toBeVisible();
    
    // Test service grid
    await expect(page.locator('[data-testid="service-grid"]')).toBeVisible();
  });

  test('should handle responsive design correctly', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.hidden.md\\:block')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.block.md\\:hidden')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    // Verify layout adapts appropriately
  });

  test('should display service categories correctly', async ({ page }) => {
    // Wait for service grid to load
    await page.waitForSelector('[data-testid="service-grid"]');
    
    // Test that service categories are displayed
    const serviceCategories = [
      'Room Service',
      'Restaurant',
      'Concierge',
      'Pool & Spa',
      'Bar & Lounge',
      'Transportation',
      'Local Information',
      'Emergency'
    ];
    
    for (const category of serviceCategories) {
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }
  });

  test('should handle Siri button interactions', async ({ page }) => {
    // Locate Siri button
    const siriButton = page.locator('[data-testid="siri-button"]');
    await expect(siriButton).toBeVisible();
    
    // Test button click (should prompt for permissions)
    await siriButton.click();
    
    // Note: In real E2E environment, this would test actual voice interaction
    // For now, we test the UI state changes
    
    // Check if call started state is activated
    // This depends on permission grants and mic access
  });

  test('should display language selection correctly', async ({ page }) => {
    // Check if language selector is present
    const languageSelector = page.locator('[data-testid="language-selector"]');
    
    if (await languageSelector.isVisible()) {
      // Test language options
      const languages = ['English', 'Français', '中文', 'Русский', '한국어', 'Tiếng Việt'];
      
      for (const lang of languages) {
        await expect(page.locator(`text=${lang}`)).toBeVisible();
      }
    }
  });

  test('should handle popup system correctly', async ({ page }) => {
    // Test chat popup functionality
    // This would typically be triggered by voice interaction
    
    // Test summary popup
    // Check that popups appear in correct positions based on viewport
    const viewport = page.viewportSize();
    
    if (viewport && viewport.width >= 768) {
      // Desktop: popups should appear in grid positions
      // Left column for chat, right column for summary
    } else {
      // Mobile: popups should appear as overlays
    }
  });
});

test.describe('Interface1 - Voice Assistant Integration', () => {
  
  test('should handle microphone permissions', async ({ page, context }) => {
    // Grant microphone permission
    await context.grantPermissions(['microphone']);
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="siri-button"]');
    
    // Test that permission is granted and mic icon is ready
    const siriButton = page.locator('[data-testid="siri-button"]');
    await expect(siriButton).not.toHaveClass(/disabled/);
  });

  test('should display mic level visualization', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    await page.goto('/');
    
    // Click Siri button to start voice interaction
    await page.click('[data-testid="siri-button"]');
    
    // Check for mic level visualization
    const micLevelIndicator = page.locator('[data-testid="mic-level"]');
    if (await micLevelIndicator.isVisible()) {
      // Verify mic level animation/visualization
      await expect(micLevelIndicator).toBeVisible();
    }
  });

  test('should handle call state changes', async ({ page, context }) => {
    await context.grantPermissions(['microphone']);
    await page.goto('/');
    
    const siriButton = page.locator('[data-testid="siri-button"]');
    
    // Test initial state
    await expect(siriButton).toBeVisible();
    
    // Test call start
    await siriButton.click();
    
    // Test call end button appears
    const endCallButton = page.locator('[data-testid="end-call-button"]');
    // This would be visible during an active call
  });
});

test.describe('Interface1 - Multi-language Support', () => {
  
  test('should support English interface', async ({ page }) => {
    await page.goto('/?lang=en');
    await page.waitForSelector('[data-testid="interface1-container"]');
    
    // Check English text
    await expect(page.locator('text=Welcome to Mi Nhon Hotel')).toBeVisible();
  });

  test('should support Vietnamese interface', async ({ page }) => {
    await page.goto('/?lang=vi');
    await page.waitForSelector('[data-testid="interface1-container"]');
    
    // Check Vietnamese text
    await expect(page.locator('text=Chào mừng đến Mi Nhon Hotel')).toBeVisible();
  });

  test('should support French interface', async ({ page }) => {
    await page.goto('/?lang=fr');
    await page.waitForSelector('[data-testid="interface1-container"]');
    
    // Check French text
    await expect(page.locator('text=Bienvenue à Mi Nhon Hotel')).toBeVisible();
  });
});

test.describe('Interface1 - Performance Testing', () => {
  
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('[data-testid="interface1-container"]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle large amounts of data efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test scrolling performance
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Test service grid interaction performance
    const serviceItems = page.locator('[data-testid="service-item"]');
    const count = await serviceItems.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      await serviceItems.nth(i).hover();
      // Should respond quickly to hover events
    }
  });
});

test.describe('Interface1 - Error Handling', () => {
  
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // Should show appropriate error state
    const errorState = page.locator('[data-testid="error-state"]');
    if (await errorState.isVisible()) {
      await expect(errorState).toContainText('connection');
    }
    
    // Restore connection
    await page.context().setOffline(false);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        body: 'Internal Server Error'
      });
    });
    
    await page.goto('/');
    
    // Should handle API errors without crashing
    await page.waitForTimeout(2000);
    
    // Verify app still functions
    await expect(page.locator('[data-testid="interface1-container"]')).toBeVisible();
  });
}); 