#!/usr/bin/env node

/**
 * SSOT Changelog Generator
 * Automatically generates changelogs from git commits, schema changes, and breaking changes
 * Provides formatted output for different audiences (developers, users, stakeholders)
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const { z } = require('zod');

// Configuration schema
const ChangelogConfigSchema = z.object({
  output: z.object({
    format: z.enum(['markdown', 'json', 'html', 'all']).default('markdown'),
    outputDir: z.string().default('./docs'),
    filename: z.string().default('CHANGELOG.md')
  }),
  git: z.object({
    since: z.string().optional(),
    until: z.string().optional(),
    includeAuthors: z.boolean().default(true),
    includePRs: z.boolean().default(true)
  }),
  categories: z.array(z.object({
    name: z.string(),
    keywords: z.array(z.string()),
    description: z.string(),
    emoji: z.string().optional()
  })).default([
    { name: 'Breaking Changes', keywords: ['breaking', 'BREAKING'], description: 'Changes that break existing functionality', emoji: '🚨' },
    { name: 'Features', keywords: ['feat', 'feature', 'add'], description: 'New features and functionality', emoji: '✨' },
    { name: 'Bug Fixes', keywords: ['fix', 'bug', 'patch'], description: 'Bug fixes and corrections', emoji: '🐛' },
    { name: 'Performance', keywords: ['perf', 'performance', 'optimize'], description: 'Performance improvements', emoji: '⚡' },
    { name: 'Documentation', keywords: ['docs', 'doc', 'documentation'], description: 'Documentation changes', emoji: '📚' },
    { name: 'Refactoring', keywords: ['refactor', 'cleanup', 'restructure'], description: 'Code refactoring and cleanup', emoji: '♻️' },
    { name: 'Dependencies', keywords: ['deps', 'dependency', 'update'], description: 'Dependency updates', emoji: '📦' },
    { name: 'Configuration', keywords: ['config', 'configuration', 'setup'], description: 'Configuration changes', emoji: '⚙️' },
    { name: 'Database', keywords: ['db', 'database', 'schema', 'migration'], description: 'Database and schema changes', emoji: '🗄️' },
    { name: 'API', keywords: ['api', 'endpoint', 'route'], description: 'API changes and updates', emoji: '🔌' }
  ]),
  versioning: z.object({
    enabled: z.boolean().default(true),
    format: z.enum(['semver', 'date', 'custom']).default('semver'),
    autoIncrement: z.boolean().default(false)
  }),
  templates: z.object({
    header: z.string().optional(),
    footer: z.string().optional(),
    entryFormat: z.string().optional()
  })
});

class ChangelogGenerator {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.version = options.version || null;
    
    this.logFile = path.join(process.cwd(), 'changelog-generation.log');
    this.changes = new Map();
    this.breakingChanges = [];
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'changelog.config.json');
      const configData = require(configPath);
      return ChangelogConfigSchema.parse(configData);
    } catch (error) {
      // Return default configuration
      return ChangelogConfigSchema.parse({});
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
      case 'error': return chalk.red(message);
      case 'warn': return chalk.yellow(message);
      case 'success': return chalk.green(message);
      case 'info': return chalk.blue(message);
      default: return message;
    }
  }

  async getGitCommits() {
    await this.log('Fetching git commits...');
    
    let gitCommand = 'git log --oneline --no-merges';
    
    if (this.config.git.since) {
      gitCommand += ` --since="${this.config.git.since}"`;
    }
    
    if (this.config.git.until) {
      gitCommand += ` --until="${this.config.git.until}"`;
    }
    
    if (this.config.git.includeAuthors) {
      gitCommand = gitCommand.replace('--oneline', '--pretty=format:"%h|%s|%an|%ad"');
    }
    
    try {
      const output = execSync(gitCommand, { encoding: 'utf8' });
      const commits = output.split('\n').filter(line => line.trim());
      
      await this.log(`Found ${commits.length} commits`);
      return commits.map(commit => this.parseCommit(commit));
    } catch (error) {
      await this.log(`Error fetching commits: ${error.message}`, 'error');
      return [];
    }
  }

  parseCommit(commitLine) {
    const parts = commitLine.split('|');
    
    if (parts.length >= 2) {
      return {
        hash: parts[0],
        message: parts[1],
        author: parts[2] || 'Unknown',
        date: parts[3] || new Date().toISOString(),
        category: this.categorizeCommit(parts[1]),
        isBreaking: this.isBreakingChange(parts[1])
      };
    }
    
    // Fallback for simple format
    const [hash, ...messageParts] = commitLine.split(' ');
    const message = messageParts.join(' ');
    
    return {
      hash,
      message,
      author: 'Unknown',
      date: new Date().toISOString(),
      category: this.categorizeCommit(message),
      isBreaking: this.isBreakingChange(message)
    };
  }

  categorizeCommit(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const category of this.config.categories) {
      for (const keyword of category.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return category.name;
        }
      }
    }
    
    return 'Other';
  }

  isBreakingChange(message) {
    const breakingKeywords = ['breaking', 'breaking change', 'breaking:', 'BREAKING'];
    return breakingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  async getSchemaChanges() {
    await this.log('Detecting schema changes...');
    
    try {
      // Check for schema file changes
      const schemaChanges = [];
      const schemaFiles = [
        'packages/shared/db/schema.ts',
        'schemas/dashboard-schema.json',
        'schemas/api-schema.json'
      ];
      
      for (const file of schemaFiles) {
        try {
          const status = execSync(`git status --porcelain "${file}"`, { 
            encoding: 'utf8' 
          }).trim();
          
          if (status) {
            const changeType = status.substring(0, 2);
            schemaChanges.push({
              file,
              type: this.parseGitStatus(changeType),
              details: await this.getFileChanges(file)
            });
          }
        } catch {
          // File doesn't exist or no changes
        }
      }
      
      return schemaChanges;
    } catch (error) {
      await this.log(`Error detecting schema changes: ${error.message}`, 'warn');
      return [];
    }
  }

  parseGitStatus(status) {
    switch (status) {
      case 'M ': return 'modified';
      case 'A ': return 'added';
      case 'D ': return 'deleted';
      case 'R ': return 'renamed';
      case '??': return 'untracked';
      default: return 'unknown';
    }
  }

  async getFileChanges(file) {
    try {
      const diff = execSync(`git diff HEAD -- "${file}"`, { 
        encoding: 'utf8' 
      });
      
      const lines = diff.split('\n');
      const additions = lines.filter(line => line.startsWith('+')).length;
      const deletions = lines.filter(line => line.startsWith('-')).length;
      
      return {
        additions,
        deletions,
        changes: additions + deletions
      };
    } catch {
      return { additions: 0, deletions: 0, changes: 0 };
    }
  }

  async detectBreakingChanges() {
    await this.log('Detecting breaking changes...');
    
    try {
      // Run breaking changes detection script
      const output = execSync('node scripts/check-breaking-changes.js --check-only', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      const result = JSON.parse(output);
      return result.breakingChanges || [];
    } catch (error) {
      await this.log(`Could not detect breaking changes: ${error.message}`, 'warn');
      return [];
    }
  }

  async getCurrentVersion() {
    try {
      const packageJson = JSON.parse(
        await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8')
      );
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  async getNextVersion(currentVersion, hasBreaking = false) {
    if (this.version) {
      return this.version;
    }
    
    if (!this.config.versioning.autoIncrement) {
      return currentVersion;
    }
    
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    if (hasBreaking) {
      return `${major + 1}.0.0`;
    } else if (this.changes.has('Features')) {
      return `${major}.${minor + 1}.0`;
    } else {
      return `${major}.${minor}.${patch + 1}`;
    }
  }

  async organizeChanges(commits) {
    await this.log('Organizing changes by category...');
    
    // Group commits by category
    for (const commit of commits) {
      if (!this.changes.has(commit.category)) {
        this.changes.set(commit.category, []);
      }
      this.changes.get(commit.category).push(commit);
      
      if (commit.isBreaking) {
        this.breakingChanges.push(commit);
      }
    }
    
    // Sort categories by importance
    const sortedCategories = Array.from(this.changes.keys()).sort((a, b) => {
      const categoryOrder = this.config.categories.map(c => c.name);
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      
      return aIndex - bIndex;
    });
    
    const organizedChanges = new Map();
    for (const category of sortedCategories) {
      organizedChanges.set(category, this.changes.get(category));
    }
    
    this.changes = organizedChanges;
  }

  async generateMarkdownChangelog(version, schemaChanges) {
    await this.log('Generating markdown changelog...');
    
    let markdown = '';
    
    // Header
    if (this.config.templates.header) {
      markdown += this.config.templates.header + '\n\n';
    } else {
      markdown += '# Changelog\n\n';
      markdown += 'All notable changes to this project will be documented in this file.\n\n';
    }
    
    // Version header
    const versionDate = new Date().toISOString().split('T')[0];
    markdown += `## [${version}] - ${versionDate}\n\n`;
    
    // Breaking changes section (if any)
    if (this.breakingChanges.length > 0) {
      markdown += '### 🚨 BREAKING CHANGES\n\n';
      for (const change of this.breakingChanges) {
        markdown += `- **${change.message}** (${change.hash})\n`;
        if (this.config.git.includeAuthors) {
          markdown += `  - Author: ${change.author}\n`;
        }
      }
      markdown += '\n';
    }
    
    // Schema changes section
    if (schemaChanges.length > 0) {
      markdown += '### 🗄️ Schema Changes\n\n';
      for (const change of schemaChanges) {
        markdown += `- **${change.file}**: ${change.type}\n`;
        if (change.details.changes > 0) {
          markdown += `  - +${change.details.additions} -${change.details.deletions} lines\n`;
        }
      }
      markdown += '\n';
    }
    
    // Changes by category
    for (const [category, commits] of this.changes) {
      const categoryConfig = this.config.categories.find(c => c.name === category);
      const emoji = categoryConfig?.emoji || '';
      const sectionTitle = `### ${emoji} ${category}`;
      
      markdown += `${sectionTitle}\n\n`;
      
      for (const commit of commits) {
        markdown += `- ${commit.message}`;
        
        if (this.config.git.includeAuthors) {
          markdown += ` (by ${commit.author})`;
        }
        
        markdown += ` (${commit.hash})\n`;
      }
      
      markdown += '\n';
    }
    
    // Footer
    if (this.config.templates.footer) {
      markdown += '\n' + this.config.templates.footer;
    }
    
    return markdown;
  }

  async generateJsonChangelog(version, schemaChanges) {
    return JSON.stringify({
      version,
      date: new Date().toISOString(),
      breakingChanges: this.breakingChanges,
      schemaChanges,
      changes: Object.fromEntries(this.changes),
      summary: {
        totalCommits: Array.from(this.changes.values()).flat().length,
        categoriesCount: this.changes.size,
        hasBreakingChanges: this.breakingChanges.length > 0,
        hasSchemaChanges: schemaChanges.length > 0
      }
    }, null, 2);
  }

  async generateHtmlChangelog(version, schemaChanges) {
    const markdownContent = await this.generateMarkdownChangelog(version, schemaChanges);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Changelog - ${version}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .breaking { background: #ffe7e7; padding: 10px; border-left: 4px solid #ff6b6b; margin: 10px 0; }
        .schema { background: #e7f3ff; padding: 10px; border-left: 4px solid #339af0; margin: 10px 0; }
        code { background: #f5f5f5; padding: 2px 4px; border-radius: 3px; }
        .meta { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    ${markdownContent.replace(/\n/g, '<br>').replace(/### /g, '<h3>').replace(/## /g, '<h2>').replace(/# /g, '<h1>')}
</body>
</html>
    `;
  }

  async saveChangelog(content, format, version) {
    const outputDir = this.config.output.outputDir;
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
    } catch {
      // Directory already exists
    }
    
    let filename, extension;
    switch (format) {
      case 'markdown':
        filename = this.config.output.filename;
        extension = '.md';
        break;
      case 'json':
        filename = `changelog-${version}.json`;
        extension = '.json';
        break;
      case 'html':
        filename = `changelog-${version}.html`;
        extension = '.html';
        break;
    }
    
    if (!filename.endsWith(extension)) {
      filename = filename.replace(/\.[^.]*$/, '') + extension;
    }
    
    const filePath = path.join(outputDir, filename);
    
    if (!this.dryRun) {
      await fs.writeFile(filePath, content);
    }
    
    await this.log(`✓ ${format.toUpperCase()} changelog saved: ${filePath}`, 'success');
    return filePath;
  }

  async generate() {
    await this.log('Starting changelog generation...');
    
    try {
      // Get data
      const commits = await this.getGitCommits();
      const schemaChanges = await this.getSchemaChanges();
      const breakingChanges = await this.detectBreakingChanges();
      
      // Merge breaking changes from different sources
      this.breakingChanges = [
        ...this.breakingChanges,
        ...breakingChanges.map(bc => ({
          message: bc.description || bc.message,
          hash: 'schema',
          author: 'System',
          date: new Date().toISOString(),
          category: 'Breaking Changes',
          isBreaking: true
        }))
      ];
      
      // Organize changes
      this.organizeChanges(commits);
      
      // Determine version
      const currentVersion = await this.getCurrentVersion();
      const hasBreaking = this.breakingChanges.length > 0 || breakingChanges.length > 0;
      const nextVersion = await this.getNextVersion(currentVersion, hasBreaking);
      
      // Generate outputs
      const outputs = [];
      
      if (this.config.output.format === 'markdown' || this.config.output.format === 'all') {
        const markdown = await this.generateMarkdownChangelog(nextVersion, schemaChanges);
        const path = await this.saveChangelog(markdown, 'markdown', nextVersion);
        outputs.push({ format: 'markdown', path });
      }
      
      if (this.config.output.format === 'json' || this.config.output.format === 'all') {
        const json = await this.generateJsonChangelog(nextVersion, schemaChanges);
        const path = await this.saveChangelog(json, 'json', nextVersion);
        outputs.push({ format: 'json', path });
      }
      
      if (this.config.output.format === 'html' || this.config.output.format === 'all') {
        const html = await this.generateHtmlChangelog(nextVersion, schemaChanges);
        const path = await this.saveChangelog(html, 'html', nextVersion);
        outputs.push({ format: 'html', path });
      }
      
      await this.log('✓ Changelog generation completed', 'success');
      
      return {
        version: nextVersion,
        outputs,
        summary: {
          commits: commits.length,
          categories: this.changes.size,
          breakingChanges: this.breakingChanges.length,
          schemaChanges: schemaChanges.length
        }
      };
      
    } catch (error) {
      await this.log(`✗ Changelog generation failed: ${error.message}`, 'error');
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
    version: args.find(arg => arg.startsWith('--version='))?.split('=')[1],
    help: args.includes('--help') || args.includes('-h')
  };
  
  if (options.help) {
    console.log(`
Changelog Generator Script

Usage: node generate-changelog.js [options]

Options:
  --dry-run              Show what would be generated without creating files
  --verbose, -v          Show detailed output
  --version=X.Y.Z        Specify version for the changelog
  --help, -h             Show this help message

Examples:
  node generate-changelog.js                    # Generate changelog with auto version
  node generate-changelog.js --version=2.0.0    # Generate with specific version
  node generate-changelog.js --dry-run          # Preview what would be generated
    `);
    return;
  }
  
  try {
    const generator = new ChangelogGenerator(options);
    const result = await generator.generate();
    
    console.log(chalk.green('\n✓ Changelog generation completed!'));
    console.log(`\nVersion: ${result.version}`);
    console.log(`Generated formats: ${result.outputs.map(o => o.format).join(', ')}`);
    console.log(`\nSummary:`);
    console.log(`  Commits: ${result.summary.commits}`);
    console.log(`  Categories: ${result.summary.categories}`);
    console.log(`  Breaking Changes: ${result.summary.breakingChanges}`);
    console.log(`  Schema Changes: ${result.summary.schemaChanges}`);
    
  } catch (error) {
    console.error(chalk.red(`\n✗ Changelog generation failed: ${error.message}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ChangelogGenerator }; 