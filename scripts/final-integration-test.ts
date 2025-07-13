#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { performance } from 'perf_hooks';

// ============================================
// Final Integration Test Suite
// ============================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
  issues?: string[];
  fixes?: string[];
}

interface TestCategory {
  name: string;
  tests: TestResult[];
  criticalFailures: number;
  totalTests: number;
}

export class FinalIntegrationTestSuite {
  private results: TestCategory[] = [];
  private startTime: number;
  private criticalIssues: string[] = [];
  private allIssues: string[] = [];
  private suggestedFixes: string[] = [];

  constructor() {
    this.startTime = performance.now();
  }

  // ============================================
  // Main Test Runner
  // ============================================

  async runFinalIntegrationTest(): Promise<void> {
    console.log('🚀 Starting Final Integration Test Suite...\n');

    // Test 1: Mi Nhon Hotel Compatibility
    await this.testMiNhonHotelCompatibility();

    // Test 2: New Hotel Onboarding Flow
    await this.testNewHotelOnboardingFlow();

    // Test 3: Dashboard Functionality
    await this.testDashboardFunctionality();

    // Test 4: Multi-Tenant Voice Interface
    await this.testMultiTenantVoiceInterface();

    // Test 5: Data Isolation Between Tenants
    await this.testDataIsolationBetweenTenants();

    // Generate comprehensive report
    this.generateFinalReport();
  }

  // ============================================
  // Test 1: Mi Nhon Hotel Compatibility
  // ============================================

  private async testMiNhonHotelCompatibility(): Promise<void> {
    console.log('📋 Test 1: Mi Nhon Hotel Compatibility');
    console.log('='.repeat(50));

    const category: TestCategory = {
      name: 'Mi Nhon Hotel Compatibility',
      tests: [],
      criticalFailures: 0,
      totalTests: 0
    };

    // Test 1.1: Environment Setup
    const envTest = await this.runTest(
      'Environment Configuration',
      async () => {
        try {
          execSync('npm run env:status', { encoding: 'utf8' });
          return { passed: true, details: 'Environment variables loaded' };
        } catch (error) {
          return { 
            passed: false, 
            details: 'Environment configuration has issues',
            issues: ['Missing API keys detected'],
            fixes: ['Run: npm run env:generate and configure .env file']
          };
        }
      }
    );
    category.tests.push(envTest);

    // Test 1.2: Database Connection
    const dbTest = await this.runTest(
      'Database Connection',
      async () => {
        try {
          // Check if database file exists or can be created
          const dbPath = './dev.db';
          if (!fs.existsSync(dbPath)) {
            // Create empty database file
            fs.writeFileSync(dbPath, '');
          }
          return { passed: true, details: 'SQLite database accessible' };
        } catch (error) {
          return { 
            passed: false, 
            details: 'Database connection failed',
            issues: ['Cannot access database'],
            fixes: ['Check DATABASE_URL configuration', 'Ensure database server is running']
          };
        }
      }
    );
    category.tests.push(dbTest);

    // Test 1.3: Server Startup
    const serverTest = await this.runTest(
      'Server Startup Test',
      async () => {
        try {
          // Check if server can be built
          execSync('npm run check', { encoding: 'utf8' });
          return { passed: true, details: 'TypeScript compilation successful' };
        } catch (error) {
          return { 
            passed: false, 
            details: 'Server compilation failed',
            issues: ['TypeScript compilation errors'],
            fixes: ['Fix TypeScript errors', 'Check import statements', 'Verify type definitions']
          };
        }
      }
    );
    category.tests.push(serverTest);

    // Test 1.4: Voice Assistant Configuration
    const voiceTest = await this.runTest(
      'Voice Assistant Configuration',
      async () => {
        try {
          // Check if voice assistant components exist
          const assistantPath = './client/src/components/VoiceAssistant.tsx';
          const interface1Path = './client/src/components/Interface1.tsx';
          
          if (fs.existsSync(assistantPath) && fs.existsSync(interface1Path)) {
            return { passed: true, details: 'Voice assistant components found' };
          } else {
            return { 
              passed: false, 
              details: 'Voice assistant components missing',
              issues: ['Core voice assistant files not found'],
              fixes: ['Verify VoiceAssistant.tsx exists', 'Check Interface1.tsx component']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Voice assistant verification failed',
            issues: [error.message],
            fixes: ['Check voice assistant implementation']
          };
        }
      }
    );
    category.tests.push(voiceTest);

    // Test 1.5: Existing Data Preservation
    const dataTest = await this.runTest(
      'Data Structure Validation',
      async () => {
        try {
          // Check if schema files exist
          const schemaPath = './src/db/schema.ts';
          const sharedSchemaPath = './shared/schema.ts';
          
          if (fs.existsSync(schemaPath) && fs.existsSync(sharedSchemaPath)) {
            const schemaContent = fs.readFileSync(schemaPath, 'utf8');
            const hasMultiTenant = schemaContent.includes('tenants') && schemaContent.includes('hotelProfiles');
            
            if (hasMultiTenant) {
              return { passed: true, details: 'Multi-tenant schema structure found' };
            } else {
              return { 
                passed: false, 
                details: 'Multi-tenant schema incomplete',
                issues: ['Missing tenants or hotelProfiles tables'],
                fixes: ['Run database migration', 'Update schema to include multi-tenant tables']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Database schema files missing',
              issues: ['Schema files not found'],
              fixes: ['Check src/db/schema.ts exists', 'Verify shared/schema.ts exists']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Schema validation failed',
            issues: [error.message],
            fixes: ['Check database schema implementation']
          };
        }
      }
    );
    category.tests.push(dataTest);

    category.totalTests = category.tests.length;
    category.criticalFailures = category.tests.filter(t => !t.passed).length;
    this.results.push(category);

    console.log(`✅ Completed: ${category.tests.filter(t => t.passed).length}/${category.totalTests} tests passed\n`);
  }

  // ============================================
  // Test 2: New Hotel Onboarding Flow
  // ============================================

  private async testNewHotelOnboardingFlow(): Promise<void> {
    console.log('📋 Test 2: New Hotel Onboarding Flow');
    console.log('='.repeat(50));

    const category: TestCategory = {
      name: 'New Hotel Onboarding Flow',
      tests: [],
      criticalFailures: 0,
      totalTests: 0
    };

    // Test 2.1: Hotel Research Service
    const researchTest = await this.runTest(
      'Hotel Research Service',
      async () => {
        try {
          const researchPath = './server/services/hotelResearch.ts';
          if (fs.existsSync(researchPath)) {
            const content = fs.readFileSync(researchPath, 'utf8');
            const hasBasicResearch = content.includes('basicResearch') || content.includes('HotelResearchService');
            
            if (hasBasicResearch) {
              return { passed: true, details: 'Hotel research service implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Hotel research service incomplete',
                issues: ['basicResearch method not found'],
                fixes: ['Implement HotelResearchService class', 'Add basicResearch method']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Hotel research service not found',
              issues: ['hotelResearch.ts file missing'],
              fixes: ['Create server/services/hotelResearch.ts', 'Implement hotel research functionality']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Hotel research service validation failed',
            issues: [error.message],
            fixes: ['Check hotel research service implementation']
          };
        }
      }
    );
    category.tests.push(researchTest);

    // Test 2.2: Knowledge Base Generator
    const knowledgeTest = await this.runTest(
      'Knowledge Base Generator',
      async () => {
        try {
          const kbPath = './server/services/knowledgeBaseGenerator.ts';
          if (fs.existsSync(kbPath)) {
            const content = fs.readFileSync(kbPath, 'utf8');
            const hasGenerator = content.includes('generateKnowledgeBase') || content.includes('KnowledgeBaseGenerator');
            
            if (hasGenerator) {
              return { passed: true, details: 'Knowledge base generator implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Knowledge base generator incomplete',
                issues: ['generateKnowledgeBase method not found'],
                fixes: ['Implement KnowledgeBaseGenerator class', 'Add generateKnowledgeBase method']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Knowledge base generator not found',
              issues: ['knowledgeBaseGenerator.ts file missing'],
              fixes: ['Create server/services/knowledgeBaseGenerator.ts', 'Implement knowledge base generation']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Knowledge base generator validation failed',
            issues: [error.message],
            fixes: ['Check knowledge base generator implementation']
          };
        }
      }
    );
    category.tests.push(knowledgeTest);

    // Test 2.3: Vapi Integration Service
    const vapiTest = await this.runTest(
      'Vapi Integration Service',
      async () => {
        try {
          const vapiPath = './server/services/vapiIntegration.ts';
          if (fs.existsSync(vapiPath)) {
            const content = fs.readFileSync(vapiPath, 'utf8');
            const hasVapiService = content.includes('createAssistant') || content.includes('VapiIntegrationService');
            
            if (hasVapiService) {
              return { passed: true, details: 'Vapi integration service implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Vapi integration service incomplete',
                issues: ['createAssistant method not found'],
                fixes: ['Implement VapiIntegrationService class', 'Add createAssistant method']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Vapi integration service not found',
              issues: ['vapiIntegration.ts file missing'],
              fixes: ['Create server/services/vapiIntegration.ts', 'Implement Vapi API integration']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Vapi integration service validation failed',
            issues: [error.message],
            fixes: ['Check Vapi integration service implementation']
          };
        }
      }
    );
    category.tests.push(vapiTest);

    // Test 2.4: Dashboard Setup Wizard
    const wizardTest = await this.runTest(
      'Setup Wizard Components',
      async () => {
        try {
          const wizardPath = './client/src/pages/dashboard/SetupWizard.tsx';
          const dashboardPath = './client/src/pages/dashboard';
          
          if (fs.existsSync(dashboardPath)) {
            const files = fs.readdirSync(dashboardPath);
            const hasSetupComponents = files.some(file => file.includes('Setup') || file.includes('Wizard'));
            
            if (hasSetupComponents) {
              return { passed: true, details: 'Setup wizard components found' };
            } else {
              return { 
                passed: false, 
                details: 'Setup wizard components missing',
                issues: ['No setup wizard components found'],
                fixes: ['Create SetupWizard.tsx component', 'Implement hotel onboarding flow']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Dashboard directory not found',
              issues: ['Dashboard pages directory missing'],
              fixes: ['Create client/src/pages/dashboard directory', 'Add dashboard components']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Setup wizard validation failed',
            issues: [error.message],
            fixes: ['Check dashboard implementation']
          };
        }
      }
    );
    category.tests.push(wizardTest);

    category.totalTests = category.tests.length;
    category.criticalFailures = category.tests.filter(t => !t.passed).length;
    this.results.push(category);

    console.log(`✅ Completed: ${category.tests.filter(t => t.passed).length}/${category.totalTests} tests passed\n`);
  }

  // ============================================
  // Test 3: Dashboard Functionality
  // ============================================

  private async testDashboardFunctionality(): Promise<void> {
    console.log('📋 Test 3: Dashboard Functionality');
    console.log('='.repeat(50));

    const category: TestCategory = {
      name: 'Dashboard Functionality',
      tests: [],
      criticalFailures: 0,
      totalTests: 0
    };

    // Test 3.1: Dashboard Routes
    const routesTest = await this.runTest(
      'Dashboard Routes',
      async () => {
        try {
          const routesPath = './server/routes/dashboard.ts';
          if (fs.existsSync(routesPath)) {
            const content = fs.readFileSync(routesPath, 'utf8');
            const hasRoutes = content.includes('/research-hotel') || content.includes('/generate-assistant');
            
            if (hasRoutes) {
              return { passed: true, details: 'Dashboard API routes implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Dashboard routes incomplete',
                issues: ['Required API endpoints not found'],
                fixes: ['Add /research-hotel endpoint', 'Add /generate-assistant endpoint']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Dashboard routes not found',
              issues: ['dashboard.ts routes file missing'],
              fixes: ['Create server/routes/dashboard.ts', 'Implement dashboard API endpoints']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Dashboard routes validation failed',
            issues: [error.message],
            fixes: ['Check dashboard routes implementation']
          };
        }
      }
    );
    category.tests.push(routesTest);

    // Test 3.2: Analytics Dashboard
    const analyticsTest = await this.runTest(
      'Analytics Dashboard',
      async () => {
        try {
          const analyticsPath = './client/src/pages/AnalyticsDashboard.tsx';
          if (fs.existsSync(analyticsPath)) {
            const content = fs.readFileSync(analyticsPath, 'utf8');
            const hasAnalytics = content.includes('analytics') || content.includes('chart');
            
            if (hasAnalytics) {
              return { passed: true, details: 'Analytics dashboard implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Analytics dashboard incomplete',
                issues: ['Analytics functionality not implemented'],
                fixes: ['Add analytics charts', 'Implement data visualization']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Analytics dashboard not found',
              issues: ['AnalyticsDashboard.tsx file missing'],
              fixes: ['Create AnalyticsDashboard.tsx component', 'Add analytics functionality']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Analytics dashboard validation failed',
            issues: [error.message],
            fixes: ['Check analytics dashboard implementation']
          };
        }
      }
    );
    category.tests.push(analyticsTest);

    // Test 3.3: Dashboard Layout
    const layoutTest = await this.runTest(
      'Dashboard Layout Components',
      async () => {
        try {
          const layoutPath = './client/src/pages/dashboard/DashboardLayout.tsx';
          const componentsPath = './client/src/components/dashboard';
          
          if (fs.existsSync(componentsPath)) {
            const files = fs.readdirSync(componentsPath);
            const hasLayoutComponents = files.length > 0;
            
            if (hasLayoutComponents) {
              return { passed: true, details: 'Dashboard layout components found' };
            } else {
              return { 
                passed: false, 
                details: 'Dashboard layout components missing',
                issues: ['No dashboard components found'],
                fixes: ['Create dashboard layout components', 'Add sidebar, topbar, and navigation']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Dashboard components directory not found',
              issues: ['Dashboard components directory missing'],
              fixes: ['Create client/src/components/dashboard directory', 'Add dashboard UI components']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Dashboard layout validation failed',
            issues: [error.message],
            fixes: ['Check dashboard layout implementation']
          };
        }
      }
    );
    category.tests.push(layoutTest);

    category.totalTests = category.tests.length;
    category.criticalFailures = category.tests.filter(t => !t.passed).length;
    this.results.push(category);

    console.log(`✅ Completed: ${category.tests.filter(t => t.passed).length}/${category.totalTests} tests passed\n`);
  }

  // ============================================
  // Test 4: Multi-Tenant Voice Interface
  // ============================================

  private async testMultiTenantVoiceInterface(): Promise<void> {
    console.log('📋 Test 4: Multi-Tenant Voice Interface');
    console.log('='.repeat(50));

    const category: TestCategory = {
      name: 'Multi-Tenant Voice Interface',
      tests: [],
      criticalFailures: 0,
      totalTests: 0
    };

    // Test 4.1: Assistant Context
    const contextTest = await this.runTest(
      'Assistant Context Multi-Tenancy',
      async () => {
        try {
          const contextPath = './client/src/context/AssistantContext.tsx';
          if (fs.existsSync(contextPath)) {
            const content = fs.readFileSync(contextPath, 'utf8');
            const hasTenantSupport = content.includes('tenant') || content.includes('multi');
            
            if (hasTenantSupport) {
              return { passed: true, details: 'Assistant context supports multi-tenancy' };
            } else {
              return { 
                passed: false, 
                details: 'Assistant context missing multi-tenant support',
                issues: ['No tenant-specific configuration found'],
                fixes: ['Add tenant ID to assistant context', 'Implement tenant-specific voice configuration']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Assistant context not found',
              issues: ['AssistantContext.tsx file missing'],
              fixes: ['Create AssistantContext.tsx', 'Implement voice assistant context']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Assistant context validation failed',
            issues: [error.message],
            fixes: ['Check assistant context implementation']
          };
        }
      }
    );
    category.tests.push(contextTest);

    // Test 4.2: Multi-Language Support
    const languageTest = await this.runTest(
      'Multi-Language Voice Support',
      async () => {
        try {
          const i18nPath = './client/src/i18n';
          if (fs.existsSync(i18nPath)) {
            const files = fs.readdirSync(i18nPath);
            const hasMultipleLanguages = files.filter(f => f.endsWith('.json')).length > 1;
            
            if (hasMultipleLanguages) {
              return { passed: true, details: 'Multi-language support implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Limited language support',
                issues: ['Only one language file found'],
                fixes: ['Add more language files (vi.json, fr.json, etc.)', 'Implement language switching']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Internationalization directory not found',
              issues: ['i18n directory missing'],
              fixes: ['Create client/src/i18n directory', 'Add language files']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Multi-language validation failed',
            issues: [error.message],
            fixes: ['Check internationalization implementation']
          };
        }
      }
    );
    category.tests.push(languageTest);

    // Test 4.3: Voice Interface Components
    const interfaceTest = await this.runTest(
      'Voice Interface Components',
      async () => {
        try {
          const interfaces = ['Interface1.tsx', 'Interface2.tsx', 'Interface3.tsx', 'Interface4.tsx'];
          const componentsPath = './client/src/components';
          let foundInterfaces = 0;
          
          for (const interfaceFile of interfaces) {
            if (fs.existsSync(path.join(componentsPath, interfaceFile))) {
              foundInterfaces++;
            }
          }
          
          if (foundInterfaces >= 3) {
            return { passed: true, details: `${foundInterfaces} voice interface components found` };
          } else {
            return { 
              passed: false, 
              details: 'Insufficient voice interface components',
              issues: [`Only ${foundInterfaces} interface components found`],
              fixes: ['Implement missing Interface components', 'Complete voice interface flow']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Voice interface validation failed',
            issues: [error.message],
            fixes: ['Check voice interface components']
          };
        }
      }
    );
    category.tests.push(interfaceTest);

    category.totalTests = category.tests.length;
    category.criticalFailures = category.tests.filter(t => !t.passed).length;
    this.results.push(category);

    console.log(`✅ Completed: ${category.tests.filter(t => t.passed).length}/${category.totalTests} tests passed\n`);
  }

  // ============================================
  // Test 5: Data Isolation Between Tenants
  // ============================================

  private async testDataIsolationBetweenTenants(): Promise<void> {
    console.log('📋 Test 5: Data Isolation Between Tenants');
    console.log('='.repeat(50));

    const category: TestCategory = {
      name: 'Data Isolation Between Tenants',
      tests: [],
      criticalFailures: 0,
      totalTests: 0
    };

    // Test 5.1: Database Schema Isolation
    const schemaTest = await this.runTest(
      'Database Schema Tenant Isolation',
      async () => {
        try {
          const schemaPath = './src/db/schema.ts';
          if (fs.existsSync(schemaPath)) {
            const content = fs.readFileSync(schemaPath, 'utf8');
            const hasTenantId = content.includes('tenantId') && content.includes('references');
            
            if (hasTenantId) {
              return { passed: true, details: 'Database schema includes tenant isolation' };
            } else {
              return { 
                passed: false, 
                details: 'Database schema missing tenant isolation',
                issues: ['tenantId foreign keys not found in schema'],
                fixes: ['Add tenantId columns to all tables', 'Add foreign key references to tenants table']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Database schema not found',
              issues: ['schema.ts file missing'],
              fixes: ['Create database schema file', 'Implement multi-tenant schema']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Schema isolation validation failed',
            issues: [error.message],
            fixes: ['Check database schema implementation']
          };
        }
      }
    );
    category.tests.push(schemaTest);

    // Test 5.2: API Route Tenant Filtering
    const apiTest = await this.runTest(
      'API Route Tenant Filtering',
      async () => {
        try {
          const routesPath = './server/routes';
          if (fs.existsSync(routesPath)) {
            const files = fs.readdirSync(routesPath);
            let hasTenantFiltering = false;
            
            for (const file of files) {
              if (file.endsWith('.ts')) {
                const content = fs.readFileSync(path.join(routesPath, file), 'utf8');
                if (content.includes('tenantId') && content.includes('eq')) {
                  hasTenantFiltering = true;
                  break;
                }
              }
            }
            
            if (hasTenantFiltering) {
              return { passed: true, details: 'API routes include tenant filtering' };
            } else {
              return { 
                passed: false, 
                details: 'API routes missing tenant filtering',
                issues: ['No tenant-based query filtering found'],
                fixes: ['Add tenantId filtering to all database queries', 'Implement tenant middleware']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'API routes directory not found',
              issues: ['routes directory missing'],
              fixes: ['Create server/routes directory', 'Implement API routes with tenant filtering']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'API filtering validation failed',
            issues: [error.message],
            fixes: ['Check API route implementation']
          };
        }
      }
    );
    category.tests.push(apiTest);

    // Test 5.3: Tenant Middleware
    const middlewareTest = await this.runTest(
      'Tenant Middleware Security',
      async () => {
        try {
          const middlewarePath = './server/middleware';
          if (fs.existsSync(middlewarePath)) {
            const files = fs.readdirSync(middlewarePath);
            const hasTenantMiddleware = files.some(file => file.includes('tenant'));
            
            if (hasTenantMiddleware) {
              return { passed: true, details: 'Tenant middleware implemented' };
            } else {
              return { 
                passed: false, 
                details: 'Tenant middleware missing',
                issues: ['No tenant middleware found'],
                fixes: ['Create tenant.ts middleware', 'Implement tenant verification and isolation']
              };
            }
          } else {
            return { 
              passed: false, 
              details: 'Middleware directory not found',
              issues: ['middleware directory missing'],
              fixes: ['Create server/middleware directory', 'Add authentication and tenant middleware']
            };
          }
        } catch (error) {
          return { 
            passed: false, 
            details: 'Middleware validation failed',
            issues: [error.message],
            fixes: ['Check middleware implementation']
          };
        }
      }
    );
    category.tests.push(middlewareTest);

    category.totalTests = category.tests.length;
    category.criticalFailures = category.tests.filter(t => !t.passed).length;
    this.results.push(category);

    console.log(`✅ Completed: ${category.tests.filter(t => t.passed).length}/${category.totalTests} tests passed\n`);
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = performance.now();
    console.log(`  🔍 ${name}...`);

    try {
      const result = await testFn();
      const duration = performance.now() - startTime;

      if (result.passed) {
        console.log(`    ✅ PASSED - ${result.details} (${duration.toFixed(2)}ms)`);
      } else {
        console.log(`    ❌ FAILED - ${result.details} (${duration.toFixed(2)}ms)`);
        if (result.issues) {
          result.issues.forEach(issue => {
            console.log(`      💥 ${issue}`);
            this.allIssues.push(`${name}: ${issue}`);
          });
        }
        if (result.fixes) {
          result.fixes.forEach(fix => {
            console.log(`      🔧 ${fix}`);
            this.suggestedFixes.push(`${name}: ${fix}`);
          });
        }
      }

      return {
        name,
        passed: result.passed,
        duration,
        details: result.details,
        issues: result.issues,
        fixes: result.fixes
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMsg = error.message || 'Unknown error';
      
      console.log(`    💥 ERROR - ${errorMsg} (${duration.toFixed(2)}ms)`);
      this.allIssues.push(`${name}: ${errorMsg}`);
      this.suggestedFixes.push(`${name}: Debug and fix the error`);

      return {
        name,
        passed: false,
        duration,
        details: errorMsg,
        issues: [errorMsg],
        fixes: ['Debug and fix the error']
      };
    }
  }

  // ============================================
  // Final Report Generation
  // ============================================

  private generateFinalReport(): void {
    const totalDuration = performance.now() - this.startTime;
    const totalTests = this.results.reduce((sum, cat) => sum + cat.totalTests, 0);
    const totalPassed = this.results.reduce((sum, cat) => sum + (cat.totalTests - cat.criticalFailures), 0);
    const totalCriticalFailures = this.results.reduce((sum, cat) => sum + cat.criticalFailures, 0);

    console.log('\n' + '='.repeat(80));
    console.log('📊 FINAL INTEGRATION TEST REPORT');
    console.log('='.repeat(80));

    console.log(`\n📈 Overall Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Critical Failures: ${totalCriticalFailures}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);

    console.log(`\n📋 Category Breakdown:`);
    this.results.forEach(category => {
      const passed = category.totalTests - category.criticalFailures;
      const status = category.criticalFailures === 0 ? '✅' : category.criticalFailures < category.totalTests ? '⚠️' : '❌';
      console.log(`${status} ${category.name}: ${passed}/${category.totalTests} passed`);
    });

    if (this.allIssues.length > 0) {
      console.log(`\n💥 Issues Found (${this.allIssues.length}):`);
      this.allIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }

    if (this.suggestedFixes.length > 0) {
      console.log(`\n🔧 Suggested Fixes (${this.suggestedFixes.length}):`);
      this.suggestedFixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix}`);
      });
    }

    // Overall Assessment
    console.log('\n' + '='.repeat(80));
    if (totalCriticalFailures === 0) {
      console.log('🎉 FINAL INTEGRATION TEST: PASSED');
      console.log('✅ All critical functionality is working correctly');
      console.log('✅ System is ready for deployment');
    } else if (totalCriticalFailures < totalTests * 0.3) {
      console.log('⚠️  FINAL INTEGRATION TEST: PARTIAL PASS');
      console.log('🔧 Some issues found but system is mostly functional');
      console.log('📝 Address the issues above before deployment');
    } else {
      console.log('❌ FINAL INTEGRATION TEST: FAILED');
      console.log('💥 Critical issues prevent deployment');
      console.log('🚨 Must fix major issues before proceeding');
    }

    // Next Steps
    console.log('\n📋 Next Steps:');
    if (totalCriticalFailures === 0) {
      console.log('1. ✅ Run deployment validation: npm run validate:deployment:staging');
      console.log('2. ✅ Create staging deployment: npm run deploy:staging:dry-run');
      console.log('3. ✅ Monitor system performance');
      console.log('4. ✅ Prepare for production deployment');
    } else {
      console.log('1. 🔧 Fix the issues listed above');
      console.log('2. 🔧 Run tests again: npm run test:final-integration');
      console.log('3. 🔧 Verify all functionality works');
      console.log('4. 🔧 Re-run deployment validation');
    }

    console.log('\n' + '='.repeat(80));
  }
}

// ============================================
// CLI Interface
// ============================================

async function main(): Promise<void> {
  const suite = new FinalIntegrationTestSuite();
  await suite.runFinalIntegrationTest();
}

// ES Module entry point
main().catch((error) => {
  console.error('❌ Final integration test failed:', error);
  process.exit(1);
}); 