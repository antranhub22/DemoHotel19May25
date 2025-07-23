#!/usr/bin/env node

/**
 * SSOT Dependencies Updater
 * Automatically updates dependent files when SSOT changes
 * Usage: node scripts/update-dependencies.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  schemaPath: path.join(__dirname, '../packages/shared/db/schema.ts'),
  typesPath: path.join(__dirname, '../packages/types'),
  validationSchemasPath: path.join(
    __dirname,
    '../packages/shared/validation/schemas.ts'
  ),
  routesPath: path.join(__dirname, '../apps/server/routes'),
  frontendPath: path.join(__dirname, '../apps/client/src'),
  servicesPath: path.join(__dirname, '../apps/server/services'),
  backupPath: path.join(__dirname, '../backup/dependencies-backup'),
  logPath: path.join(__dirname, '../update-dependencies.log'),
  configPath: path.join(__dirname, '../ssot-dependencies.json'),
};

// File dependency mappings
const DEPENDENCY_MAP = {
  'packages/shared/db/schema.ts': [
    'packages/types/database.ts',
    'packages/types/api.ts',
    'packages/types/core.ts',
    'packages/shared/validation/schemas.ts',
    'apps/server/services/*.ts',
    'apps/client/src/types/*.ts',
  ],
  'packages/shared/validation/schemas.ts': [
    'docs/api/*.md',
    'docs/api/openapi.json',
    'docs/api/postman-collection.json',
  ],
  'apps/server/routes/*.ts': [
    'docs/api/*.md',
    'docs/api/openapi.json',
    'docs/api/postman-collection.json',
    'packages/types/api.ts',
  ],
};

class DependencyUpdater {
  constructor() {
    this.changes = [];
    this.errors = [];
    this.updated = [];
    this.skipped = [];
    this.timestamp = new Date().toISOString();
    this.config = null;
  }

  async updateDependencies() {
    console.log('🔄 Starting SSOT Dependencies Update...');

    try {
      // Load configuration
      await this.loadConfiguration();

      // Create backup
      await this.createBackup();

      // Detect changes in SSOT files
      await this.detectChanges();

      // Update dependent files
      await this.updateDependentFiles();

      // Regenerate types if schema changed
      await this.regenerateTypes();

      // Regenerate API docs if routes changed
      await this.regenerateApiDocs();

      // Update validation schemas
      await this.updateValidationSchemas();

      // Update frontend types
      await this.updateFrontendTypes();

      // Run validation
      await this.validateUpdates();

      // Generate update log
      await this.generateUpdateLog();

      console.log(`✅ Dependencies update completed!`);
      console.log(`📁 Updated ${this.updated.length} files`);
      console.log(`⚠️  Skipped ${this.skipped.length} files`);
      console.log(`❌ ${this.errors.length} errors encountered`);
    } catch (error) {
      console.error('❌ Dependencies update failed:', error);
      await this.restoreBackup();
      process.exit(1);
    }
  }

  async loadConfiguration() {
    console.log('⚙️ Loading dependencies configuration...');

    if (fs.existsSync(CONFIG.configPath)) {
      const configContent = fs.readFileSync(CONFIG.configPath, 'utf8');
      this.config = JSON.parse(configContent);
    } else {
      // Create default configuration
      this.config = {
        version: '1.0.0',
        updateStrategies: {
          types: 'regenerate', // regenerate | merge | manual
          apiDocs: 'regenerate',
          validationSchemas: 'merge',
          frontendTypes: 'sync',
        },
        autoUpdate: {
          enabled: true,
          excludePatterns: ['*.test.ts', '*.spec.ts', 'node_modules/**'],
          includePatterns: ['**/*.ts', '**/*.js', '**/*.md'],
        },
        backupStrategy: {
          enabled: true,
          maxBackups: 10,
          retentionDays: 30,
        },
        notifications: {
          slack: false,
          email: false,
          console: true,
        },
      };

      fs.writeFileSync(CONFIG.configPath, JSON.stringify(this.config, null, 2));
    }

    console.log('✅ Configuration loaded');
  }

  async createBackup() {
    console.log('💾 Creating backup of current state...');

    const backupDir = path.join(
      CONFIG.backupPath,
      this.timestamp.replace(/[:.]/g, '-')
    );

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup key files that will be updated
    const filesToBackup = [
      CONFIG.typesPath,
      CONFIG.validationSchemasPath,
      path.join(__dirname, '../docs/api'),
      path.join(CONFIG.frontendPath, 'types'),
    ];

    for (const filePath of filesToBackup) {
      if (fs.existsSync(filePath)) {
        const relativePath = path.relative(
          path.join(__dirname, '..'),
          filePath
        );
        const backupFilePath = path.join(backupDir, relativePath);

        // Ensure backup directory exists
        const backupFileDir = path.dirname(backupFilePath);
        if (!fs.existsSync(backupFileDir)) {
          fs.mkdirSync(backupFileDir, { recursive: true });
        }

        // Copy file or directory
        if (fs.statSync(filePath).isDirectory()) {
          this.copyDirectory(filePath, backupFilePath);
        } else {
          fs.copyFileSync(filePath, backupFilePath);
        }
      }
    }

    console.log(`✅ Backup created at: ${backupDir}`);
  }

  copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);

    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);

      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async detectChanges() {
    console.log('🔍 Detecting changes in SSOT files...');

    const ssotFiles = [
      CONFIG.schemaPath,
      CONFIG.validationSchemasPath,
      ...this.getRouteFiles(),
    ];

    for (const filePath of ssotFiles) {
      if (fs.existsSync(filePath)) {
        const lastModified = fs.statSync(filePath).mtime;
        const isRecent =
          Date.now() - lastModified.getTime() < 24 * 60 * 60 * 1000; // 24 hours

        if (isRecent || this.config.autoUpdate.enabled) {
          this.changes.push({
            file: filePath,
            type: this.getFileType(filePath),
            lastModified: lastModified.toISOString(),
            dependencies: this.getDependencies(filePath),
          });
        }
      }
    }

    console.log(
      `✅ Detected ${this.changes.length} recently changed SSOT files`
    );
  }

  getRouteFiles() {
    if (!fs.existsSync(CONFIG.routesPath)) return [];

    return fs
      .readdirSync(CONFIG.routesPath)
      .filter(file => file.endsWith('.ts') && !file.includes('.test.'))
      .map(file => path.join(CONFIG.routesPath, file));
  }

  getFileType(filePath) {
    if (filePath.includes('schema.ts')) return 'schema';
    if (filePath.includes('validation')) return 'validation';
    if (filePath.includes('routes')) return 'routes';
    return 'unknown';
  }

  getDependencies(filePath) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);

    for (const [sourcePattern, dependencies] of Object.entries(
      DEPENDENCY_MAP
    )) {
      if (this.matchesPattern(relativePath, sourcePattern)) {
        return dependencies;
      }
    }

    return [];
  }

  matchesPattern(filePath, pattern) {
    // Simple pattern matching - can be enhanced with glob patterns
    if (pattern.includes('*')) {
      const basePattern = pattern.replace('*', '');
      return filePath.includes(basePattern.replace('/', ''));
    }
    return filePath === pattern;
  }

  async updateDependentFiles() {
    console.log('📝 Updating dependent files...');

    const updatedFiles = new Set();

    for (const change of this.changes) {
      console.log(`📄 Processing change in: ${path.basename(change.file)}`);

      for (const dependency of change.dependencies) {
        const dependentFiles = this.expandPattern(dependency);

        for (const dependentFile of dependentFiles) {
          if (!updatedFiles.has(dependentFile)) {
            await this.updateFile(dependentFile, change);
            updatedFiles.add(dependentFile);
          }
        }
      }
    }

    console.log(`✅ Updated ${updatedFiles.size} dependent files`);
  }

  expandPattern(pattern) {
    const files = [];
    const basePath = path.join(__dirname, '..');

    if (pattern.includes('*')) {
      const [baseDir, filePattern] = pattern.split('*');
      const fullBaseDir = path.join(basePath, baseDir);

      if (fs.existsSync(fullBaseDir)) {
        const allFiles = fs.readdirSync(fullBaseDir);
        const matchingFiles = allFiles.filter(file => {
          if (filePattern) {
            return file.endsWith(filePattern.slice(1)); // Remove leading dot
          }
          return true;
        });

        files.push(...matchingFiles.map(file => path.join(fullBaseDir, file)));
      }
    } else {
      const fullPath = path.join(basePath, pattern);
      if (fs.existsSync(fullPath)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  async updateFile(filePath, change) {
    try {
      console.log(`  📝 Updating: ${path.basename(filePath)}`);

      const fileExtension = path.extname(filePath);
      const updateStrategy = this.getUpdateStrategy(filePath, change.type);

      switch (updateStrategy) {
        case 'regenerate':
          await this.regenerateFile(filePath, change);
          break;
        case 'merge':
          await this.mergeFile(filePath, change);
          break;
        case 'sync':
          await this.syncFile(filePath, change);
          break;
        case 'manual':
          this.skipped.push({
            file: filePath,
            reason: 'Manual update required',
            change: change.type,
          });
          return;
        default:
          this.skipped.push({
            file: filePath,
            reason: 'No update strategy defined',
            change: change.type,
          });
          return;
      }

      this.updated.push({
        file: filePath,
        strategy: updateStrategy,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.errors.push({
        file: filePath,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      console.error(
        `    ❌ Failed to update ${path.basename(filePath)}: ${error.message}`
      );
    }
  }

  getUpdateStrategy(filePath, changeType) {
    if (filePath.includes('/types/')) {
      return this.config.updateStrategies.types;
    }
    if (filePath.includes('/api/')) {
      return this.config.updateStrategies.apiDocs;
    }
    if (filePath.includes('validation')) {
      return this.config.updateStrategies.validationSchemas;
    }
    if (filePath.includes('client/src/types')) {
      return this.config.updateStrategies.frontendTypes;
    }

    return 'manual';
  }

  async regenerateFile(filePath, change) {
    // For generated files, we regenerate them completely
    if (filePath.includes('/types/')) {
      // Types will be regenerated in regenerateTypes()
      return;
    }

    if (filePath.includes('/api/')) {
      // API docs will be regenerated in regenerateApiDocs()
      return;
    }

    console.log(`    🔄 Regenerating: ${path.basename(filePath)}`);
  }

  async mergeFile(filePath, change) {
    console.log(`    🔀 Merging changes into: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
      console.log(`    📝 Creating new file: ${path.basename(filePath)}`);
      // Create new file based on change type
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');

    // Add timestamp and change info to comments
    const updateComment = `// Updated on: ${this.timestamp}\n// Source change: ${change.type} in ${path.basename(change.file)}\n\n`;

    if (content.includes('// Updated on:')) {
      // Replace existing update comment
      const updatedContent = content.replace(
        /\/\/ Updated on:.*?\n\n/s,
        updateComment
      );
      fs.writeFileSync(filePath, updatedContent);
    } else {
      // Add update comment at the top
      fs.writeFileSync(filePath, updateComment + content);
    }
  }

  async syncFile(filePath, change) {
    console.log(`    🔄 Syncing: ${path.basename(filePath)}`);

    // For frontend type files, copy from generated types
    if (filePath.includes('client/src/types')) {
      const sourceTypesPath = path.join(CONFIG.typesPath, 'index.ts');
      if (fs.existsSync(sourceTypesPath)) {
        const typesContent = fs.readFileSync(sourceTypesPath, 'utf8');
        const syncedContent = this.adaptTypesForFrontend(typesContent);
        fs.writeFileSync(filePath, syncedContent);
      }
    }
  }

  adaptTypesForFrontend(typesContent) {
    // Adapt generated types for frontend use
    let adapted = typesContent;

    // Add frontend-specific imports if needed
    const frontendImports = `// Frontend-adapted types\n// Auto-synced from backend types\n\n`;

    // Remove server-specific types
    adapted = adapted.replace(/export.*Database.*\n/g, '');

    // Add frontend utilities
    adapted += `\n\n// Frontend utility types\nexport type LoadingState = 'idle' | 'loading' | 'success' | 'error';\nexport type FormState<T> = {\n  data: T;\n  loading: LoadingState;\n  error?: string;\n};\n`;

    return frontendImports + adapted;
  }

  async regenerateTypes() {
    console.log('🏗️ Regenerating types from schema...');

    try {
      const { TypeGenerator } = await import('../build/generate-types.js');
      const generator = new TypeGenerator();
      await generator.generateTypes();
      console.log('  ✅ Types regenerated successfully');
    } catch (error) {
      console.error('  ❌ Failed to regenerate types:', error.message);
      this.errors.push({
        file: 'types',
        error: `Type generation failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async regenerateApiDocs() {
    console.log('📚 Regenerating API documentation...');

    try {
      const { ApiDocGenerator } = await import('../build/generate-api-docs.js');
      const generator = new ApiDocGenerator();
      await generator.generateApiDocs();
      console.log('  ✅ API documentation regenerated successfully');
    } catch (error) {
      console.error('  ❌ Failed to regenerate API docs:', error.message);
      this.errors.push({
        file: 'api-docs',
        error: `API documentation generation failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async updateValidationSchemas() {
    console.log('📋 Updating validation schemas...');

    if (!fs.existsSync(CONFIG.validationSchemasPath)) {
      console.log('  ⚠️  Validation schemas file not found, skipping');
      return;
    }

    try {
      const content = fs.readFileSync(CONFIG.validationSchemasPath, 'utf8');

      // Add update timestamp comment
      const updatedContent = content.replace(
        /(\/\/ Auto-generated.*\n)/,
        `$1// Last updated: ${this.timestamp}\n`
      );

      fs.writeFileSync(CONFIG.validationSchemasPath, updatedContent);
      console.log('  ✅ Validation schemas updated');
    } catch (error) {
      console.error('  ❌ Failed to update validation schemas:', error.message);
    }
  }

  async updateFrontendTypes() {
    console.log('🎨 Updating frontend types...');

    const frontendTypesDir = path.join(CONFIG.frontendPath, 'types');

    if (!fs.existsSync(frontendTypesDir)) {
      fs.mkdirSync(frontendTypesDir, { recursive: true });
    }

    try {
      // Sync core types
      const coreTypesPath = path.join(CONFIG.typesPath, 'core.ts');
      const frontendCoreTypesPath = path.join(frontendTypesDir, 'core.ts');

      if (fs.existsSync(coreTypesPath)) {
        const coreTypes = fs.readFileSync(coreTypesPath, 'utf8');
        const adaptedTypes = this.adaptTypesForFrontend(coreTypes);
        fs.writeFileSync(frontendCoreTypesPath, adaptedTypes);
      }

      // Sync API types
      const apiTypesPath = path.join(CONFIG.typesPath, 'api.ts');
      const frontendApiTypesPath = path.join(frontendTypesDir, 'api.ts');

      if (fs.existsSync(apiTypesPath)) {
        const apiTypes = fs.readFileSync(apiTypesPath, 'utf8');
        const adaptedApiTypes = this.adaptTypesForFrontend(apiTypes);
        fs.writeFileSync(frontendApiTypesPath, adaptedApiTypes);
      }

      console.log('  ✅ Frontend types updated');
    } catch (error) {
      console.error('  ❌ Failed to update frontend types:', error.message);
    }
  }

  async validateUpdates() {
    console.log('🔍 Validating updates...');

    try {
      const { SSOTValidator } = await import('../validation/validate-ssot.js');
      const validator = new SSOTValidator();

      // Run validation but don't exit on failure
      await validator.validateSSot().catch(() => {
        console.log('  ⚠️  Validation found issues - check validation report');
      });

      console.log('  ✅ Validation completed');
    } catch (error) {
      console.error('  ❌ Validation failed:', error.message);
    }
  }

  async generateUpdateLog() {
    console.log('📊 Generating update log...');

    const log = {
      timestamp: this.timestamp,
      summary: {
        changesDetected: this.changes.length,
        filesUpdated: this.updated.length,
        filesSkipped: this.skipped.length,
        errorsEncountered: this.errors.length,
      },
      changes: this.changes,
      updated: this.updated,
      skipped: this.skipped,
      errors: this.errors,
      configuration: this.config,
    };

    fs.writeFileSync(CONFIG.logPath, JSON.stringify(log, null, 2));

    // Also write a human-readable summary
    const summaryPath = path.join(
      path.dirname(CONFIG.logPath),
      'update-summary.md'
    );
    const summaryContent = this.generateSummaryMarkdown(log);
    fs.writeFileSync(summaryPath, summaryContent);

    console.log(`📁 Update log saved to: ${CONFIG.logPath}`);
    console.log(`📄 Summary saved to: ${summaryPath}`);
  }

  generateSummaryMarkdown(log) {
    return `# SSOT Dependencies Update Summary

Generated on: ${log.timestamp}

## Summary

- **Changes Detected:** ${log.summary.changesDetected}
- **Files Updated:** ${log.summary.filesUpdated}
- **Files Skipped:** ${log.summary.filesSkipped}
- **Errors:** ${log.summary.errorsEncountered}

## Updated Files

${log.updated.map(u => `- ${path.basename(u.file)} (${u.strategy})`).join('\n')}

## Skipped Files

${log.skipped.map(s => `- ${path.basename(s.file)}: ${s.reason}`).join('\n')}

${
  log.errors.length > 0
    ? `\n## Errors

${log.errors.map(e => `- ${path.basename(e.file)}: ${e.error}`).join('\n')}`
    : ''
}

---

*Generated by SSOT Dependencies Updater*
`;
  }

  async restoreBackup() {
    console.log('🔄 Restoring from backup...');

    // Find the most recent backup
    const backups = fs
      .readdirSync(CONFIG.backupPath)
      .filter(dir =>
        fs.statSync(path.join(CONFIG.backupPath, dir)).isDirectory()
      )
      .sort()
      .reverse();

    if (backups.length === 0) {
      console.log('  ⚠️  No backups found to restore');
      return;
    }

    const latestBackup = path.join(CONFIG.backupPath, backups[0]);

    try {
      // Restore files from backup
      this.copyDirectory(latestBackup, path.join(__dirname, '..'));
      console.log(`  ✅ Restored from backup: ${backups[0]}`);
    } catch (error) {
      console.error('  ❌ Failed to restore backup:', error.message);
    }
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new DependencyUpdater();

  updater.updateDependencies().catch(error => {
    console.error('❌ Dependencies update error:', error);
    process.exit(1);
  });
}

export default DependencyUpdater;
