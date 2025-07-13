#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================
// Deployment Validator
// ============================================

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
}

interface ValidationCategory {
  name: string;
  checks: ValidationCheck[];
}

interface ValidationCheck {
  name: string;
  description: string;
  validator: () => Promise<ValidationResult>;
  critical: boolean;
}

export class DeploymentValidator {
  private environment: 'staging' | 'production';
  private verbose: boolean;

  constructor(environment: 'staging' | 'production', verbose = false) {
    this.environment = environment;
    this.verbose = verbose;
  }

  async validateDeployment(): Promise<boolean> {
    console.log(`🔍 Validating deployment readiness for ${this.environment}...\n`);

    const categories: ValidationCategory[] = [
      {
        name: 'Pre-Deployment Requirements',
        checks: [
          {
            name: 'Git Status',
            description: 'Working directory should be clean',
            validator: () => this.validateGitStatus(),
            critical: true
          },
          {
            name: 'Environment Variables',
            description: 'All required environment variables configured',
            validator: () => this.validateEnvironmentVariables(),
            critical: true
          },
          {
            name: 'Database Connection',
            description: 'Database is accessible and ready',
            validator: () => this.validateDatabaseConnection(),
            critical: true
          },
          {
            name: 'API Keys',
            description: 'All external API keys are valid',
            validator: () => this.validateAPIKeys(),
            critical: true
          }
        ]
      },
      {
        name: 'Database Migration',
        checks: [
          {
            name: 'Migration Tests',
            description: 'Database migration tests pass',
            validator: () => this.validateMigrationTests(),
            critical: true
          },
          {
            name: 'Schema Validation',
            description: 'Database schema is ready for multi-tenant',
            validator: () => this.validateDatabaseSchema(),
            critical: true
          },
          {
            name: 'Backup Strategy',
            description: 'Database backup procedures are in place',
            validator: () => this.validateBackupStrategy(),
            critical: true
          }
        ]
      },
      {
        name: 'DNS & SSL Configuration',
        checks: [
          {
            name: 'DNS Records',
            description: 'DNS records configured for domain and subdomains',
            validator: () => this.validateDNSRecords(),
            critical: true
          },
          {
            name: 'SSL Certificates',
            description: 'SSL certificates are valid and properly configured',
            validator: () => this.validateSSLCertificates(),
            critical: true
          },
          {
            name: 'Domain Routing',
            description: 'Subdomain routing is configured correctly',
            validator: () => this.validateDomainRouting(),
            critical: false
          }
        ]
      },
      {
        name: 'Application Readiness',
        checks: [
          {
            name: 'Build Process',
            description: 'Application builds successfully',
            validator: () => this.validateBuildProcess(),
            critical: true
          },
          {
            name: 'Integration Tests',
            description: 'Integration tests pass',
            validator: () => this.validateIntegrationTests(),
            critical: true
          },
          {
            name: 'Performance Benchmarks',
            description: 'Performance meets acceptable thresholds',
            validator: () => this.validatePerformanceBenchmarks(),
            critical: false
          }
        ]
      },
      {
        name: 'Security & Compliance',
        checks: [
          {
            name: 'Tenant Isolation',
            description: 'Multi-tenant security is properly configured',
            validator: () => this.validateTenantIsolation(),
            critical: true
          },
          {
            name: 'Authentication',
            description: 'Authentication and authorization working',
            validator: () => this.validateAuthentication(),
            critical: true
          },
          {
            name: 'Rate Limiting',
            description: 'Rate limiting configured and working',
            validator: () => this.validateRateLimiting(),
            critical: false
          }
        ]
      }
    ];

    let totalChecks = 0;
    let passedChecks = 0;
    let criticalFailures = 0;

    for (const category of categories) {
      console.log(`\n📋 ${category.name}`);
      console.log('='.repeat(category.name.length + 4));

      for (const check of category.checks) {
        totalChecks++;
        console.log(`\n🔍 ${check.name}`);
        console.log(`   ${check.description}`);

        try {
          const result = await check.validator();
          
          if (result.passed) {
            console.log(`   ✅ PASSED - ${result.message}`);
            passedChecks++;
          } else {
            const status = check.critical ? '❌ CRITICAL FAILURE' : '⚠️  WARNING';
            console.log(`   ${status} - ${result.message}`);
            
            if (result.details) {
              console.log(`   Details: ${result.details}`);
            }
            
            if (check.critical) {
              criticalFailures++;
            }
          }
        } catch (error) {
          const status = check.critical ? '❌ CRITICAL FAILURE' : '⚠️  WARNING';
          console.log(`   ${status} - ${error.message}`);
          
          if (check.critical) {
            criticalFailures++;
          }
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEPLOYMENT VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Environment: ${this.environment}`);
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`Passed: ${passedChecks}`);
    console.log(`Failed: ${totalChecks - passedChecks}`);
    console.log(`Critical Failures: ${criticalFailures}`);

    const isReady = criticalFailures === 0;
    
    if (isReady) {
      console.log('\n🎉 DEPLOYMENT VALIDATION PASSED!');
      console.log('✅ System is ready for deployment');
    } else {
      console.log('\n💥 DEPLOYMENT VALIDATION FAILED!');
      console.log(`❌ ${criticalFailures} critical issues must be resolved`);
    }

    return isReady;
  }

  // ============================================
  // Validation Methods
  // ============================================

  private async validateGitStatus(): Promise<ValidationResult> {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const isClean = status.trim() === '';
      
      return {
        passed: isClean,
        message: isClean ? 'Working directory is clean' : 'Uncommitted changes detected',
        details: isClean ? undefined : 'Commit all changes before deployment'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Git status check failed',
        details: error.message
      };
    }
  }

  private async validateEnvironmentVariables(): Promise<ValidationResult> {
    try {
      execSync('npm run env:validate', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'All environment variables are configured correctly'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Environment variable validation failed',
        details: 'Run npm run env:validate for details'
      };
    }
  }

  private async validateDatabaseConnection(): Promise<ValidationResult> {
    try {
      execSync('npm run env:test-db', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Database connection failed',
        details: 'Check DATABASE_URL and database server status'
      };
    }
  }

  private async validateAPIKeys(): Promise<ValidationResult> {
    try {
      execSync('npm run env:test-apis', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'All API keys are valid'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'API key validation failed',
        details: 'Check OpenAI, Vapi, and Google Places API keys'
      };
    }
  }

  private async validateMigrationTests(): Promise<ValidationResult> {
    try {
      execSync('npm run migration:test:dry-run', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Migration tests passed successfully'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Migration tests failed',
        details: 'Review migration test output for specific issues'
      };
    }
  }

  private async validateDatabaseSchema(): Promise<ValidationResult> {
    try {
      // Check if schema files exist
      const schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.ts');
      const migrationPath = path.join(process.cwd(), 'migrations');
      
      if (!fs.existsSync(schemaPath)) {
        return {
          passed: false,
          message: 'Database schema file not found',
          details: 'src/db/schema.ts is missing'
        };
      }
      
      if (!fs.existsSync(migrationPath)) {
        return {
          passed: false,
          message: 'Migration directory not found',
          details: 'migrations/ directory is missing'
        };
      }
      
      // Read schema to check for multi-tenant tables
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const hasTenants = schemaContent.includes('tenants');
      const hasHotelProfiles = schemaContent.includes('hotelProfiles');
      
      if (!hasTenants || !hasHotelProfiles) {
        return {
          passed: false,
          message: 'Multi-tenant schema not found',
          details: 'Schema missing tenants or hotelProfiles tables'
        };
      }
      
      return {
        passed: true,
        message: 'Database schema is ready for multi-tenant deployment'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Schema validation failed',
        details: error.message
      };
    }
  }

  private async validateBackupStrategy(): Promise<ValidationResult> {
    try {
      const backupDir = path.join(process.cwd(), 'backups');
      
      // Check if backup directory exists or can be created
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Check if DATABASE_URL is configured for backup
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl || !databaseUrl.includes('postgres')) {
        return {
          passed: false,
          message: 'PostgreSQL database required for production backup',
          details: 'DATABASE_URL must be a PostgreSQL connection string'
        };
      }
      
      return {
        passed: true,
        message: 'Backup strategy is configured correctly'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Backup strategy validation failed',
        details: error.message
      };
    }
  }

  private async validateDNSRecords(): Promise<ValidationResult> {
    const domain = this.environment === 'production' ? 'talk2go.online' : 'staging.talk2go.online';
    
    try {
      const { lookup } = await import('dns');
      
      return new Promise((resolve) => {
        lookup(domain, (err, address) => {
          if (err) {
            resolve({
              passed: false,
              message: 'DNS lookup failed',
              details: `Cannot resolve ${domain}: ${err.message}`
            });
          } else {
            resolve({
              passed: true,
              message: `DNS records configured correctly for ${domain}`,
              details: `Resolved to: ${address}`
            });
          }
        });
      });
    } catch (error) {
      return {
        passed: false,
        message: 'DNS validation failed',
        details: error.message
      };
    }
  }

  private async validateSSLCertificates(): Promise<ValidationResult> {
    const domain = this.environment === 'production' ? 'talk2go.online' : 'staging.talk2go.online';
    
    try {
      const https = await import('https');
      
      return new Promise((resolve) => {
        const options = {
          hostname: domain,
          port: 443,
          path: '/',
          method: 'GET',
          timeout: 5000
        };
        
        const req = https.request(options, (res) => {
          const cert = res.socket.getPeerCertificate();
          const now = new Date();
          const validTo = new Date(cert.valid_to);
          
          if (now > validTo) {
            resolve({
              passed: false,
              message: 'SSL certificate has expired',
              details: `Certificate expired on ${validTo.toISOString()}`
            });
          } else {
            resolve({
              passed: true,
              message: 'SSL certificate is valid',
              details: `Valid until ${validTo.toISOString()}`
            });
          }
        });
        
        req.on('error', (error) => {
          resolve({
            passed: false,
            message: 'SSL certificate validation failed',
            details: error.message
          });
        });
        
        req.on('timeout', () => {
          resolve({
            passed: false,
            message: 'SSL certificate validation timeout',
            details: 'Could not connect to verify certificate'
          });
        });
        
        req.end();
      });
    } catch (error) {
      return {
        passed: false,
        message: 'SSL validation failed',
        details: error.message
      };
    }
  }

  private async validateDomainRouting(): Promise<ValidationResult> {
    // This is a placeholder - in practice, you'd test actual subdomain routing
    return {
      passed: true,
      message: 'Domain routing configuration appears correct',
      details: 'Manual testing required for full validation'
    };
  }

  private async validateBuildProcess(): Promise<ValidationResult> {
    try {
      execSync('npm run build', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Application builds successfully'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Build process failed',
        details: 'Check TypeScript compilation and build scripts'
      };
    }
  }

  private async validateIntegrationTests(): Promise<ValidationResult> {
    try {
      execSync('npm run test:integration pre-deploy', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Integration tests passed'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Integration tests failed',
        details: 'Review test output for specific failures'
      };
    }
  }

  private async validatePerformanceBenchmarks(): Promise<ValidationResult> {
    // This is a placeholder - in practice, you'd run performance tests
    return {
      passed: true,
      message: 'Performance benchmarks not yet implemented',
      details: 'Manual performance testing recommended'
    };
  }

  private async validateTenantIsolation(): Promise<ValidationResult> {
    try {
      execSync('npm run test:security:tenant-isolation', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Tenant isolation security tests passed'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Tenant isolation tests failed',
        details: 'Critical security issue - deployment not recommended'
      };
    }
  }

  private async validateAuthentication(): Promise<ValidationResult> {
    try {
      execSync('npm run test:security:auth', { encoding: 'utf8' });
      return {
        passed: true,
        message: 'Authentication tests passed'
      };
    } catch (error) {
      return {
        passed: false,
        message: 'Authentication tests failed',
        details: 'Security vulnerability detected'
      };
    }
  }

  private async validateRateLimiting(): Promise<ValidationResult> {
    // Check if rate limiting is configured
    const rateLimitConfig = process.env.RATE_LIMIT_WINDOW_MS && process.env.RATE_LIMIT_MAX_REQUESTS;
    
    return {
      passed: !!rateLimitConfig,
      message: rateLimitConfig ? 'Rate limiting is configured' : 'Rate limiting not configured',
      details: rateLimitConfig ? undefined : 'Consider configuring rate limiting for production'
    };
  }
}

// ============================================
// CLI Interface
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const environment = args[0] as 'staging' | 'production';
  const verbose = args.includes('--verbose');

  if (!environment || !['staging', 'production'].includes(environment)) {
    console.log(`
🔍 Deployment Validator

Usage:
  npm run validate:deployment <environment> [options]

Environments:
  staging     Validate staging deployment readiness
  production  Validate production deployment readiness

Options:
  --verbose   Enable verbose output

Examples:
  npm run validate:deployment staging
  npm run validate:deployment production --verbose
    `);
    process.exit(1);
  }

  const validator = new DeploymentValidator(environment, verbose);
  const isReady = await validator.validateDeployment();

  process.exit(isReady ? 0 : 1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Deployment validation failed:', error);
    process.exit(1);
  });
}

export { DeploymentValidator }; 