import { expect } from '@playwright/test';
/**
 * Interface1 Page Object Model
 * 
 * Encapsulates Interface1 component interactions and element selectors
 * Provides reusable methods for E2E testing
 */
export class Interface1Page {
  readonly page: Page;
  
  // Main container
  readonly container: Locator;
  readonly header: Locator;
  
  // Siri button and voice controls
  readonly siriButton: Locator;
  readonly endCallButton: Locator;
  readonly micLevelIndicator: Locator;
  readonly languageSelector: Locator;
  
  // Service grid
  readonly serviceGrid: Locator;
  readonly serviceItems: Locator;
  
  // Popups
  readonly chatPopup: Locator;
  readonly summaryPopup: Locator;
  readonly rightPanel: Locator;
  
  // Layout elements
  readonly desktopGrid: Locator;
  readonly mobileOverlay: Locator;
  
  // Error and loading states
  readonly loadingState: Locator;
  readonly errorState: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main elements
    this.container = page.locator('[data-testid="interface1-container"]');
    this.header = page.locator('[data-testid="interface1-header"]');
    
    // Voice controls
    this.siriButton = page.locator('[data-testid="siri-button"]');
    this.endCallButton = page.locator('[data-testid="end-call-button"]');
    this.micLevelIndicator = page.locator('[data-testid="mic-level"]');
    this.languageSelector = page.locator('[data-testid="language-selector"]');
    
    // Service grid
    this.serviceGrid = page.locator('[data-testid="service-grid"]');
    this.serviceItems = page.locator('[data-testid="service-item"]');
    
    // Popups
    this.chatPopup = page.locator('[data-testid="chat-popup"]');
    this.summaryPopup = page.locator('[data-testid="summary-popup"]');
    this.rightPanel = page.locator('[data-testid="right-panel"]');
    
    // Layout
    this.desktopGrid = page.locator('.grid.grid-cols-3');
    this.mobileOverlay = page.locator('[data-testid="mobile-overlay"]');
    
    // States
    this.loadingState = page.locator('[data-testid="loading-state"]');
    this.errorState = page.locator('[data-testid="error-state"]');
  }

  /**
   * Navigate to Interface1 and wait for it to load
   */
  async goto(language?: string) {
    const url = language ? `/?lang=${language}` : '/';
    await this.page.goto(url);
    await this.waitForLoad();
  }

  /**
   * Wait for Interface1 to fully load
   */
  async waitForLoad() {
    await this.container.waitFor({ timeout: 10000 });
    
    // Wait for critical elements
    await this.siriButton.waitFor();
    await this.serviceGrid.waitFor();
  }

  /**
   * Verify main layout is displayed correctly
   */
  async verifyMainLayout() {
    await expect(this.container).toBeVisible();
    await expect(this.header).toBeVisible();
    await expect(this.siriButton).toBeVisible();
    await expect(this.serviceGrid).toBeVisible();
  }

  /**
   * Verify responsive layout based on viewport
   */
  async verifyResponsiveLayout(viewport: { width: number; height: number }) {
    if (viewport.width >= 768) {
      // Desktop layout
      await expect(this.desktopGrid).toBeVisible();
    } else {
      // Mobile layout
      await expect(this.desktopGrid).not.toBeVisible();
    }
  }

  /**
   * Start a voice call
   */
  async startVoiceCall() {
    await this.siriButton.click();
    
    // Wait for call state change
    await this.page.waitForTimeout(1000);
  }

  /**
   * End a voice call
   */
  async endVoiceCall() {
    if (await this.endCallButton.isVisible()) {
      await this.endCallButton.click();
    }
  }

  /**
   * Select a language
   */
  async selectLanguage(language: string) {
    if (await this.languageSelector.isVisible()) {
      await this.languageSelector.click();
      await this.page.locator(`[data-language="${language}"]`).click();
    }
  }

  /**
   * Click on a service category
   */
  async clickServiceCategory(categoryName: string) {
    const serviceItem = this.page.locator('[data-testid="service-item"]', {
      hasText: categoryName
    });
    await serviceItem.click();
  }

  /**
   * Verify service categories are displayed
   */
  async verifyServiceCategories() {
    const expectedCategories = [
      'Room Service',
      'Restaurant', 
      'Concierge',
      'Pool & Spa',
      'Bar & Lounge',
      'Transportation',
      'Local Information',
      'Emergency'
    ];

    for (const category of (expectedCategories as any[])) {
      await expect(this.page.locator(`text=${category}`)).toBeVisible();
    }
  }

  /**
   * Verify chat popup is displayed
   */
  async verifyChatPopup(shouldBeVisible: boolean = true) {
    if (shouldBeVisible) {
      await expect(this.chatPopup).toBeVisible();
    } else {
      await expect(this.chatPopup).not.toBeVisible();
    }
  }

  /**
   * Verify summary popup is displayed
   */
  async verifySummaryPopup(shouldBeVisible: boolean = true) {
    if (shouldBeVisible) {
      await expect(this.summaryPopup).toBeVisible();
    } else {
      await expect(this.summaryPopup).not.toBeVisible();
    }
  }

  /**
   * Close popup by clicking close button
   */
  async closePopup(popupType: 'chat' | 'summary') {
    const popup = popupType === 'chat' ? this.chatPopup : this.summaryPopup;
    const closeButton = popup.locator('[data-testid="close-button"]');
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Verify loading state
   */
  async verifyLoadingState(shouldBeVisible: boolean = true) {
    if (shouldBeVisible) {
      await expect(this.loadingState).toBeVisible();
    } else {
      await expect(this.loadingState).not.toBeVisible();
    }
  }

  /**
   * Verify error state
   */
  async verifyErrorState(shouldBeVisible: boolean = true) {
    if (shouldBeVisible) {
      await expect(this.errorState).toBeVisible();
    } else {
      await expect(this.errorState).not.toBeVisible();
    }
  }

  /**
   * Wait for specific element to be visible with timeout
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.locator(selector).waitFor({ timeout });
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/e2e/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Measure page load performance
   */
  async measureLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForLoad();
    return Date.now() - startTime;
  }

  /**
   * Check if mic level visualization is working
   */
  async verifyMicLevelVisualization() {
    if (await this.micLevelIndicator.isVisible()) {
      // Check if mic level indicator has animation or changing values
      const initialState = await this.micLevelIndicator.getAttribute('data-level');
      await this.page.waitForTimeout(500);
      const laterState = await this.micLevelIndicator.getAttribute('data-level');
      
      // Verify mic level changes (indicates working microphone)
      return initialState !== laterState;
    }
    return false;
  }
} 