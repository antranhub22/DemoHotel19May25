#!/usr/bin/env tsx

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { performance } from 'perf_hooks';

// ============================================
// Deployment Configuration
// ============================================

interface DeploymentConfig {
  environment: 'staging' | 'production';
  databaseUrl: string;
  domain: string;
  subdomainSuffix: string;
  backupPath: string;
  rollbackEnabled: boolean;
  dryRun: boolean;
  verbose: boolean;
  skipTests: boolean;
  autoConfirm: boolean;
}

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  command?: string;
  validator?: () => Promise<boolean>;
  critical: boolean;
  rollbackCommand?: string;
}

// ============================================
// Deployment Orchestrator
// ============================================

export class MultiTenantDeploymentOrchestrator {
  private config: DeploymentConfig;
  private rl: readline.Interface;
  private startTime: number;
  private deploymentLog: string[] = [];
  private failedSteps: string[] = [];
  private completedSteps: string[] = [];

  constructor(config: DeploymentConfig) {
    this.config = config;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.startTime = performance.now();
  }

  // ============================================
  // Main Deployment Flow
  // ============================================

  async runDeployment(): Promise<void> {
    this.log('🚀 Starting Multi-Tenant SaaS Deployment...', 'info');
    this.log(`Environment: ${this.config.environment}`, 'info');
    this.log(`Domain: ${this.config.domain}`, 'info');
    this.log(`Dry Run: ${this.config.dryRun ? 'YES' : 'NO'}`, 'info');

    try {
      // Pre-deployment validation
      await this.runPreDeploymentChecks();

      // Database migration
      await this.runDatabaseMigration();

      // Environment validation
      await this.runEnvironmentValidation();

      // Application deployment
      await this.runApplicationDeployment();

      // Post-deployment verification
      await this.runPostDeploymentVerification();

      // Success!
      await this.deploymentComplete();

    } catch (error) {
      this.log(`❌ Deployment failed: ${error.message}`, 'error');
      await this.handleDeploymentFailure(error);
    } finally {
      this.rl.close();
    }
  }

  // ============================================
  // Pre-Deployment Checks
  // ============================================

  private async runPreDeploymentChecks(): Promise<void> {
    this.log('📋 Running Pre-Deployment Checks...', 'info');

    const checks = [
      {
        name: 'Git Status Clean',
        command: 'git status --porcelain',
        validator: (output: string) => output.trim() === '',
        message: 'Working directory must be clean'
      },
      {
        name: 'Environment Variables',
        command: 'npm run env:validate',
        validator: () => true,
        message: 'Environment variables must be valid'
      },
      {
        name: 'Database Connection',
        command: 'npm run env:test-db',
        validator: () => true,
        message: 'Database must be accessible'
      },
      {
        name: 'API Keys Valid',
        command: 'npm run env:test-apis',
        validator: () => true,
        message: 'API keys must be valid'
      }
    ];

    if (!this.config.skipTests) {
      checks.push({
        name: 'Migration Tests',
        command: 'npm run migration:test:dry-run',
        validator: () => true,
        message: 'Migration tests must pass'
      });

      checks.push({
        name: 'Integration Tests',
        command: 'npm run test:integration pre-deploy',
        validator: () => true,
        message: 'Integration tests must pass'
      });
    }

    for (const check of checks) {
      await this.runCheck(check);
    }

    this.log('✅ Pre-deployment checks completed', 'success');
  }

  // ============================================
  // Database Migration
  // ============================================

  private async runDatabaseMigration(): Promise<void> {
    this.log('🗄️ Running Database Migration...', 'info');

    // Create backup first
    await this.createDatabaseBackup();

    // Run migration test
    if (!this.config.dryRun) {
      await this.runCommand('npm run migration:test:production');
    }

    // Execute migration
    const migrationSteps = [
      {
        id: 'run-migration',
        name: 'Execute Database Migration',
        command: 'npm run db:migrate',
        critical: true
      },
      {
        id: 'verify-migration',
        name: 'Verify Migration Success',
        command: 'npm run migration:verify',
        critical: true
      },
      {
        id: 'create-minhon-tenant',
        name: 'Create Mi Nhon Tenant',
        command: 'npm run seed:minhon-tenant',
        critical: true
      },
      {
        id: 'verify-tenant',
        name: 'Verify Tenant Creation',
        command: 'npm run db:verify-tenant',
        critical: true
      }
    ];

    for (const step of migrationSteps) {
      await this.runDeploymentStep(step);
    }

    this.log('✅ Database migration completed', 'success');
  }

  // ============================================
  // Environment Validation
  // ============================================

  private async runEnvironmentValidation(): Promise<void> {
    this.log('🔧 Validating Environment Configuration...', 'info');

    const validationSteps = [
      {
        id: 'validate-env-production',
        name: 'Validate Production Environment',
        command: 'npm run env:validate-production',
        critical: true
      },
      {
        id: 'test-api-connections',
        name: 'Test API Connections',
        command: 'npm run env:test-apis:production',
        critical: true
      },
      {
        id: 'verify-dns-config',
        name: 'Verify DNS Configuration',
        validator: () => this.verifyDNSConfiguration(),
        critical: true
      }
    ];

    for (const step of validationSteps) {
      await this.runDeploymentStep(step);
    }

    this.log('✅ Environment validation completed', 'success');
  }

  // ============================================
  // Application Deployment
  // ============================================

  private async runApplicationDeployment(): Promise<void> {
    this.log('🚀 Deploying Application...', 'info');

    // Build application
    await this.runCommand('npm run build');

    // Deploy based on environment
    if (this.config.environment === 'staging') {
      await this.runCommand('npm run deploy:staging');
    } else {
      await this.runCommand('npm run deploy:production');
    }

    // Start application
    await this.runCommand(`npm run start:${this.config.environment}`);

    this.log('✅ Application deployment completed', 'success');
  }

  // ============================================
  // Post-Deployment Verification
  // ============================================

  private async runPostDeploymentVerification(): Promise<void> {
    this.log('✅ Running Post-Deployment Verification...', 'info');

    const verificationSteps = [
      {
        id: 'health-check',
        name: 'Application Health Check',
        validator: () => this.verifyHealthCheck(),
        critical: true
      },
      {
        id: 'minhon-compatibility',
        name: 'Mi Nhon Hotel Compatibility',
        validator: () => this.verifyMiNhonCompatibility(),
        critical: true
      },
      {
        id: 'tenant-isolation',
        name: 'Tenant Isolation',
        validator: () => this.verifyTenantIsolation(),
        critical: true
      },
      {
        id: 'dashboard-apis',
        name: 'Dashboard APIs',
        validator: () => this.verifyDashboardAPIs(),
        critical: false
      },
      {
        id: 'voice-assistant',
        name: 'Voice Assistant Functionality',
        validator: () => this.verifyVoiceAssistant(),
        critical: false
      }
    ];

    for (const step of verificationSteps) {
      await this.runDeploymentStep(step);
    }

    this.log('✅ Post-deployment verification completed', 'success');
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async runCheck(check: any): Promise<void> {
    this.log(`Checking: ${check.name}`, 'info');

    if (this.config.dryRun) {
      this.log(`[DRY RUN] Would run: ${check.command}`, 'info');
      return;
    }

    try {
      const output = execSync(check.command, { encoding: 'utf8' });
      if (check.validator && !check.validator(output)) {
        throw new Error(check.message);
      }
      this.log(`✅ ${check.name} passed`, 'success');
    } catch (error) {
      this.log(`❌ ${check.name} failed: ${error.message}`, 'error');
      throw error;
    }
  }

  private async runDeploymentStep(step: DeploymentStep): Promise<void> {
    this.log(`Running: ${step.name}`, 'info');

    try {
      if (step.command) {
        await this.runCommand(step.command);
      }

      if (step.validator) {
        const isValid = await step.validator();
        if (!isValid) {
          throw new Error(`Validation failed for ${step.name}`);
        }
      }

      this.completedSteps.push(step.id);
      this.log(`✅ ${step.name} completed`, 'success');
    } catch (error) {
      this.failedSteps.push(step.id);
      this.log(`❌ ${step.name} failed: ${error.message}`, 'error');
      
      if (step.critical) {
        throw error;
      }
    }
  }

  private async runCommand(command: string): Promise<string> {
    this.log(`Executing: ${command}`, 'debug');

    if (this.config.dryRun) {
      this.log(`[DRY RUN] Would execute: ${command}`, 'info');
      return '';
    }

    try {
      const output = execSync(command, { encoding: 'utf8' });
      return output;
    } catch (error) {
      this.log(`Command failed: ${command}`, 'error');
      throw error;
    }
  }

  private async createDatabaseBackup(): Promise<void> {
    this.log('Creating database backup...', 'info');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.config.backupPath, `${this.config.environment}-backup-${timestamp}.sql`);

    // Create backup directory
    fs.mkdirSync(this.config.backupPath, { recursive: true });

    // Create backup
    const backupCommand = `pg_dump ${this.config.databaseUrl} > ${backupFile}`;
    await this.runCommand(backupCommand);

    this.log(`✅ Database backup created: ${backupFile}`, 'success');
  }

  // ============================================
  // Verification Methods
  // ============================================

  private async verifyHealthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/api/health`);
      return response.ok;
    } catch (error) {
      this.log(`Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  private async verifyMiNhonCompatibility(): Promise<boolean> {
    try {
      const response = await fetch(`https://minhon${this.config.subdomainSuffix}/api/health`);
      return response.ok;
    } catch (error) {
      this.log(`Mi Nhon compatibility check failed: ${error.message}`, 'error');
      return false;
    }
  }

  private async verifyTenantIsolation(): Promise<boolean> {
    this.log('Verifying tenant isolation...', 'info');
    // Run tenant isolation tests
    try {
      await this.runCommand('npm run test:security:tenant-isolation');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async verifyDashboardAPIs(): Promise<boolean> {
    try {
      const response = await fetch(`https://${this.config.domain}/api/dashboard/health`);
      return response.ok;
    } catch (error) {
      this.log(`Dashboard API check failed: ${error.message}`, 'error');
      return false;
    }
  }

  private async verifyVoiceAssistant(): Promise<boolean> {
    this.log('Verifying voice assistant functionality...', 'info');
    // Run voice assistant tests
    try {
      await this.runCommand('npm run test:voice-assistant:production');
      return true;
    } catch (error) {
      return false;
    }
  }

  private async verifyDNSConfiguration(): Promise<boolean> {
    this.log('Verifying DNS configuration...', 'info');
    // Check DNS resolution
    try {
      const { lookup } = await import('dns');
      return new Promise((resolve) => {
        lookup(this.config.domain, (err, address) => {
          if (err) {
            this.log(`DNS lookup failed: ${err.message}`, 'error');
            resolve(false);
          } else {
            this.log(`DNS resolved: ${this.config.domain} -> ${address}`, 'success');
            resolve(true);
          }
        });
      });
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // Deployment Completion
  // ============================================

  private async deploymentComplete(): Promise<void> {
    const duration = performance.now() - this.startTime;
    
    this.log('', 'info');
    this.log('🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!', 'success');
    this.log(`Duration: ${(duration / 1000).toFixed(2)}s`, 'info');
    this.log(`Environment: ${this.config.environment}`, 'info');
    this.log(`Domain: ${this.config.domain}`, 'info');
    this.log(`Completed Steps: ${this.completedSteps.length}`, 'info');
    this.log(`Failed Steps: ${this.failedSteps.length}`, 'info');

    // Generate deployment report
    await this.generateDeploymentReport();

    // Show next steps
    this.showNextSteps();
  }

  private async handleDeploymentFailure(error: Error): Promise<void> {
    this.log('', 'error');
    this.log('💥 DEPLOYMENT FAILED!', 'error');
    this.log(`Error: ${error.message}`, 'error');
    this.log(`Failed at step: ${this.failedSteps[this.failedSteps.length - 1]}`, 'error');

    if (this.config.rollbackEnabled && !this.config.dryRun) {
      const shouldRollback = await this.promptUser('Do you want to rollback? (y/n): ');
      if (shouldRollback.toLowerCase() === 'y') {
        await this.performRollback();
      }
    }

    // Generate failure report
    await this.generateFailureReport(error);
  }

  private async performRollback(): Promise<void> {
    this.log('🔄 Performing rollback...', 'info');
    
    try {
      // Stop application
      await this.runCommand(`npm run stop:${this.config.environment}`);

      // Restore database
      const backupFiles = fs.readdirSync(this.config.backupPath)
        .filter(f => f.startsWith(`${this.config.environment}-backup-`))
        .sort()
        .reverse();

      if (backupFiles.length > 0) {
        const latestBackup = path.join(this.config.backupPath, backupFiles[0]);
        await this.runCommand(`psql ${this.config.databaseUrl} < ${latestBackup}`);
        this.log(`Database restored from: ${latestBackup}`, 'success');
      }

      // Revert application
      await this.runCommand('git checkout HEAD~1');
      await this.runCommand(`npm run deploy:${this.config.environment}:rollback`);

      this.log('✅ Rollback completed', 'success');
    } catch (rollbackError) {
      this.log(`❌ Rollback failed: ${rollbackError.message}`, 'error');
    }
  }

  // ============================================
  // Reporting
  // ============================================

  private async generateDeploymentReport(): Promise<void> {
    const report = {
      deployment: {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        domain: this.config.domain,
        duration: performance.now() - this.startTime,
        status: 'SUCCESS'
      },
      steps: {
        completed: this.completedSteps,
        failed: this.failedSteps,
        total: this.completedSteps.length + this.failedSteps.length
      },
      logs: this.deploymentLog
    };

    const reportFile = path.join(this.config.backupPath, `deployment-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log(`📋 Deployment report saved: ${reportFile}`, 'info');
  }

  private async generateFailureReport(error: Error): Promise<void> {
    const report = {
      deployment: {
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        domain: this.config.domain,
        duration: performance.now() - this.startTime,
        status: 'FAILED',
        error: error.message
      },
      steps: {
        completed: this.completedSteps,
        failed: this.failedSteps,
        total: this.completedSteps.length + this.failedSteps.length
      },
      logs: this.deploymentLog
    };

    const reportFile = path.join(this.config.backupPath, `deployment-failure-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    this.log(`📋 Failure report saved: ${reportFile}`, 'info');
  }

  private showNextSteps(): void {
    this.log('', 'info');
    this.log('📋 NEXT STEPS:', 'info');
    this.log('1. Monitor application for 24 hours', 'info');
    this.log('2. Test all critical functionality', 'info');
    this.log('3. Update monitoring dashboards', 'info');
    this.log('4. Notify stakeholders of successful deployment', 'info');
    this.log('5. Schedule regular health checks', 'info');
    this.log('', 'info');
    this.log('🔍 MONITORING COMMANDS:', 'info');
    this.log(`- Health check: curl https://${this.config.domain}/api/health`, 'info');
    this.log(`- Mi Nhon check: curl https://minhon${this.config.subdomainSuffix}/api/health`, 'info');
    this.log('- View logs: npm run logs:production', 'info');
  }

  // ============================================
  // Utility Methods
  // ============================================

  private log(message: string, level: 'info' | 'success' | 'error' | 'warn' | 'debug' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    this.deploymentLog.push(logEntry);

    if (level === 'debug' && !this.config.verbose) {
      return;
    }

    const colors = {
      info: '\x1b[36m',      // Cyan
      success: '\x1b[32m',   // Green
      error: '\x1b[31m',     // Red
      warn: '\x1b[33m',      // Yellow
      debug: '\x1b[90m'      // Gray
    };

    const reset = '\x1b[0m';
    console.log(`${colors[level]}${logEntry}${reset}`);
  }

  private async promptUser(question: string): Promise<string> {
    if (this.config.autoConfirm) {
      return 'y';
    }

    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// ============================================
// CLI Interface
// ============================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const environment = args[1] as 'staging' | 'production';

  if (!command || !environment) {
    console.log(`
🚀 Multi-Tenant Deployment Orchestrator

Usage:
  npm run deploy <environment> [options]

Environments:
  staging     Deploy to staging environment
  production  Deploy to production environment

Options:
  --dry-run           Run in dry-run mode (no actual changes)
  --skip-tests        Skip pre-deployment tests
  --auto-confirm      Auto-confirm all prompts
  --verbose           Enable verbose logging
  --no-rollback       Disable rollback on failure

Examples:
  npm run deploy staging
  npm run deploy production --dry-run
  npm run deploy staging --skip-tests --auto-confirm
    `);
    process.exit(1);
  }

  const config: DeploymentConfig = {
    environment,
    databaseUrl: process.env.DATABASE_URL || '',
    domain: environment === 'production' ? 'talk2go.online' : 'staging.talk2go.online',
    subdomainSuffix: environment === 'production' ? '.talk2go.online' : '.staging.talk2go.online',
    backupPath: './deployment-backups',
    rollbackEnabled: !args.includes('--no-rollback'),
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    skipTests: args.includes('--skip-tests'),
    autoConfirm: args.includes('--auto-confirm')
  };

  const orchestrator = new MultiTenantDeploymentOrchestrator(config);
  await orchestrator.runDeployment();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Deployment orchestrator failed:', error);
    process.exit(1);
  });
}

export { MultiTenantDeploymentOrchestrator }; 