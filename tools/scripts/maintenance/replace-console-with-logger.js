#!/usr/bin/env node

/**
 * Automated Console.log to Logger Replacement Script
 * Replaces console.log/error/warn with proper logger calls
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class ConsoleLogReplacer {
  constructor() {
    this.loggerImportAdded = new Set();
    this.replacementCount = 0;
    this.fileCount = 0;
  }

  // Add logger import if not present
  addLoggerImport(content, filePath) {
    if (content.includes("import { logger } from '@shared/utils/logger'")) {
      return content;
    }

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') && !lines[i].includes('type')) {
        lastImportIndex = i;
      }
    }

    if (lastImportIndex >= 0) {
      lines.splice(
        lastImportIndex + 1,
        0,
        "import { logger } from '@shared/utils/logger';"
      );
      this.loggerImportAdded.add(filePath);
      return lines.join('\n');
    }

    return content;
  }

  // Replace console statements with logger calls
  replaceConsoleStatements(content) {
    let newContent = content;
    let replacements = 0;

    // Replace console.log with logger.debug or logger.info
    newContent = newContent.replace(
      /console\.log\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\s*\)/g,
      (match, message, data) => {
        replacements++;
        if (data) {
          // Clean up the data parameter
          const cleanData = data.trim().replace(/,$/, '');
          return `logger.debug('${message}', 'Component', ${cleanData})`;
        } else {
          return `logger.debug('${message}', 'Component')`;
        }
      }
    );

    // Replace console.error with logger.error
    newContent = newContent.replace(
      /console\.error\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\s*\)/g,
      (match, message, data) => {
        replacements++;
        if (data) {
          const cleanData = data.trim().replace(/,$/, '');
          return `logger.error('${message}', 'Component', ${cleanData})`;
        } else {
          return `logger.error('${message}', 'Component')`;
        }
      }
    );

    // Replace console.warn with logger.warn
    newContent = newContent.replace(
      /console\.warn\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\s*\)/g,
      (match, message, data) => {
        replacements++;
        if (data) {
          const cleanData = data.trim().replace(/,$/, '');
          return `logger.warn('${message}', 'Component', ${cleanData})`;
        } else {
          return `logger.warn('${message}', 'Component')`;
        }
      }
    );

    // Replace console.info with logger.info
    newContent = newContent.replace(
      /console\.info\s*\(\s*['"`]([^'"`]*?)['"`]\s*(?:,\s*([^)]*))?\s*\)/g,
      (match, message, data) => {
        replacements++;
        if (data) {
          const cleanData = data.trim().replace(/,$/, '');
          return `logger.info('${message}', 'Component', ${cleanData})`;
        } else {
          return `logger.info('${message}', 'Component')`;
        }
      }
    );

    this.replacementCount += replacements;
    return newContent;
  }

  // Process a single file
  processFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;

      // Add logger import if needed
      content = this.addLoggerImport(content, filePath);

      // Replace console statements
      content = this.replaceConsoleStatements(content);

      // Only write if content changed
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        this.fileCount++;
        console.log(`✅ Processed: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  // Process all files
  async run() {
    console.log('🔄 Starting console.log to logger replacement...\n');

    const patterns = [
      'apps/client/src/**/*.tsx',
      'apps/client/src/**/*.ts',
      'apps/server/**/*.ts',
    ];

    for (const pattern of patterns) {
      const files = glob.sync(pattern, {
        ignore: [
          '**/node_modules/**',
          '**/dist/**',
          '**/build/**',
          '**/*.test.*',
          '**/*.spec.*',
        ],
      });

      console.log(`🔍 Processing ${files.length} files matching ${pattern}...`);

      for (const file of files) {
        this.processFile(file);
      }
    }

    console.log('\n📊 REPLACEMENT SUMMARY:');
    console.log(`✅ Files processed: ${this.fileCount}`);
    console.log(`✅ Console statements replaced: ${this.replacementCount}`);
    console.log(`✅ Logger imports added: ${this.loggerImportAdded.size}`);
    console.log('\n🎉 Console.log replacement completed!');
  }
}

// Run the replacer
if (require.main === module) {
  const replacer = new ConsoleLogReplacer();
  replacer.run().catch(console.error);
}

module.exports = ConsoleLogReplacer;
