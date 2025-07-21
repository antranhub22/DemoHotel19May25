#!/usr/bin/env node

/**
 * SSOT Migration Documentation Generator
 * Automatically generates migration guides for database and system changes
 * Provides step-by-step instructions for safe migrations
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { z } = require('zod');

// Configuration schema
const MigrationDocsConfigSchema = z.object({
  output: z.object({
    directory: z.string().default('./docs/migrations'),
    format: z.enum(['markdown', 'html', 'json', 'all']).default('markdown'),
    includeRollback: z.boolean().default(true),
    includeValidation: z.boolean().default(true),
  }),
  detection: z.object({
    schemaFiles: z
      .array(z.string())
      .default([
        'packages/shared/db/schema.ts',
        'tools/migrations/*.sql',
        'drizzle.config.ts',
      ]),
    apiFiles: z
      .array(z.string())
      .default(['apps/server/routes/*.ts', 'packages/shared/types/*.ts']),
    configFiles: z
      .array(z.string())
      .default([
        'package.json',
        '.env.example',
        'vite.config.ts',
        'tsconfig.json',
      ]),
  }),
  migration: z.object({
    includeBackup: z.boolean().default(true),
    includeTesting: z.boolean().default(true),
    includeMonitoring: z.boolean().default(true),
    estimateDowntime: z.boolean().default(true),
  }),
  templates: z.object({
    headerTemplate: z.string().optional(),
    footerTemplate: z.string().optional(),
    stepTemplate: z.string().optional(),
  }),
});

class MigrationDocsGenerator {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.version = options.version || 'latest';

    this.logFile = path.join(process.cwd(), 'migration-docs.log');
    this.migrations = new Map();
    this.changeCategories = {
      database: [],
      api: [],
      configuration: [],
      dependencies: [],
      breaking: [],
    };
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'migration-docs.config.json');
      const configData = require(configPath);
      return MigrationDocsConfigSchema.parse(configData);
    } catch (error) {
      // Return default configuration
      return MigrationDocsConfigSchema.parse({});
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

  async detectChanges() {
    await this.log('Detecting system changes...');

    // Detect database changes
    await this.detectDatabaseChanges();

    // Detect API changes
    await this.detectApiChanges();

    // Detect configuration changes
    await this.detectConfigurationChanges();

    // Detect dependency changes
    await this.detectDependencyChanges();

    // Run breaking changes detection
    await this.detectBreakingChanges();

    await this.log('Change detection completed', 'success');
  }

  async detectDatabaseChanges() {
    await this.log('Detecting database changes...');

    try {
      // Check for new migration files
      const migrationDir = 'tools/migrations';
      if (await this.fileExists(migrationDir)) {
        const files = await fs.readdir(migrationDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql'));

        for (const file of sqlFiles) {
          const content = await fs.readFile(
            path.join(migrationDir, file),
            'utf8'
          );
          const migration = this.analyzeMigrationFile(file, content);
          this.changeCategories.database.push(migration);
        }
      }

      // Check schema.ts changes
      const schemaFile = 'packages/shared/db/schema.ts';
      if (await this.fileExists(schemaFile)) {
        const changes = await this.getFileChanges(schemaFile);
        if (changes.length > 0) {
          this.changeCategories.database.push({
            type: 'schema_modification',
            file: schemaFile,
            description: 'Database schema changes detected',
            changes: changes,
            impact: 'medium',
            requiresDowntime: false,
          });
        }
      }
    } catch (error) {
      await this.log(
        `Database change detection error: ${error.message}`,
        'warn'
      );
    }
  }

  async detectApiChanges() {
    await this.log('Detecting API changes...');

    try {
      const routesDir = 'apps/server/routes';
      if (await this.fileExists(routesDir)) {
        const files = await fs.readdir(routesDir);

        for (const file of files) {
          if (file.endsWith('.ts')) {
            const changes = await this.getFileChanges(
              path.join(routesDir, file)
            );
            if (changes.length > 0) {
              const apiChange = {
                type: 'api_modification',
                file: file,
                description: `API route changes in ${file}`,
                changes: changes,
                impact: 'low',
                requiresDowntime: false,
              };

              // Check if changes affect endpoints
              const content = await fs.readFile(
                path.join(routesDir, file),
                'utf8'
              );
              if (this.hasEndpointChanges(content, changes)) {
                apiChange.impact = 'medium';
                apiChange.description += ' (endpoints modified)';
              }

              this.changeCategories.api.push(apiChange);
            }
          }
        }
      }
    } catch (error) {
      await this.log(`API change detection error: ${error.message}`, 'warn');
    }
  }

  async detectConfigurationChanges() {
    await this.log('Detecting configuration changes...');

    try {
      const configFiles = [
        'package.json',
        '.env.example',
        'vite.config.ts',
        'tsconfig.json',
        'drizzle.config.ts',
      ];

      for (const file of configFiles) {
        if (await this.fileExists(file)) {
          const changes = await this.getFileChanges(file);
          if (changes.length > 0) {
            this.changeCategories.configuration.push({
              type: 'config_modification',
              file: file,
              description: `Configuration changes in ${file}`,
              changes: changes,
              impact: this.assessConfigImpact(file, changes),
              requiresDowntime: file === 'package.json',
            });
          }
        }
      }
    } catch (error) {
      await this.log(
        `Configuration change detection error: ${error.message}`,
        'warn'
      );
    }
  }

  async detectDependencyChanges() {
    await this.log('Detecting dependency changes...');

    try {
      const packageChanges = await this.getFileChanges('package.json');
      if (packageChanges.length > 0) {
        const packageContent = await fs.readFile('package.json', 'utf8');
        const packageJson = JSON.parse(packageContent);

        // Get previous package.json from git
        let previousPackageJson = {};
        try {
          const previousContent = execSync('git show HEAD~1:package.json', {
            encoding: 'utf8',
          });
          previousPackageJson = JSON.parse(previousContent);
        } catch {
          // No previous version or file doesn't exist
        }

        const depChanges = this.compareDependencies(
          previousPackageJson,
          packageJson
        );

        this.changeCategories.dependencies.push({
          type: 'dependency_changes',
          file: 'package.json',
          description: 'Package dependencies modified',
          changes: depChanges,
          impact: this.assessDependencyImpact(depChanges),
          requiresDowntime: depChanges.major.length > 0,
        });
      }
    } catch (error) {
      await this.log(
        `Dependency change detection error: ${error.message}`,
        'warn'
      );
    }
  }

  async detectBreakingChanges() {
    await this.log('Detecting breaking changes...');

    try {
      // Run breaking changes script
      const output = execSync(
        'node scripts/check-breaking-changes.js --format=json',
        {
          encoding: 'utf8',
          stdio: 'pipe',
        }
      );

      const breakingChanges = JSON.parse(output);

      for (const change of breakingChanges.changes || []) {
        this.changeCategories.breaking.push({
          type: 'breaking_change',
          category: change.category,
          description: change.description,
          impact: 'high',
          requiresDowntime: true,
          mitigation: change.mitigation || 'Manual intervention required',
        });
      }
    } catch (error) {
      await this.log(
        `Breaking change detection warning: ${error.message}`,
        'warn'
      );
    }
  }

  analyzeMigrationFile(filename, content) {
    const migration = {
      type: 'database_migration',
      file: filename,
      description: `Database migration: ${filename}`,
      operations: [],
      impact: 'medium',
      requiresDowntime: false,
    };

    // Analyze SQL operations
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().toUpperCase();

      if (trimmed.startsWith('CREATE TABLE')) {
        migration.operations.push('CREATE_TABLE');
      } else if (trimmed.startsWith('ALTER TABLE')) {
        migration.operations.push('ALTER_TABLE');
        if (trimmed.includes('DROP COLUMN')) {
          migration.requiresDowntime = true;
          migration.impact = 'high';
        }
      } else if (trimmed.startsWith('DROP TABLE')) {
        migration.operations.push('DROP_TABLE');
        migration.requiresDowntime = true;
        migration.impact = 'high';
      } else if (trimmed.startsWith('CREATE INDEX')) {
        migration.operations.push('CREATE_INDEX');
      }
    }

    return migration;
  }

  async getFileChanges(filePath) {
    try {
      const diff = execSync(`git diff HEAD~1 -- "${filePath}"`, {
        encoding: 'utf8',
      });

      const changes = [];
      const lines = diff.split('\n');

      for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          changes.push({ type: 'addition', content: line.substring(1) });
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          changes.push({ type: 'deletion', content: line.substring(1) });
        }
      }

      return changes;
    } catch {
      return [];
    }
  }

  hasEndpointChanges(content, changes) {
    const endpointPattern = /router\.(get|post|put|delete|patch)/;
    return changes.some(change => endpointPattern.test(change.content));
  }

  assessConfigImpact(filename, changes) {
    if (filename === 'package.json') {
      return 'high';
    } else if (filename.includes('config')) {
      return 'medium';
    }
    return 'low';
  }

  compareDependencies(previous, current) {
    const changes = {
      added: [],
      removed: [],
      updated: [],
      major: [],
    };

    const prevDeps = { ...previous.dependencies, ...previous.devDependencies };
    const currDeps = { ...current.dependencies, ...current.devDependencies };

    // Added dependencies
    for (const [name, version] of Object.entries(currDeps)) {
      if (!prevDeps[name]) {
        changes.added.push({ name, version });
      }
    }

    // Removed dependencies
    for (const [name, version] of Object.entries(prevDeps)) {
      if (!currDeps[name]) {
        changes.removed.push({ name, version });
      }
    }

    // Updated dependencies
    for (const [name, version] of Object.entries(currDeps)) {
      if (prevDeps[name] && prevDeps[name] !== version) {
        const change = { name, from: prevDeps[name], to: version };
        changes.updated.push(change);

        // Check for major version changes
        if (this.isMajorVersionChange(prevDeps[name], version)) {
          changes.major.push(change);
        }
      }
    }

    return changes;
  }

  isMajorVersionChange(from, to) {
    try {
      const fromMajor = parseInt(from.replace(/[^\d.].*/, '').split('.')[0]);
      const toMajor = parseInt(to.replace(/[^\d.].*/, '').split('.')[0]);
      return toMajor > fromMajor;
    } catch {
      return false;
    }
  }

  assessDependencyImpact(changes) {
    if (changes.major.length > 0) return 'high';
    if (changes.updated.length > 5 || changes.added.length > 3) return 'medium';
    return 'low';
  }

  async fileExists(filePath) {
    try {
      await fs.access(path.join(process.cwd(), filePath));
      return true;
    } catch {
      return false;
    }
  }

  generateMigrationSteps() {
    const steps = [];

    // Pre-migration steps
    steps.push({
      phase: 'preparation',
      title: 'Pre-Migration Preparation',
      steps: [
        'Create backup of current system',
        'Verify all tests pass',
        'Review migration plan with team',
        'Schedule maintenance window if required',
        'Prepare rollback procedures',
      ],
    });

    // Database migrations
    if (this.changeCategories.database.length > 0) {
      steps.push({
        phase: 'database',
        title: 'Database Migration',
        steps: this.generateDatabaseSteps(),
      });
    }

    // Dependency updates
    if (this.changeCategories.dependencies.length > 0) {
      steps.push({
        phase: 'dependencies',
        title: 'Dependency Updates',
        steps: this.generateDependencySteps(),
      });
    }

    // Configuration changes
    if (this.changeCategories.configuration.length > 0) {
      steps.push({
        phase: 'configuration',
        title: 'Configuration Updates',
        steps: this.generateConfigurationSteps(),
      });
    }

    // API changes
    if (this.changeCategories.api.length > 0) {
      steps.push({
        phase: 'api',
        title: 'API Updates',
        steps: this.generateApiSteps(),
      });
    }

    // Post-migration steps
    steps.push({
      phase: 'verification',
      title: 'Post-Migration Verification',
      steps: [
        'Run full test suite',
        'Verify API endpoints',
        'Check database integrity',
        'Monitor system metrics',
        'Validate user functionality',
      ],
    });

    return steps;
  }

  generateDatabaseSteps() {
    const steps = [];

    for (const change of this.changeCategories.database) {
      if (change.type === 'database_migration') {
        steps.push(`Execute migration: ${change.file}`);
        if (change.requiresDowntime) {
          steps.push('⚠️ This step requires system downtime');
        }
      } else if (change.type === 'schema_modification') {
        steps.push('Update database schema');
        steps.push('Regenerate types with: npm run generate:types');
      }
    }

    steps.push('Verify database schema matches expectations');
    return steps;
  }

  generateDependencySteps() {
    const steps = [];

    steps.push('Stop application services');
    steps.push('Update dependencies: npm install');

    for (const depChange of this.changeCategories.dependencies) {
      if (depChange.changes.major.length > 0) {
        steps.push(
          '⚠️ Major version updates detected - review breaking changes'
        );
        for (const major of depChange.changes.major) {
          steps.push(`- ${major.name}: ${major.from} → ${major.to}`);
        }
      }
    }

    steps.push('Rebuild application: npm run build');
    steps.push('Start application services');

    return steps;
  }

  generateConfigurationSteps() {
    const steps = [];

    for (const change of this.changeCategories.configuration) {
      steps.push(`Update ${change.file}`);

      if (change.file === '.env.example') {
        steps.push('Review and update environment variables');
        steps.push('Update production .env file accordingly');
      }

      if (change.requiresDowntime) {
        steps.push('⚠️ Restart required for this configuration');
      }
    }

    return steps;
  }

  generateApiSteps() {
    const steps = [];

    steps.push('Deploy API changes');

    for (const change of this.changeCategories.api) {
      if (change.impact === 'medium') {
        steps.push(`Verify endpoints in ${change.file}`);
      }
    }

    steps.push('Update API documentation');
    steps.push('Test API endpoints');

    return steps;
  }

  async generateMarkdownDoc() {
    let doc = `# Migration Guide - Version ${this.version}\n\n`;

    doc += `Generated: ${new Date().toISOString()}\n\n`;

    // Summary
    doc += '## Migration Summary\n\n';
    const totalChanges = Object.values(this.changeCategories).flat().length;
    doc += `This migration includes ${totalChanges} changes across the following categories:\n\n`;

    for (const [category, changes] of Object.entries(this.changeCategories)) {
      if (changes.length > 0) {
        doc += `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${changes.length} changes\n`;
      }
    }

    doc += '\n';

    // Risk assessment
    doc += '## Risk Assessment\n\n';
    const hasHighRisk = Object.values(this.changeCategories)
      .flat()
      .some(c => c.impact === 'high');
    const requiresDowntime = Object.values(this.changeCategories)
      .flat()
      .some(c => c.requiresDowntime);

    if (hasHighRisk) {
      doc += '🔴 **HIGH RISK** - This migration contains breaking changes\n\n';
    } else {
      doc += '🟡 **MEDIUM RISK** - Standard migration with minimal risk\n\n';
    }

    if (requiresDowntime) {
      doc +=
        '⏰ **DOWNTIME REQUIRED** - System will be unavailable during migration\n\n';
    } else {
      doc +=
        '✅ **ZERO DOWNTIME** - Migration can be performed without service interruption\n\n';
    }

    // Estimated duration
    doc += '## Estimated Duration\n\n';
    const estimatedMinutes = this.estimateMigrationTime();
    doc += `- **Preparation**: 15 minutes\n`;
    doc += `- **Migration**: ${estimatedMinutes} minutes\n`;
    doc += `- **Verification**: 10 minutes\n`;
    doc += `- **Total**: ${estimatedMinutes + 25} minutes\n\n`;

    // Prerequisites
    doc += '## Prerequisites\n\n';
    doc += '- [ ] All tests passing\n';
    doc += '- [ ] Backup created\n';
    doc += '- [ ] Maintenance window scheduled (if required)\n';
    doc += '- [ ] Team members notified\n';
    doc += '- [ ] Rollback plan ready\n\n';

    // Migration steps
    doc += '## Migration Steps\n\n';
    const migrationSteps = this.generateMigrationSteps();

    let stepNumber = 1;
    for (const phase of migrationSteps) {
      doc += `### Phase ${stepNumber}: ${phase.title}\n\n`;

      for (const step of phase.steps) {
        doc += `${stepNumber}. ${step}\n`;
        stepNumber++;
      }

      doc += '\n';
    }

    // Breaking changes detail
    if (this.changeCategories.breaking.length > 0) {
      doc += '## Breaking Changes Detail\n\n';

      for (const change of this.changeCategories.breaking) {
        doc += `### ${change.description}\n\n`;
        doc += `**Impact**: ${change.impact}\n\n`;
        doc += `**Mitigation**: ${change.mitigation}\n\n`;
      }
    }

    // Rollback plan
    if (this.config.output.includeRollback) {
      doc += '## Rollback Plan\n\n';
      doc += 'If issues occur during migration:\n\n';
      doc += '1. Stop all services immediately\n';
      doc += '2. Restore database backup\n';
      doc += '3. Revert to previous application version\n';
      doc += '4. Restart services\n';
      doc += '5. Verify system functionality\n';
      doc += '6. Notify stakeholders\n\n';
    }

    // Validation checklist
    if (this.config.output.includeValidation) {
      doc += '## Post-Migration Validation\n\n';
      doc += '- [ ] All services running\n';
      doc += '- [ ] Database accessible\n';
      doc += '- [ ] API endpoints responding\n';
      doc += '- [ ] User authentication working\n';
      doc += '- [ ] Critical workflows functional\n';
      doc += '- [ ] No error logs\n';
      doc += '- [ ] Performance metrics normal\n\n';
    }

    doc += '---\n\n';
    doc +=
      '*This migration guide was automatically generated by the SSOT system.*\n';

    return doc;
  }

  estimateMigrationTime() {
    let minutes = 5; // Base time

    // Add time for each category
    minutes += this.changeCategories.database.length * 5;
    minutes += this.changeCategories.dependencies.length * 3;
    minutes += this.changeCategories.configuration.length * 2;
    minutes += this.changeCategories.api.length * 2;
    minutes += this.changeCategories.breaking.length * 10;

    return Math.max(minutes, 10); // Minimum 10 minutes
  }

  async generateJsonDoc() {
    return JSON.stringify(
      {
        version: this.version,
        generated: new Date().toISOString(),
        summary: {
          totalChanges: Object.values(this.changeCategories).flat().length,
          categories: Object.fromEntries(
            Object.entries(this.changeCategories).map(([k, v]) => [k, v.length])
          ),
          estimatedDuration: this.estimateMigrationTime() + 25,
          requiresDowntime: Object.values(this.changeCategories)
            .flat()
            .some(c => c.requiresDowntime),
          riskLevel: Object.values(this.changeCategories)
            .flat()
            .some(c => c.impact === 'high')
            ? 'high'
            : 'medium',
        },
        changes: this.changeCategories,
        migrationSteps: this.generateMigrationSteps(),
      },
      null,
      2
    );
  }

  async generateHtmlDoc() {
    const markdownContent = await this.generateMarkdownDoc();

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Migration Guide - ${this.version}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .risk-high { background: #ffe7e7; padding: 10px; border-left: 4px solid #ff6b6b; margin: 10px 0; }
        .risk-medium { background: #fff4e6; padding: 10px; border-left: 4px solid #ffa726; margin: 10px 0; }
        .downtime { background: #e7f3ff; padding: 10px; border-left: 4px solid #2196f3; margin: 10px 0; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .checklist { list-style-type: none; }
        .checklist li:before { content: "☐ "; }
        ol li { margin: 5px 0; }
    </style>
</head>
<body>
    ${markdownContent
      .replace(/\n/g, '<br>')
      .replace(/### /g, '<h3>')
      .replace(/## /g, '<h2>')
      .replace(/# /g, '<h1>')
      .replace(
        /🔴 \*\*HIGH RISK\*\*/g,
        '<div class="risk-high">🔴 <strong>HIGH RISK</strong>'
      )
      .replace(
        /🟡 \*\*MEDIUM RISK\*\*/g,
        '<div class="risk-medium">🟡 <strong>MEDIUM RISK</strong>'
      )
      .replace(
        /⏰ \*\*DOWNTIME REQUIRED\*\*/g,
        '<div class="downtime">⏰ <strong>DOWNTIME REQUIRED</strong>'
      )
      .replace(/- \[ \]/g, '<li class="checklist">')}
</body>
</html>
    `;
  }

  async saveMigrationDoc(content, format) {
    const outputDir = this.config.output.directory;

    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    const timestamp = new Date().toISOString().split('T')[0];
    let filename, extension;

    switch (format) {
      case 'markdown':
        filename = `migration-${this.version}-${timestamp}.md`;
        break;
      case 'json':
        filename = `migration-${this.version}-${timestamp}.json`;
        break;
      case 'html':
        filename = `migration-${this.version}-${timestamp}.html`;
        break;
    }

    const filePath = path.join(outputDir, filename);

    if (!this.dryRun) {
      await fs.writeFile(filePath, content);
    }

    await this.log(
      `✓ ${format.toUpperCase()} migration guide saved: ${filePath}`,
      'success'
    );
    return filePath;
  }

  async generate() {
    await this.log('Starting migration documentation generation...');

    try {
      // Detect all changes
      await this.detectChanges();

      // Check if any changes exist
      const totalChanges = Object.values(this.changeCategories).flat().length;
      if (totalChanges === 0) {
        await this.log(
          'No changes detected - skipping migration guide generation',
          'info'
        );
        return { outputs: [], summary: { totalChanges: 0 } };
      }

      // Generate documentation in requested formats
      const outputs = [];

      if (
        this.config.output.format === 'markdown' ||
        this.config.output.format === 'all'
      ) {
        const markdown = await this.generateMarkdownDoc();
        const path = await this.saveMigrationDoc(markdown, 'markdown');
        outputs.push({ format: 'markdown', path });
      }

      if (
        this.config.output.format === 'json' ||
        this.config.output.format === 'all'
      ) {
        const json = await this.generateJsonDoc();
        const path = await this.saveMigrationDoc(json, 'json');
        outputs.push({ format: 'json', path });
      }

      if (
        this.config.output.format === 'html' ||
        this.config.output.format === 'all'
      ) {
        const html = await this.generateHtmlDoc();
        const path = await this.saveMigrationDoc(html, 'html');
        outputs.push({ format: 'html', path });
      }

      await this.log(
        '✓ Migration documentation generation completed',
        'success'
      );

      return {
        outputs,
        summary: {
          totalChanges,
          categories: Object.fromEntries(
            Object.entries(this.changeCategories).map(([k, v]) => [k, v.length])
          ),
          estimatedDuration: this.estimateMigrationTime() + 25,
          requiresDowntime: Object.values(this.changeCategories)
            .flat()
            .some(c => c.requiresDowntime),
          riskLevel: Object.values(this.changeCategories)
            .flat()
            .some(c => c.impact === 'high')
            ? 'high'
            : 'medium',
        },
      };
    } catch (error) {
      await this.log(
        `✗ Migration documentation generation failed: ${error.message}`,
        'error'
      );
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
    version:
      args.find(arg => arg.startsWith('--version='))?.split('=')[1] || 'latest',
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    console.log(`
Migration Documentation Generator

Usage: node generate-migration-docs.js [options]

Options:
  --dry-run              Show what would be generated without creating files
  --verbose, -v          Show detailed output
  --version=X.Y.Z        Specify version for the migration guide
  --help, -h             Show this help message

Examples:
  node generate-migration-docs.js                    # Generate migration guide
  node generate-migration-docs.js --version=2.0.0    # Generate with specific version
  node generate-migration-docs.js --dry-run          # Preview what would be generated
    `);
    return;
  }

  try {
    const generator = new MigrationDocsGenerator(options);
    const result = await generator.generate();

    console.log(
      chalk.green('\n✓ Migration documentation generation completed!')
    );

    if (result.outputs.length > 0) {
      console.log(
        `\nGenerated formats: ${result.outputs.map(o => o.format).join(', ')}`
      );
      console.log(`\nSummary:`);
      console.log(`  Total changes: ${result.summary.totalChanges}`);
      console.log(
        `  Estimated duration: ${result.summary.estimatedDuration} minutes`
      );
      console.log(`  Risk level: ${result.summary.riskLevel}`);
      console.log(
        `  Requires downtime: ${result.summary.requiresDowntime ? 'Yes' : 'No'}`
      );

      if (result.summary.riskLevel === 'high') {
        console.log(
          chalk.yellow(
            '\n⚠️  High risk migration detected - review carefully before proceeding'
          )
        );
      }
    } else {
      console.log('\nNo changes detected - no migration guide needed');
    }
  } catch (error) {
    console.error(
      chalk.red(
        `\n✗ Migration documentation generation failed: ${error.message}`
      )
    );
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { MigrationDocsGenerator };
