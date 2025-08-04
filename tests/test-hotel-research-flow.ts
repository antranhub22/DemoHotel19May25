#!/usr/bin/env tsx

import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle } from "drizzle-orm/postgres-js";
import * as fs from "fs";

// Import services
import { HotelResearchService } from "@server/services/hotelResearch";
import { KnowledgeBaseGenerator } from "@server/services/knowledgeBaseGenerator";
import {
  AssistantGeneratorService,
  VapiIntegrationService,
} from "@server/services/vapiIntegration";

// Import schema
// ✅ MIGRATION: Using Prisma generated types instead of Drizzle
// import { hotelProfiles } from '@shared/db/schema'; // REMOVED
// ============================================
// Test Configuration & Types
// ============================================

interface TestConfig {
  databaseUrl?: string;
  testDbPath: string;
  useMockData: boolean;
  skipApiCalls: boolean;
  verbose: boolean;
  testTimeout: number;
}

interface TestResults {
  success: boolean;
  startTime: number;
  endTime: number;
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  steps: TestStep[];
  errors: TestError[];
  coverage: TestCoverage;
}

interface TestStep {
  id: string;
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  startTime: number;
  endTime: number;
  duration: number;
  details?: any;
  error?: string;
}

interface TestError {
  step: string;
  message: string;
  stack?: string;
  details?: any;
}

interface TestCoverage {
  hotelResearch: {
    basicResearch: boolean;
    advancedResearch: boolean;
    googlePlacesApi: boolean;
    websiteScraping: boolean;
    errorHandling: boolean;
  };
  knowledgeBase: {
    generation: boolean;
    systemPrompt: boolean;
    validation: boolean;
  };
  vapiIntegration: {
    assistantCreation: boolean;
    assistantUpdate: boolean;
    errorHandling: boolean;
  };
  database: {
    storage: boolean;
    retrieval: boolean;
    tenantIsolation: boolean;
  };
}

// ============================================
// Mock Data for Testing
// ============================================

const MOCK_HOTEL_DATA = {
  name: "Grand Test Hotel",
  address: "123 Test Street, Test City, Test Country",
  phone: "+1-555-TEST-HOTEL",
  website: "https://grandtesthotel.com",
  rating: 4.5,
  priceLevel: 3,
  location: {
    lat: 10.7769,
    lng: 106.7009,
  },
  categories: ["lodging", "establishment"],
  openingHours: [
    "Monday: 24 hours",
    "Tuesday: 24 hours",
    "Wednesday: 24 hours",
    "Thursday: 24 hours",
    "Friday: 24 hours",
    "Saturday: 24 hours",
    "Sunday: 24 hours",
  ],
  photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
  services: [
    {
      name: "Room Service",
      description: "24/7 room service available",
      type: "room_service",
      available: true,
      hours: "24/7",
    },
    {
      name: "Spa & Wellness",
      description: "Full service spa with massage and treatments",
      type: "spa",
      available: true,
      hours: "8:00 AM - 10:00 PM",
    },
    {
      name: "Restaurant",
      description: "Fine dining restaurant with international cuisine",
      type: "restaurant",
      available: true,
      hours: "6:00 AM - 11:00 PM",
    },
  ],
  amenities: [
    "Free WiFi",
    "Swimming Pool",
    "Fitness Center",
    "Business Center",
    "Concierge Service",
    "Airport Shuttle",
    "Parking Available",
  ],
  policies: {
    checkIn: "3:00 PM",
    checkOut: "11:00 AM",
    cancellation: "24 hours before arrival",
    petPolicy: "Pets allowed with additional fee",
    smokingPolicy: "Non-smoking property",
  },
  roomTypes: [
    {
      name: "Standard Room",
      price: 120,
      description: "Comfortable room with city view",
      capacity: 2,
      amenities: ["Free WiFi", "Air Conditioning", "Mini Bar"],
    },
    {
      name: "Deluxe Suite",
      price: 250,
      description: "Spacious suite with separate living area",
      capacity: 4,
      amenities: ["Free WiFi", "Air Conditioning", "Kitchen", "Balcony"],
    },
  ],
  localAttractions: [
    {
      name: "Test Museum",
      description: "Famous local museum with historical artifacts",
      distance: "0.5 km",
      type: "museum",
    },
    {
      name: "Test Beach",
      description: "Beautiful sandy beach with clear water",
      distance: "2 km",
      type: "beach",
    },
  ],
};

const MOCK_KNOWLEDGE_BASE = `
HOTEL INFORMATION:
Name: Grand Test Hotel
Location: 123 Test Street, Test City, Test Country
Phone: +1-555-TEST-HOTEL
Website: https://grandtesthotel.com
Rating: 4.5/5 stars

SERVICES AVAILABLE:
- Room Service: 24/7 room service available (Available 24/7)
- Spa & Wellness: Full service spa with massage and treatments (Available 8:00 AM - 10:00 PM)
- Restaurant: Fine dining restaurant with international cuisine (Available 6:00 AM - 11:00 PM)

ROOM TYPES:
- Standard Room: $120/night - Comfortable room with city view (Capacity: 2)
- Deluxe Suite: $250/night - Spacious suite with separate living area (Capacity: 4)

AMENITIES:
Free WiFi, Swimming Pool, Fitness Center, Business Center, Concierge Service, Airport Shuttle, Parking Available

POLICIES:
Check-in: 3:00 PM
Check-out: 11:00 AM
Cancellation: 24 hours before arrival

LOCAL ATTRACTIONS:
- Test Museum: Famous local museum with historical artifacts (0.5 km away)
- Test Beach: Beautiful sandy beach with clear water (2 km away)
`;

// ============================================
// Hotel Research Flow Test Class
// ============================================

export class HotelResearchFlowTest {
  private config: TestConfig;
  private results: TestResults;
  private db: any;
  private testTenantId: string | null = null;

  // Service instances
  private hotelResearchService: HotelResearchService;
  private knowledgeBaseGenerator: KnowledgeBaseGenerator;
  private vapiIntegrationService: VapiIntegrationService;
  private assistantGeneratorService: AssistantGeneratorService;

  constructor(config: Partial<TestConfig> = {}) {
    this.config = {
      databaseUrl: process.env.DATABASE_URL,
      testDbPath: "./test-hotel-research.db",
      useMockData: false,
      skipApiCalls: false,
      verbose: true,
      testTimeout: 30000,
      ...config,
    };

    this.results = {
      success: false,
      startTime: 0,
      endTime: 0,
      duration: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      steps: [],
      errors: [],
      coverage: {
        hotelResearch: {
          basicResearch: false,
          advancedResearch: false,
          googlePlacesApi: false,
          websiteScraping: false,
          errorHandling: false,
        },
        knowledgeBase: {
          generation: false,
          systemPrompt: false,
          validation: false,
        },
        vapiIntegration: {
          assistantCreation: false,
          assistantUpdate: false,
          errorHandling: false,
        },
        database: {
          storage: false,
          retrieval: false,
          tenantIsolation: false,
        },
      },
    };

    // Initialize services
    this.hotelResearchService = new HotelResearchService();
    this.knowledgeBaseGenerator = new KnowledgeBaseGenerator();
    this.vapiIntegrationService = new VapiIntegrationService();
    this.assistantGeneratorService = new AssistantGeneratorService();
  }

  // ============================================
  // Main Test Runner
  // ============================================

  async runCompleteTest(): Promise<TestResults> {
    this.results.startTime = performance.now();
    this.log("🧪 Starting Hotel Research Flow Test Suite...", "info");

    try {
      // Test 1: Initialize test environment
      await this.executeTest(
        "initialize-test-env",
        "Initialize Test Environment",
        () => this.initializeTestEnvironment(),
      );

      // Test 2: Test hotel research (complete flow)
      await this.executeTest(
        "test-hotel-research-flow",
        "Test Complete Hotel Research Flow",
        () => this.testCompleteHotelResearchFlow(),
      );

      // Test 3: Test Google Places API integration
      await this.executeTest(
        "test-google-places-api",
        "Test Google Places API Integration",
        () => this.testGooglePlacesApiIntegration(),
      );

      // Test 4: Test knowledge base generation
      await this.executeTest(
        "test-knowledge-base-generation",
        "Test Knowledge Base Generation",
        () => this.testKnowledgeBaseGeneration(),
      );

      // Test 5: Test Vapi assistant creation
      await this.executeTest(
        "test-vapi-assistant-creation",
        "Test Vapi Assistant Creation",
        () => this.testVapiAssistantCreation(),
      );

      // Test 6: Test database storage
      await this.executeTest(
        "test-database-storage",
        "Test Database Storage",
        () => this.testDatabaseStorage(),
      );

      // Test 7: Test with mock data
      await this.executeTest("test-with-mock-data", "Test with Mock Data", () =>
        this.testWithMockData(),
      );

      // Test 8: Test error scenarios
      await this.executeTest(
        "test-error-scenarios",
        "Test Error Scenarios",
        () => this.testErrorScenarios(),
      );

      // Test 9: Test API rate limiting
      await this.executeTest(
        "test-api-rate-limiting",
        "Test API Rate Limiting",
        () => this.testApiRateLimiting(),
      );

      // Test 10: Test tenant isolation
      await this.executeTest(
        "test-tenant-isolation",
        "Test Tenant Isolation",
        () => this.testTenantIsolation(),
      );

      // Calculate final results
      this.results.success = this.results.testsFailed === 0;
      this.results.endTime = performance.now();
      this.results.duration = this.results.endTime - this.results.startTime;

      this.log(
        `🎉 Test Suite Complete! ${this.results.testsPassed}/${this.results.testsRun} tests passed`,
        this.results.success ? "success" : "error",
      );

      return this.results;
    } catch (error) {
      this.results.success = false;
      this.results.endTime = performance.now();
      this.results.duration = this.results.endTime - this.results.startTime;
      this.results.errors.push({
        step: "test-suite",
        message: (error as any)?.message || String(error),
        stack: (error as any)?.stack,
      });
      this.log(
        `💥 Test Suite Failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      return this.results;
    }
  }

  // ============================================
  // Test Implementation Methods
  // ============================================

  private async initializeTestEnvironment(): Promise<void> {
    this.log("🔧 Setting up test environment...", "info");

    // Initialize database connection
    const isPostgres = this.config.databaseUrl?.includes("postgres");

    if (isPostgres && this.config.databaseUrl) {
      this.log("Connecting to PostgreSQL database...", "info");
      const { postgres } = await import("postgres");
      const client = postgres(this.config.databaseUrl);
      this.db = drizzle(client);
    } else {
      this.log("Using SQLite database for testing...", "info");
      if (fs.existsSync(this.config.testDbPath)) {
        fs.unlinkSync(this.config.testDbPath);
      }
      const sqlite = new Database(this.config.testDbPath);
      this.db = drizzleSqlite(sqlite);
    }

    // Test database connection
    await this.db.select().from(tenants).limit(1);
    this.log("✅ Database connection established", "success");

    // Create test tenant
    this.testTenantId = `test-tenant-${Date.now()}`;
    await this.db.insert(tenants).values({
      id: this.testTenantId,
      hotelName: "Test Hotel for Research Flow",
      subdomain: "test-hotel-research",
      subscriptionPlan: "premium",
      subscriptionStatus: "active",
      maxVoices: 10,
      maxLanguages: 5,
      voiceCloning: true,
      multiLocation: true,
      whiteLabel: true,
      dataRetentionDays: 365,
      monthlyCallLimit: 10000,
    });

    this.log(`✅ Test tenant created: ${this.testTenantId}`, "success");
  }

  private async testCompleteHotelResearchFlow(): Promise<void> {
    this.log("🏨 Testing complete hotel research flow...", "info");

    // Test the complete flow: Hotel name → Research → Knowledge Base → Assistant → Database
    const testHotelName = "Grand Test Hotel";
    const testLocation = "Test City";

    try {
      // Step 1: Hotel research
      let hotelData;
      if (this.config.useMockData || this.config.skipApiCalls) {
        this.log("📋 Using mock data for hotel research...", "info");
        hotelData = MOCK_HOTEL_DATA;
      } else {
        this.log("🔍 Performing actual hotel research...", "info");
        hotelData = await this.hotelResearchService.basicResearch(
          testHotelName,
          testLocation,
        );
      }

      // Validate hotel data structure
      if (!hotelData || !hotelData.name || !hotelData.address) {
        throw new Error("Invalid hotel data structure returned from research");
      }

      this.log(`✅ Hotel research completed: ${hotelData.name}`, "success");
      this.results.coverage.hotelResearch.basicResearch = true;

      // Step 2: Knowledge base generation
      this.log("📚 Generating knowledge base...", "info");
      const knowledgeBase =
        this.knowledgeBaseGenerator.generateKnowledgeBase(hotelData);

      if (!knowledgeBase || knowledgeBase.length < 100) {
        throw new Error("Knowledge base generation failed or too short");
      }

      this.log(
        `✅ Knowledge base generated (${knowledgeBase.length} characters)`,
        "success",
      );
      this.results.coverage.knowledgeBase.generation = true;

      // Step 3: System prompt generation
      this.log("🤖 Generating system prompt...", "info");
      const systemPrompt = this.knowledgeBaseGenerator.generateSystemPrompt(
        hotelData,
        {
          personality: "professional",
          tone: "friendly",
          languages: ["English"],
        },
      );

      if (!systemPrompt || systemPrompt.length < 50) {
        throw new Error("System prompt generation failed or too short");
      }

      this.log(
        `✅ System prompt generated (${systemPrompt.length} characters)`,
        "success",
      );
      this.results.coverage.knowledgeBase.systemPrompt = true;

      // Step 4: Assistant creation (mock or real)
      let assistantId;
      if (this.config.skipApiCalls) {
        this.log("🤖 Mocking assistant creation...", "info");
        assistantId = `mock-assistant-${Date.now()}`;
      } else {
        this.log("🤖 Creating Vapi assistant...", "info");
        assistantId = await this.assistantGeneratorService.generateAssistant(
          hotelData,
          {
            personality: "professional",
            tone: "friendly",
            languages: ["English"],
            voiceId: "jennifer",
            backgroundSound: "hotel-lobby",
          },
        );
      }

      if (!assistantId) {
        throw new Error("Assistant creation failed");
      }

      this.log(`✅ Assistant created: ${assistantId}`, "success");
      this.results.coverage.vapiIntegration.assistantCreation = true;

      // Step 5: Database storage
      this.log("💾 Storing research data in database...", "info");
      await this.db.insert(hotelProfiles).values({
        id: `profile-${Date.now()}`,
        tenantId: this.testTenantId,
        researchData: hotelData,
        knowledgeBase,
        systemPrompt,
        vapiAssistantId: assistantId,
        assistantConfig: {
          personality: "professional",
          tone: "friendly",
          languages: ["English"],
        },
      });

      this.log("✅ Research data stored in database", "success");
      this.results.coverage.database.storage = true;

      // Step 6: Verify storage and retrieval
      this.log("🔍 Verifying data retrieval...", "info");
      const storedProfile = await this.db
        .select()
        .from(hotelProfiles)
        .where(eq(hotelProfiles.tenantId, this.testTenantId))
        .limit(1);

      if (!storedProfile || storedProfile.length === 0) {
        throw new Error("Failed to retrieve stored hotel profile");
      }

      if (storedProfile[0].vapiAssistantId !== assistantId) {
        throw new Error(
          "Stored assistant ID does not match created assistant ID",
        );
      }

      this.log("✅ Data retrieval verified", "success");
      this.results.coverage.database.retrieval = true;

      this.log("🎉 Complete hotel research flow test passed!", "success");
    } catch (error) {
      this.log(
        `❌ Complete flow test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testGooglePlacesApiIntegration(): Promise<void> {
    this.log("🌍 Testing Google Places API integration...", "info");

    if (this.config.skipApiCalls) {
      this.log(
        "⏭️ Skipping Google Places API test (API calls disabled)",
        "info",
      );
      return;
    }

    try {
      // Test API health check
      const health = await this.hotelResearchService.getServiceHealth();

      if (!health.apis.googlePlaces) {
        throw new Error("Google Places API is not available");
      }

      this.log("✅ Google Places API health check passed", "success");
      this.results.coverage.hotelResearch.googlePlacesApi = true;

      // Test actual API call with a well-known hotel
      const testHotel = await this.hotelResearchService.basicResearch(
        "Hilton",
        "New York",
      );

      if (!testHotel || !testHotel.name || !testHotel.location) {
        throw new Error("Google Places API returned invalid data");
      }

      this.log(
        `✅ Google Places API integration test passed: ${testHotel.name}`,
        "success",
      );
    } catch (error) {
      this.log(
        `❌ Google Places API integration test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testKnowledgeBaseGeneration(): Promise<void> {
    this.log("📚 Testing knowledge base generation...", "info");

    try {
      // Test with minimal hotel data
      const minimalHotelData = {
        name: "Minimal Test Hotel",
        address: "123 Test St",
        services: [],
        amenities: [],
        policies: {
          checkIn: "3:00 PM",
          checkOut: "11:00 AM",
          cancellation: "24 hours",
        },
        roomTypes: [],
        localAttractions: [],
      };

      const knowledgeBase =
        this.knowledgeBaseGenerator.generateKnowledgeBase(minimalHotelData);

      if (!knowledgeBase || knowledgeBase.length < 50) {
        throw new Error("Knowledge base generation failed with minimal data");
      }

      this.log(
        "✅ Knowledge base generation with minimal data passed",
        "success",
      );

      // Test with full hotel data
      const fullKnowledgeBase =
        this.knowledgeBaseGenerator.generateKnowledgeBase(MOCK_HOTEL_DATA);

      if (!fullKnowledgeBase || fullKnowledgeBase.length < 500) {
        throw new Error("Knowledge base generation failed with full data");
      }

      // Verify knowledge base contains key information
      const requiredSections = [
        "HOTEL INFORMATION",
        "SERVICES",
        "AMENITIES",
        "POLICIES",
      ];
      for (const section of requiredSections as any[]) {
        if (!fullKnowledgeBase.includes(section)) {
          throw new Error(
            `Knowledge base missing required section: ${section}`,
          );
        }
      }

      this.log("✅ Knowledge base generation with full data passed", "success");
      this.results.coverage.knowledgeBase.validation = true;
    } catch (error) {
      this.log(
        `❌ Knowledge base generation test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testVapiAssistantCreation(): Promise<void> {
    this.log("🤖 Testing Vapi assistant creation...", "info");

    if (this.config.skipApiCalls) {
      this.log("⏭️ Skipping Vapi assistant test (API calls disabled)", "info");
      return;
    }

    try {
      // Test assistant creation with different configurations
      const testConfigs = [
        {
          personality: "professional",
          tone: "formal",
          languages: ["English"],
          voiceId: "jennifer",
        },
        {
          personality: "friendly",
          tone: "warm",
          languages: ["English", "Spanish"],
          voiceId: "michael",
        },
      ];

      for (const config of testConfigs as any[]) {
        this.log(
          `🔧 Testing assistant with config: ${JSON.stringify(config)}`,
          "info",
        );

        const assistantId =
          await this.assistantGeneratorService.generateAssistant(
            MOCK_HOTEL_DATA,
            config,
          );

        if (!assistantId) {
          throw new Error("Assistant creation failed");
        }

        this.log(
          `✅ Assistant created successfully: ${assistantId}`,
          "success",
        );

        // Test assistant update
        const updatedConfig = { ...config, tone: "energetic" };
        await this.assistantGeneratorService.updateAssistant(
          assistantId,
          MOCK_HOTEL_DATA,
          updatedConfig,
        );

        this.log(
          `✅ Assistant updated successfully: ${assistantId}`,
          "success",
        );
        this.results.coverage.vapiIntegration.assistantUpdate = true;

        // Clean up test assistant
        await this.vapiIntegrationService.deleteAssistant(assistantId);
        this.log(`🗑️ Test assistant cleaned up: ${assistantId}`, "info");
      }
    } catch (error) {
      this.log(
        `❌ Vapi assistant creation test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testDatabaseStorage(): Promise<void> {
    this.log("💾 Testing database storage...", "info");

    try {
      // Test hotel profile storage
      const profileId = `test-profile-${Date.now()}`;
      const profileData = {
        id: profileId,
        tenantId: this.testTenantId,
        researchData: MOCK_HOTEL_DATA,
        knowledgeBase: MOCK_KNOWLEDGE_BASE,
        systemPrompt: "Test system prompt",
        vapiAssistantId: "test-assistant-123",
        assistantConfig: {
          personality: "professional",
          tone: "friendly",
        },
      };

      await this.db.insert(hotelProfiles).values(profileData);
      this.log("✅ Hotel profile stored successfully", "success");

      // Test data retrieval
      const retrievedProfile = await this.db
        .select()
        .from(hotelProfiles)
        .where(eq(hotelProfiles.id, profileId))
        .limit(1);

      if (!retrievedProfile || retrievedProfile.length === 0) {
        throw new Error("Failed to retrieve stored hotel profile");
      }

      // Verify data integrity
      if (retrievedProfile[0].vapiAssistantId !== "test-assistant-123") {
        throw new Error("Data integrity check failed");
      }

      this.log("✅ Data retrieval and integrity check passed", "success");

      // Test data update
      await this.db
        .update(hotelProfiles)
        .set({
          systemPrompt: "Updated system prompt",
          updatedAt: new Date(),
        })
        .where(eq(hotelProfiles.id, profileId));

      const updatedProfile = await this.db
        .select()
        .from(hotelProfiles)
        .where(eq(hotelProfiles.id, profileId))
        .limit(1);

      if (updatedProfile[0].systemPrompt !== "Updated system prompt") {
        throw new Error("Data update failed");
      }

      this.log("✅ Data update test passed", "success");
    } catch (error) {
      this.log(
        `❌ Database storage test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testWithMockData(): Promise<void> {
    this.log("🎭 Testing with mock data...", "info");

    try {
      // Test complete flow with mock data
      const originalUseMockData = this.config.useMockData;
      const originalSkipApiCalls = this.config.skipApiCalls;

      this.config.useMockData = true;
      this.config.skipApiCalls = true;

      // Run knowledge base generation with mock data
      const knowledgeBase =
        this.knowledgeBaseGenerator.generateKnowledgeBase(MOCK_HOTEL_DATA);

      if (!knowledgeBase || !knowledgeBase.includes("Grand Test Hotel")) {
        throw new Error("Mock data knowledge base generation failed");
      }

      this.log("✅ Mock data knowledge base generation passed", "success");

      // Test system prompt generation with mock data
      const systemPrompt = this.knowledgeBaseGenerator.generateSystemPrompt(
        MOCK_HOTEL_DATA,
        {
          personality: "professional",
          tone: "friendly",
          languages: ["English"],
        },
      );

      if (!systemPrompt || !systemPrompt.includes("Grand Test Hotel")) {
        throw new Error("Mock data system prompt generation failed");
      }

      this.log("✅ Mock data system prompt generation passed", "success");

      // Restore original config
      this.config.useMockData = originalUseMockData;
      this.config.skipApiCalls = originalSkipApiCalls;
    } catch (error) {
      this.log(
        `❌ Mock data test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testErrorScenarios(): Promise<void> {
    this.log("🚨 Testing error scenarios...", "info");

    try {
      // Test 1: Invalid hotel name
      try {
        await this.hotelResearchService.basicResearch("", "");
        throw new Error("Should have failed with empty hotel name");
      } catch (error) {
        if (
          (error as any)?.message ||
          String(error) === "Should have failed with empty hotel name"
        ) {
          throw error;
        }
        this.log("✅ Empty hotel name error handling passed", "success");
      }

      // Test 2: Invalid API key (if not skipping API calls)
      if (!this.config.skipApiCalls) {
        const originalApiKey = process.env.GOOGLE_PLACES_API_KEY;
        process.env.GOOGLE_PLACES_API_KEY = "invalid-key";

        try {
          await this.hotelResearchService.basicResearch(
            "Test Hotel",
            "Test City",
          );
          throw new Error("Should have failed with invalid API key");
        } catch (error) {
          if (
            (error as any)?.message ||
            String(error) === "Should have failed with invalid API key"
          ) {
            throw error;
          }
          this.log("✅ Invalid API key error handling passed", "success");
        } finally {
          process.env.GOOGLE_PLACES_API_KEY = originalApiKey;
        }
      }

      // Test 3: Invalid hotel data for knowledge base
      try {
        this.knowledgeBaseGenerator.generateKnowledgeBase(null);
        throw new Error("Should have failed with null hotel data");
      } catch (error) {
        if (
          (error as any)?.message ||
          String(error) === "Should have failed with null hotel data"
        ) {
          throw error;
        }
        this.log("✅ Null hotel data error handling passed", "success");
      }

      // Test 4: Database connection failure
      try {
        const invalidDb = drizzleSqlite(new Database(":memory:"));
        await invalidDb.select().from(hotelProfiles).limit(1);
        throw new Error("Should have failed with invalid database schema");
      } catch (error) {
        if (
          (error as any)?.message ||
          String(error) === "Should have failed with invalid database schema"
        ) {
          throw error;
        }
        this.log("✅ Database error handling passed", "success");
      }

      this.results.coverage.hotelResearch.errorHandling = true;
      this.results.coverage.vapiIntegration.errorHandling = true;
    } catch (error) {
      this.log(
        `❌ Error scenarios test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testApiRateLimiting(): Promise<void> {
    this.log("🚦 Testing API rate limiting...", "info");

    if (this.config.skipApiCalls) {
      this.log(
        "⏭️ Skipping API rate limiting test (API calls disabled)",
        "info",
      );
      return;
    }

    try {
      // Test rate limiting by making multiple rapid requests
      const requests = [];
      for (let i = 0; i < 5; i++) {
        requests.push(
          this.hotelResearchService.basicResearch(
            `Test Hotel ${i}`,
            "Test City",
          ),
        );
      }

      const results = await Promise.allSettled(requests);

      // Check if any requests were rate limited
      const rateLimited = results.some(
        (result) =>
          result.status === "rejected" &&
          result.reason.message.includes("rate limit"),
      );

      if (rateLimited) {
        this.log("✅ API rate limiting is working correctly", "success");
      } else {
        this.log(
          "ℹ️ API rate limiting not triggered (low request volume)",
          "info",
        );
      }
    } catch (error) {
      this.log(
        `❌ API rate limiting test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private async testTenantIsolation(): Promise<void> {
    this.log("🔒 Testing tenant isolation...", "info");

    try {
      // Create a second test tenant
      const secondTenantId = `test-tenant-2-${Date.now()}`;
      await this.db.insert(tenants).values({
        id: secondTenantId,
        hotelName: "Second Test Hotel",
        subdomain: "second-test-hotel",
        subscriptionPlan: "basic",
        subscriptionStatus: "active",
      });

      // Create hotel profiles for both tenants
      const profile1Id = `profile-1-${Date.now()}`;
      const profile2Id = `profile-2-${Date.now()}`;

      await this.db.insert(hotelProfiles).values({
        id: profile1Id,
        tenantId: this.testTenantId,
        researchData: MOCK_HOTEL_DATA,
        vapiAssistantId: "assistant-1",
      });

      await this.db.insert(hotelProfiles).values({
        id: profile2Id,
        tenantId: secondTenantId,
        researchData: { ...MOCK_HOTEL_DATA, name: "Second Test Hotel" },
        vapiAssistantId: "assistant-2",
      });

      // Test tenant isolation - tenant 1 should only see their data
      const tenant1Data = await this.db
        .select()
        .from(hotelProfiles)
        .where(eq(hotelProfiles.tenantId, this.testTenantId));

      if (
        tenant1Data.length !== 1 ||
        tenant1Data[0].vapiAssistantId !== "assistant-1"
      ) {
        throw new Error("Tenant 1 isolation failed");
      }

      // Test tenant isolation - tenant 2 should only see their data
      const tenant2Data = await this.db
        .select()
        .from(hotelProfiles)
        .where(eq(hotelProfiles.tenantId, secondTenantId));

      if (
        tenant2Data.length !== 1 ||
        tenant2Data[0].vapiAssistantId !== "assistant-2"
      ) {
        throw new Error("Tenant 2 isolation failed");
      }

      this.log("✅ Tenant isolation test passed", "success");
      this.results.coverage.database.tenantIsolation = true;
    } catch (error) {
      this.log(
        `❌ Tenant isolation test failed: ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private async executeTest(
    id: string,
    name: string,
    testFunction: () => Promise<void>,
  ): Promise<void> {
    const step: TestStep = {
      id,
      name,
      status: "running",
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
    };

    this.results.steps.push(step);
    this.results.testsRun++;

    try {
      this.log(`🧪 Running test: ${name}`, "info");
      await testFunction();

      step.status = "passed";
      step.endTime = performance.now();
      step.duration = step.endTime - step.startTime;
      this.results.testsPassed++;

      this.log(
        `✅ Test passed: ${name} (${step.duration.toFixed(2)}ms)`,
        "success",
      );
    } catch (error) {
      step.status = "failed";
      step.endTime = performance.now();
      step.duration = step.endTime - step.startTime;
      step.error = (error as any)?.message || String(error);
      this.results.testsFailed++;

      this.results.errors.push({
        step: id,
        message: (error as any)?.message || String(error),
        stack: (error as any)?.stack,
      });

      this.log(
        `❌ Test failed: ${name} - ${(error as any)?.message || String(error)}`,
        "error",
      );
      throw error;
    }
  }

  private log(
    message: string,
    level: "info" | "success" | "error" | "warn" = "info",
  ): void {
    if (!this.config.verbose) return;

    const timestamp = new Date().toISOString();
    const prefix = {
      info: "📋",
      success: "✅",
      error: "❌",
      warn: "⚠️",
    }[level];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  // ============================================
  // Report Generation
  // ============================================

  generateReport(): string {
    const duration = this.results.duration.toFixed(2);
    const successRate = (
      (this.results.testsPassed / this.results.testsRun) *
      100
    ).toFixed(1);

    return `
# Hotel Research Flow Test Report

## Summary
- **Status**: ${this.results.success ? "✅ SUCCESS" : "❌ FAILED"}
- **Duration**: ${duration}ms
- **Tests Run**: ${this.results.testsRun}
- **Tests Passed**: ${this.results.testsPassed}
- **Tests Failed**: ${this.results.testsFailed}
- **Success Rate**: ${successRate}%

## Test Coverage

### Hotel Research
- Basic Research: ${this.results.coverage.hotelResearch.basicResearch ? "✅" : "❌"}
- Advanced Research: ${this.results.coverage.hotelResearch.advancedResearch ? "✅" : "❌"}
- Google Places API: ${this.results.coverage.hotelResearch.googlePlacesApi ? "✅" : "❌"}
- Website Scraping: ${this.results.coverage.hotelResearch.websiteScraping ? "✅" : "❌"}
- Error Handling: ${this.results.coverage.hotelResearch.errorHandling ? "✅" : "❌"}

### Knowledge Base
- Generation: ${this.results.coverage.knowledgeBase.generation ? "✅" : "❌"}
- System Prompt: ${this.results.coverage.knowledgeBase.systemPrompt ? "✅" : "❌"}
- Validation: ${this.results.coverage.knowledgeBase.validation ? "✅" : "❌"}

### Vapi Integration
- Assistant Creation: ${this.results.coverage.vapiIntegration.assistantCreation ? "✅" : "❌"}
- Assistant Update: ${this.results.coverage.vapiIntegration.assistantUpdate ? "✅" : "❌"}
- Error Handling: ${this.results.coverage.vapiIntegration.errorHandling ? "✅" : "❌"}

### Database
- Storage: ${this.results.coverage.database.storage ? "✅" : "❌"}
- Retrieval: ${this.results.coverage.database.retrieval ? "✅" : "❌"}
- Tenant Isolation: ${this.results.coverage.database.tenantIsolation ? "✅" : "❌"}

## Test Steps

${this.results.steps
  .map(
    (step) => `
### ${step.name}
- **Status**: ${step.status === "passed" ? "✅ PASSED" : "❌ FAILED"}
- **Duration**: ${step.duration.toFixed(2)}ms
${step.error ? `- **Error**: ${step.error}` : ""}
`,
  )
  .join("")}

## Errors

${
  this.results.errors.length > 0
    ? this.results.errors
        .map(
          (error) => `
### ${error.step}
- **Message**: ${(error as any)?.message || String(error)}
${(error as any)?.stack ? `- **Stack**: \`\`\`\n${(error as any)?.stack}\n\`\`\`` : ""}
`,
        )
        .join("")
    : "No errors occurred."
}

## Recommendations

${
  this.results.success
    ? "✅ All tests passed! The hotel research flow is working correctly."
    : "❌ Some tests failed. Please review the errors above and fix the issues before proceeding."
}

---
Generated on: ${new Date().toISOString()}
Test Configuration: ${JSON.stringify(this.config, null, 2)}
`;
  }
}

// ============================================
// Export for external use
// ============================================

export default HotelResearchFlowTest;
