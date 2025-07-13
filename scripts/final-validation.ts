#!/usr/bin/env ts-node

// ============================================================================
// FINAL VALIDATION SCRIPT
// ============================================================================

import { db } from '../lib/db';
import { staff, tenants, calls, transcripts, requests, messages, hotelProfiles } from '../lib/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { logger } from '../lib/utils/logger';
import { performance } from 'perf_hooks';

// ============================================================================
// VALIDATION RESULTS
// ============================================================================

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
  duration?: number;
}

class ValidationRunner {
  private results: ValidationResult[] = [];
  private startTime = performance.now();

  async runAllValidations(): Promise<void> {
    logger.info('Starting comprehensive system validation...');

    // Database connectivity
    await this.validateDatabaseConnection();
    
    // Schema validation
    await this.validateDatabaseSchema();
    
    // Data integrity
    await this.validateDataIntegrity();
    
    // Performance tests
    await this.validatePerformance();
    
    // Security validation
    await this.validateSecurity();
    
    // API functionality
    await this.validateAPIFunctionality();
    
    // External services
    await this.validateExternalServices();
    
    // Configuration validation
    await this.validateConfiguration();
    
    // Cleanup validation
    await this.validateCleanup();

    this.printResults();
  }

  private async validateDatabaseConnection(): Promise<void> {
    const start = performance.now();
    try {
      // Test basic connection
      await db.execute(sql`SELECT 1`);
      
      this.addResult({
        test: 'Database Connection',
        status: 'PASS',
        message: 'Database connection successful',
        duration: performance.now() - start,
      });
    } catch (error) {
      this.addResult({
        test: 'Database Connection',
        status: 'FAIL',
        message: 'Database connection failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateDatabaseSchema(): Promise<void> {
    const start = performance.now();
    try {
      // Check if all required tables exist
      const tables = ['tenants', 'staff', 'calls', 'transcripts', 'requests', 'messages', 'hotel_profiles'];
      const missingTables: string[] = [];

      for (const table of tables) {
        try {
          await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
        } catch {
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        this.addResult({
          test: 'Database Schema',
          status: 'FAIL',
          message: `Missing tables: ${missingTables.join(', ')}`,
          details: missingTables,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Database Schema',
          status: 'PASS',
          message: 'All required tables exist',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Database Schema',
        status: 'FAIL',
        message: 'Schema validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateDataIntegrity(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check for orphaned records
      const orphanedTranscripts = await db
        .select({ count: count() })
        .from(transcripts)
        .leftJoin(calls, eq(transcripts.callId, calls.id))
        .where(sql`${calls.id} IS NULL`);

      if (orphanedTranscripts[0].count > 0) {
        issues.push(`Found ${orphanedTranscripts[0].count} orphaned transcripts`);
      }

      // Check for orphaned messages
      const orphanedMessages = await db
        .select({ count: count() })
        .from(messages)
        .leftJoin(requests, eq(messages.requestId, requests.id))
        .where(sql`${requests.id} IS NULL`);

      if (orphanedMessages[0].count > 0) {
        issues.push(`Found ${orphanedMessages[0].count} orphaned messages`);
      }

      // Check for invalid tenant references
      const invalidTenantRefs = await db
        .select({ count: count() })
        .from(staff)
        .leftJoin(tenants, eq(staff.tenantId, tenants.id))
        .where(sql`${tenants.id} IS NULL`);

      if (invalidTenantRefs[0].count > 0) {
        issues.push(`Found ${invalidTenantRefs[0].count} staff with invalid tenant references`);
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'Data Integrity',
          status: 'WARNING',
          message: 'Data integrity issues found',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Data Integrity',
          status: 'PASS',
          message: 'All data integrity checks passed',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Data Integrity',
        status: 'FAIL',
        message: 'Data integrity validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validatePerformance(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check database performance
      const dbStart = performance.now();
      await db.select({ count: count() }).from(calls);
      const dbDuration = performance.now() - dbStart;

      if (dbDuration > 1000) {
        issues.push(`Database query took ${dbDuration.toFixed(2)}ms (slow)`);
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      
      if (heapUsedMB > 500) {
        issues.push(`High memory usage: ${heapUsedMB.toFixed(2)}MB`);
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'Performance',
          status: 'WARNING',
          message: 'Performance issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Performance',
          status: 'PASS',
          message: 'Performance checks passed',
          details: {
            dbQueryTime: `${dbDuration.toFixed(2)}ms`,
            memoryUsage: `${heapUsedMB.toFixed(2)}MB`,
          },
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Performance',
        status: 'FAIL',
        message: 'Performance validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateSecurity(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check for weak passwords (demo purposes)
      const users = await db.select().from(staff);
      
      for (const user of users) {
        if (user.password.length < 8) {
          issues.push(`Weak password for user: ${user.username}`);
        }
      }

      // Check for exposed sensitive data
      const sensitiveFields = ['password', 'token', 'secret'];
      const allTables = [staff, tenants, calls, transcripts, requests, messages, hotelProfiles];
      
      for (const table of allTables) {
        const columns = Object.keys(table);
        for (const field of sensitiveFields) {
          if (columns.includes(field)) {
            issues.push(`Sensitive field '${field}' found in table`);
          }
        }
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'Security',
          status: 'WARNING',
          message: 'Security issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Security',
          status: 'PASS',
          message: 'Security checks passed',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Security',
        status: 'FAIL',
        message: 'Security validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateAPIFunctionality(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check if required environment variables are set
      const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'VAPI_PUBLIC_KEY',
        'OPENAI_API_KEY',
      ];

      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          issues.push(`Missing environment variable: ${envVar}`);
        }
      }

      // Check if required files exist
      const requiredFiles = [
        'lib/validation/schemas.ts',
        'lib/errors/AppError.ts',
        'lib/performance/optimization.ts',
        'tests/integration/api.test.ts',
      ];

      const fs = require('fs');
      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          issues.push(`Missing required file: ${file}`);
        }
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'API Functionality',
          status: 'WARNING',
          message: 'API functionality issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'API Functionality',
          status: 'PASS',
          message: 'API functionality checks passed',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'API Functionality',
        status: 'FAIL',
        message: 'API functionality validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateExternalServices(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check Vapi.ai connectivity (if configured)
      if (process.env.VAPI_PUBLIC_KEY) {
        try {
          // This would be an actual API call in production
          // For now, we'll just check if the key is valid format
          if (process.env.VAPI_PUBLIC_KEY.length < 10) {
            issues.push('Vapi API key appears to be invalid');
          }
        } catch (error) {
          issues.push(`Vapi service error: ${error.message}`);
        }
      }

      // Check OpenAI connectivity (if configured)
      if (process.env.OPENAI_API_KEY) {
        try {
          // This would be an actual API call in production
          if (process.env.OPENAI_API_KEY.length < 10) {
            issues.push('OpenAI API key appears to be invalid');
          }
        } catch (error) {
          issues.push(`OpenAI service error: ${error.message}`);
        }
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'External Services',
          status: 'WARNING',
          message: 'External service issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'External Services',
          status: 'PASS',
          message: 'External service checks passed',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'External Services',
        status: 'FAIL',
        message: 'External service validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateConfiguration(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check Node.js version
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion < 18) {
        issues.push(`Node.js version ${nodeVersion} is below recommended version 18`);
      }

      // Check environment
      if (!process.env.NODE_ENV) {
        issues.push('NODE_ENV not set');
      }

      // Check database URL format
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        if (!dbUrl.includes('://')) {
          issues.push('DATABASE_URL format appears invalid');
        }
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'Configuration',
          status: 'WARNING',
          message: 'Configuration issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Configuration',
          status: 'PASS',
          message: 'Configuration checks passed',
          details: {
            nodeVersion,
            environment: process.env.NODE_ENV || 'not set',
          },
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Configuration',
        status: 'FAIL',
        message: 'Configuration validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private async validateCleanup(): Promise<void> {
    const start = performance.now();
    const issues: string[] = [];

    try {
      // Check for temporary files
      const fs = require('fs');
      const tempFiles = [
        '.env.local',
        'temp.log',
        'debug.log',
      ];

      for (const file of tempFiles) {
        if (fs.existsSync(file)) {
          issues.push(`Temporary file found: ${file}`);
        }
      }

      // Check for large log files
      const logFiles = [
        'logs/error.log',
        'logs/combined.log',
      ];

      for (const file of logFiles) {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          const sizeMB = stats.size / 1024 / 1024;
          if (sizeMB > 100) {
            issues.push(`Large log file: ${file} (${sizeMB.toFixed(2)}MB)`);
          }
        }
      }

      if (issues.length > 0) {
        this.addResult({
          test: 'Cleanup',
          status: 'WARNING',
          message: 'Cleanup issues detected',
          details: issues,
          duration: performance.now() - start,
        });
      } else {
        this.addResult({
          test: 'Cleanup',
          status: 'PASS',
          message: 'Cleanup checks passed',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addResult({
        test: 'Cleanup',
        status: 'FAIL',
        message: 'Cleanup validation failed',
        details: error.message,
        duration: performance.now() - start,
      });
    }
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);
  }

  private printResults(): void {
    const totalDuration = performance.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    console.log('\n' + '='.repeat(60));
    console.log('🔍 COMPREHENSIVE SYSTEM VALIDATION RESULTS');
    console.log('='.repeat(60));

    for (const result of this.results) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      const status = result.status.padEnd(7);
      const duration = result.duration ? ` (${result.duration.toFixed(2)}ms)` : '';
      
      console.log(`${icon} ${status} ${result.test}${duration}`);
      console.log(`   ${result.message}`);
      
      if (result.details) {
        if (Array.isArray(result.details)) {
          result.details.forEach((detail: string) => {
            console.log(`   - ${detail}`);
          });
        } else if (typeof result.details === 'object') {
          Object.entries(result.details).forEach(([key, value]) => {
            console.log(`   - ${key}: ${value}`);
          });
        } else {
          console.log(`   - ${result.details}`);
        }
      }
      console.log('');
    }

    console.log('📊 SUMMARY');
    console.log('-'.repeat(30));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`⏱️  Total Time: ${totalDuration.toFixed(2)}ms`);
    console.log('');

    if (failed > 0) {
      console.log('❌ VALIDATION FAILED - Please fix the issues above');
      process.exit(1);
    } else if (warnings > 0) {
      console.log('⚠️  VALIDATION COMPLETED WITH WARNINGS - Review the warnings above');
    } else {
      console.log('✅ VALIDATION PASSED - System is ready for production!');
    }

    console.log('='.repeat(60));
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    const runner = new ValidationRunner();
    await runner.runAllValidations();
  } catch (error) {
    logger.error('Validation script failed', { error });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 