#!/usr/bin/env node

/**
 * SSOT Sync Changes Script
 * Synchronizes changes between development and production environments
 * Ensures consistent deployment of SSOT updates
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { z } = require('zod');

// Configuration schema
const SyncConfigSchema = z.object({
  environments: z.array(
    z.object({
      name: z.string(),
      branch: z.string().optional(),
      remote: z.string().optional(),
      deployCommand: z.string().optional(),
      validationCommand: z.string().optional(),
      backupCommand: z.string().optional(),
    })
  ),
  syncRules: z.object({
    includeFiles: z.array(z.string()),
    excludeFiles: z.array(z.string()),
    requireValidation: z.boolean().default(true),
    requireBackup: z.boolean().default(true),
    autoMerge: z.boolean().default(false),
  }),
  rollback: z.object({
    enabled: z.boolean().default(true),
    keepBackups: z.number().default(5),
    autoRollbackOnFailure: z.boolean().default(true),
  }),
});

class SSotSyncManager {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.force = options.force || false;
    this.backupDir = path.join(process.cwd(), '.ssot-backups');
    this.logFile = path.join(process.cwd(), 'ssot-sync.log');

    this.ssotFiles = [
      'packages/shared/db/schema.ts',
      'packages/shared/types/',
      'apps/server/routes/',
      'packages/shared/validation/schemas.ts',
    ];
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'ssot-sync.config.json');
      const configData = require(configPath);
      return SyncConfigSchema.parse(configData);
    } catch (error) {
      // Return default configuration
      return {
        environments: [
          {
            name: 'staging',
            branch: 'staging',
            remote: 'origin',
            deployCommand: 'npm run deploy:staging',
            validationCommand: 'npm run validate:all',
            backupCommand: 'npm run backup:staging',
          },
          {
            name: 'production',
            branch: 'main',
            remote: 'origin',
            deployCommand: 'npm run deploy:production',
            validationCommand: 'npm run validate:all',
            backupCommand: 'npm run backup:production',
          },
        ],
        syncRules: {
          includeFiles: [
            'packages/**',
            'apps/**',
            '*.config.*',
            'package.json',
          ],
          excludeFiles: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
          requireValidation: true,
          requireBackup: true,
          autoMerge: false,
        },
        rollback: {
          enabled: true,
          keepBackups: 5,
          autoRollbackOnFailure: true,
        },
      };
    }
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    if (this.verbose || level === 'error') {
      console.log(this.colorizeLog(logEntry, level));
    }

    await fs.appendFile(this.logFile, logEntry).catch(() => {});
  }

  colorizeLog(message, level) {
    switch (level) {
      case 'error':
        return chalk.red(message);
      case 'warn':
        return chalk.yellow(message);
      case 'success':
        return chalk.green(message);
      case 'info':
        return chalk.blue(message);
      default:
        return message;
    }
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      if (!this.dryRun) {
        await fs.mkdir(this.backupDir, { recursive: true });
      }
    }
  }

  async createBackup(environment) {
    await this.log(`Creating backup for ${environment.name}...`);

    const backupName = `${environment.name}-${Date.now()}`;
    const backupPath = path.join(this.backupDir, backupName);

    if (!this.dryRun) {
      await fs.mkdir(backupPath, { recursive: true });

      // Create git bundle backup
      const bundlePath = path.join(backupPath, 'backup.bundle');
      execSync(`git bundle create "${bundlePath}" HEAD`, {
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      // Backup specific SSOT files
      for (const file of this.ssotFiles) {
        try {
          const fullPath = path.join(process.cwd(), file);
          const stat = await fs.stat(fullPath);

          if (stat.isDirectory()) {
            execSync(`cp -r "${fullPath}" "${backupPath}/"`, {
              stdio: this.verbose ? 'inherit' : 'pipe',
            });
          } else {
            const fileName = path.basename(file);
            await fs.copyFile(fullPath, path.join(backupPath, fileName));
          }
        } catch (error) {
          await this.log(
            `Warning: Could not backup ${file}: ${error.message}`,
            'warn'
          );
        }
      }

      // Save backup metadata
      const metadata = {
        environment: environment.name,
        timestamp: new Date().toISOString(),
        gitCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        files: this.ssotFiles,
      };

      await fs.writeFile(
        path.join(backupPath, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
      );
    }

    await this.log(`Backup created: ${backupName}`, 'success');
    return backupName;
  }

  async validateChanges() {
    await this.log('Validating SSOT changes...');

    const validationCommands = [
      'node scripts/validate-ssot.js',
      'node scripts/check-breaking-changes.js',
      'npm run type-check',
      'npm run lint',
    ];

    for (const command of validationCommands) {
      try {
        if (!this.dryRun) {
          execSync(command, {
            stdio: this.verbose ? 'inherit' : 'pipe',
            encoding: 'utf8',
          });
        }
        await this.log(`✓ ${command}`, 'success');
      } catch (error) {
        await this.log(`✗ ${command}: ${error.message}`, 'error');
        throw new Error(`Validation failed: ${command}`);
      }
    }

    await this.log('All validations passed', 'success');
  }

  async detectChanges() {
    await this.log('Detecting SSOT changes...');

    const changes = {
      modified: [],
      added: [],
      deleted: [],
      hasBreakingChanges: false,
    };

    try {
      // Get git status
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const lines = status.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const status = line.substring(0, 2);
        const file = line.substring(3);

        // Only track SSOT-related files
        if (this.isSSotFile(file)) {
          if (status.includes('M')) {
            changes.modified.push(file);
          } else if (status.includes('A') || status.includes('??')) {
            changes.added.push(file);
          } else if (status.includes('D')) {
            changes.deleted.push(file);
          }
        }
      }

      // Check for breaking changes
      if (changes.modified.length > 0 || changes.deleted.length > 0) {
        try {
          execSync('node scripts/check-breaking-changes.js --check-only', {
            stdio: 'pipe',
          });
        } catch {
          changes.hasBreakingChanges = true;
        }
      }
    } catch (error) {
      await this.log(`Error detecting changes: ${error.message}`, 'warn');
    }

    return changes;
  }

  isSSotFile(filePath) {
    return this.ssotFiles.some(pattern => {
      if (pattern.endsWith('/')) {
        return filePath.startsWith(pattern);
      }
      return filePath === pattern || filePath.includes(pattern);
    });
  }

  async syncToEnvironment(environment, changes) {
    await this.log(`Syncing changes to ${environment.name}...`);

    if (this.dryRun) {
      await this.log(`[DRY RUN] Would sync to ${environment.name}`, 'info');
      return { success: true, deployed: false };
    }

    try {
      // Create backup if required
      let backupName;
      if (this.config.syncRules.requireBackup) {
        backupName = await this.createBackup(environment);
      }

      // Switch to target branch
      if (environment.branch) {
        execSync(`git checkout ${environment.branch}`, {
          stdio: this.verbose ? 'inherit' : 'pipe',
        });

        if (environment.remote) {
          execSync(`git pull ${environment.remote} ${environment.branch}`, {
            stdio: this.verbose ? 'inherit' : 'pipe',
          });
        }
      }

      // Merge changes if auto-merge is enabled
      if (this.config.syncRules.autoMerge && !this.force) {
        execSync('git merge development --no-ff', {
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
      }

      // Run validation if required
      if (this.config.syncRules.requireValidation) {
        if (environment.validationCommand) {
          execSync(environment.validationCommand, {
            stdio: this.verbose ? 'inherit' : 'pipe',
          });
        } else {
          await this.validateChanges();
        }
      }

      // Deploy changes
      if (environment.deployCommand) {
        await this.log(`Deploying to ${environment.name}...`);
        execSync(environment.deployCommand, {
          stdio: this.verbose ? 'inherit' : 'pipe',
        });
      }

      await this.log(`Successfully synced to ${environment.name}`, 'success');
      return { success: true, deployed: true, backup: backupName };
    } catch (error) {
      await this.log(
        `Sync failed for ${environment.name}: ${error.message}`,
        'error'
      );

      // Auto-rollback if enabled
      if (this.config.rollback.autoRollbackOnFailure && backupName) {
        await this.rollback(environment, backupName);
      }

      return { success: false, deployed: false, error: error.message };
    }
  }

  async rollback(environment, backupName) {
    await this.log(
      `Rolling back ${environment.name} to backup ${backupName}...`
    );

    if (this.dryRun) {
      await this.log(`[DRY RUN] Would rollback ${environment.name}`, 'info');
      return;
    }

    try {
      const backupPath = path.join(this.backupDir, backupName);
      const bundlePath = path.join(backupPath, 'backup.bundle');

      // Restore from git bundle
      execSync(`git fetch "${bundlePath}"`, {
        stdio: this.verbose ? 'inherit' : 'pipe',
      });
      execSync('git reset --hard FETCH_HEAD', {
        stdio: this.verbose ? 'inherit' : 'pipe',
      });

      await this.log(`Rollback completed for ${environment.name}`, 'success');
    } catch (error) {
      await this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async cleanupBackups() {
    await this.log('Cleaning up old backups...');

    try {
      const entries = await fs.readdir(this.backupDir);
      const backups = entries.filter(entry => entry.includes('-')).sort();

      if (backups.length > this.config.rollback.keepBackups) {
        const toDelete = backups.slice(
          0,
          backups.length - this.config.rollback.keepBackups
        );

        for (const backup of toDelete) {
          if (!this.dryRun) {
            await fs.rmdir(path.join(this.backupDir, backup), {
              recursive: true,
            });
          }
          await this.log(`Deleted old backup: ${backup}`);
        }
      }
    } catch (error) {
      await this.log(`Cleanup warning: ${error.message}`, 'warn');
    }
  }

  async sync(targetEnvironments = []) {
    await this.log('Starting SSOT sync process...');
    await this.ensureBackupDirectory();

    try {
      // Detect changes
      const changes = await this.detectChanges();

      if (
        changes.modified.length === 0 &&
        changes.added.length === 0 &&
        changes.deleted.length === 0
      ) {
        await this.log('No SSOT changes detected', 'info');
        return { success: true, synced: [] };
      }

      await this.log(`Changes detected:
        Modified: ${changes.modified.length}
        Added: ${changes.added.length}
        Deleted: ${changes.deleted.length}
        Breaking changes: ${changes.hasBreakingChanges ? 'Yes' : 'No'}`);

      // Warn about breaking changes
      if (changes.hasBreakingChanges && !this.force) {
        await this.log(
          'Breaking changes detected! Use --force to proceed',
          'warn'
        );
        throw new Error('Breaking changes require --force flag');
      }

      // Validate changes
      if (this.config.syncRules.requireValidation) {
        await this.validateChanges();
      }

      // Sync to environments
      const results = [];
      const environments =
        targetEnvironments.length > 0
          ? this.config.environments.filter(env =>
              targetEnvironments.includes(env.name)
            )
          : this.config.environments;

      for (const environment of environments) {
        const result = await this.syncToEnvironment(environment, changes);
        results.push({ environment: environment.name, ...result });
      }

      // Cleanup old backups
      await this.cleanupBackups();

      await this.log('SSOT sync process completed', 'success');
      return { success: true, synced: results };
    } catch (error) {
      await this.log(`Sync process failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    force: args.includes('--force'),
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    console.log(`
SSOT Sync Changes Script

Usage: node sync-changes.js [options] [environments...]

Options:
  --dry-run         Show what would be done without making changes
  --verbose, -v     Show detailed output
  --force           Proceed even with breaking changes
  --help, -h        Show this help message

Examples:
  node sync-changes.js                    # Sync to all environments
  node sync-changes.js staging            # Sync to staging only
  node sync-changes.js --dry-run          # Preview changes
  node sync-changes.js --force production # Force sync to production
    `);
    return;
  }

  const targetEnvironments = args.filter(arg => !arg.startsWith('--'));

  try {
    const syncManager = new SSotSyncManager(options);
    const result = await syncManager.sync(targetEnvironments);

    console.log(chalk.green('\n✓ SSOT sync completed successfully!'));

    if (result.synced.length > 0) {
      console.log('\nSynced environments:');
      result.synced.forEach(env => {
        const status = env.success ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${status} ${env.environment}`);
      });
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Sync failed: ${error.message}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { SSotSyncManager };
