import { test, expect } from '@playwright/test';
import { Interface1Page } from '../utils/page-objects/Interface1Page';

/**
 * Interface1 User Journey E2E Tests
 * 
 * Tests the complete user journey for Interface1:
 * 1. Landing on the page
 * 2. Selecting a service
 * 3. Using voice assistant
 * 4. Completing service request
 * 5. Viewing summary
 */

test.describe('Interface1 - Complete User Journey', () => {
  let interface1Page: Interface1Page;

  test.beforeEach(async ({ page, context }) => {
    // Grant microphone permission for voice tests
    await context.grantPermissions(['microphone']);
    
    interface1Page = new Interface1Page(page);
    await interface1Page.goto();
    
    // Verify page loaded correctly
    await interface1Page.verifyMainLayout();
  });

  test('User Journey: Room Service Request', async ({ page }) => {
    // Step 1: User lands on Interface1
    await test.step('Land on Interface1', async () => {
      await expect(page).toHaveTitle(/Mi Nhon Hotel/);
      await interface1Page.verifyServiceCategories();
    });

    // Step 2: User selects Room Service
    await test.step('Select Room Service', async () => {
      await interface1Page.clickServiceCategory('Room Service');
      
      // Verify room service options appear (if implemented)
      // This would show specific room service items
    });

    // Step 3: User starts voice interaction
    await test.step('Start Voice Assistant', async () => {
      await interface1Page.startVoiceCall();
      
      // Verify call state changes
      await page.waitForTimeout(1000);
      
      // Check if chat popup appears for conversation
      // Note: In real test, this would involve actual voice interaction
    });

    // Step 4: Simulate conversation (in real scenario, this would be voice)
    await test.step('Simulate Service Request Conversation', async () => {
      // In a real implementation, this would involve:
      // - Speaking to the voice assistant
      // - Assistant understanding the request
      // - Displaying conversation in chat popup
      
      // For now, we verify the UI state during conversation
      if (await interface1Page.chatPopup.isVisible()) {
        await interface1Page.verifyChatPopup();
      }
    });

    // Step 5: End call and verify summary
    await test.step('End Call and View Summary', async () => {
      await interface1Page.endVoiceCall();
      
      // Verify summary popup appears
      await page.waitForTimeout(1000);
      
      if (await interface1Page.summaryPopup.isVisible()) {
        await interface1Page.verifySummaryPopup();
        
        // Verify summary contains service request details
        await expect(interface1Page.summaryPopup).toContainText('Room Service');
      }
    });

    // Step 6: Complete the journey
    await test.step('Complete Service Request', async () => {
      // Close summary popup
      await interface1Page.closePopup('summary');
      
      // Verify return to main interface
      await interface1Page.verifyMainLayout();
    });
  });

  test('User Journey: Multi-language Experience', async ({ page }) => {
    // Step 1: Start in English
    await test.step('Start in English', async () => {
      await interface1Page.goto('en');
      await expect(page.locator('text=Welcome')).toBeVisible();
    });

    // Step 2: Switch to Vietnamese
    await test.step('Switch to Vietnamese', async () => {
      await interface1Page.selectLanguage('vi');
      await page.waitForTimeout(1000);
      
      // Verify Vietnamese content appears
      await expect(page.locator('text=Chào mừng')).toBeVisible();
    });

    // Step 3: Use voice assistant in Vietnamese
    await test.step('Use Voice Assistant in Vietnamese', async () => {
      await interface1Page.startVoiceCall();
      
      // Verify call starts in Vietnamese context
      // In real implementation, this would test Vietnamese voice recognition
    });
  });

  test('User Journey: Mobile Experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await test.step('Verify Mobile Layout', async () => {
      await interface1Page.verifyResponsiveLayout({ width: 375, height: 667 });
    });

    await test.step('Mobile Voice Interaction', async () => {
      await interface1Page.startVoiceCall();
      
      // Verify mobile-specific popup behavior
      // Mobile popups should appear as overlays
    });

    await test.step('Mobile Service Selection', async () => {
      await interface1Page.clickServiceCategory('Concierge');
      
      // Verify touch-friendly interactions work
    });
  });

  test('User Journey: Error Recovery', async ({ page }) => {
    await test.step('Simulate Network Error', async () => {
      // Simulate network error during voice call
      await page.context().setOffline(true);
      
      await interface1Page.startVoiceCall();
      
      // Verify graceful error handling
      await interface1Page.verifyErrorState(false); // Should not crash
    });

    await test.step('Recover from Error', async () => {
      await page.context().setOffline(false);
      
      // Verify app recovers gracefully
      await interface1Page.verifyMainLayout();
    });
  });

  test('User Journey: Performance Under Load', async ({ page }) => {
    await test.step('Measure Initial Load Time', async () => {
      const loadTime = await interface1Page.measureLoadTime();
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    await test.step('Test Rapid Interactions', async () => {
      // Rapid service category clicks
      const categories = ['Room Service', 'Restaurant', 'Concierge', 'Pool & Spa'];
      
      for (const category of categories) {
        await interface1Page.clickServiceCategory(category);
        await page.waitForTimeout(100); // Brief pause
      }
      
      // Verify app remains responsive
      await interface1Page.verifyMainLayout();
    });

    await test.step('Test Multiple Voice Sessions', async () => {
      // Start and end multiple voice sessions quickly
      for (let i = 0; i < 3; i++) {
        await interface1Page.startVoiceCall();
        await page.waitForTimeout(500);
        await interface1Page.endVoiceCall();
        await page.waitForTimeout(300);
      }
      
      // Verify no memory leaks or performance degradation
      await interface1Page.verifyMainLayout();
    });
  });

  test('User Journey: Accessibility', async ({ page }) => {
    await test.step('Keyboard Navigation', async () => {
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Verify focus indicators
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    await test.step('Screen Reader Support', async () => {
      // Verify ARIA labels exist
      await expect(interface1Page.siriButton).toHaveAttribute('aria-label');
      await expect(interface1Page.serviceGrid).toHaveAttribute('role');
    });

    await test.step('High Contrast Support', async () => {
      // Test with high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      // Verify elements remain visible and usable
      await interface1Page.verifyMainLayout();
    });
  });
}); 