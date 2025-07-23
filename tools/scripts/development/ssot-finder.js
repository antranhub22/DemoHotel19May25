#!/usr/bin/env node

/**
 * SSOT Finder - Interactive script to find SSOT files
 * Helps developers locate primary and secondary files for changes
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

class SSOTFinder {
  constructor() {
    this.registry = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async loadRegistry() {
    try {
      const registryPath = path.join(
        process.cwd(),
        'config/ssot-registry.json'
      );
      const content = await fs.readFile(registryPath, 'utf8');
      this.registry = JSON.parse(content);
      console.log(chalk.green('✓ SSOT Registry loaded successfully'));
    } catch (error) {
      console.error(
        chalk.red('✗ Failed to load SSOT registry:', error.message)
      );
      process.exit(1);
    }
  }

  displayWelcome() {
    console.log(chalk.blue.bold('\n🔍 SSOT Finder - Hotel Management System'));
    console.log(chalk.gray('Find the right files to change for your task\n'));

    console.log(chalk.yellow('Available search methods:'));
    console.log('1. Search by keyword');
    console.log('2. Browse by category');
    console.log('3. Show change scenarios');
    console.log('4. Validate SSOT consistency');
    console.log('5. Show automation commands');
    console.log('6. Exit\n');
  }

  async promptUser(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }

  async searchByKeyword() {
    const keyword = await this.promptUser(
      chalk.cyan('Enter keyword to search: ')
    );

    if (!keyword) {
      console.log(chalk.red('Please enter a keyword'));
      return;
    }

    console.log(chalk.blue(`\n🔍 Searching for "${keyword}"...\n`));

    const results = this.findInRegistry(keyword.toLowerCase());

    if (results.length === 0) {
      console.log(chalk.yellow('No matches found. Try a different keyword.'));
      return;
    }

    this.displaySearchResults(results, keyword);
  }

  findInRegistry(keyword) {
    const results = [];

    const searchObject = (obj, path = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string') {
          if (
            value.toLowerCase().includes(keyword) ||
            key.toLowerCase().includes(keyword)
          ) {
            results.push({
              path: currentPath,
              type: 'value',
              content: value,
              key: key,
            });
          }
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (
              typeof item === 'string' &&
              item.toLowerCase().includes(keyword)
            ) {
              results.push({
                path: `${currentPath}[${index}]`,
                type: 'array_item',
                content: item,
                key: key,
              });
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          searchObject(value, currentPath);
        }
      }
    };

    searchObject(this.registry);
    return results;
  }

  displaySearchResults(results, keyword) {
    console.log(
      chalk.green(`Found ${results.length} matches for "${keyword}":\n`)
    );

    results.forEach((result, index) => {
      console.log(chalk.blue(`${index + 1}. ${result.path}`));
      console.log(chalk.gray(`   ${result.content}`));
      console.log();
    });

    this.showRelatedFiles(results);
  }

  async showRelatedFiles(results) {
    if (results.length === 0) return;

    const choice = await this.promptUser(
      chalk.cyan(
        'Enter number to see related files (or press Enter to continue): '
      )
    );

    if (!choice) return;

    const index = parseInt(choice) - 1;
    if (index >= 0 && index < results.length) {
      const result = results[index];
      this.displayRelatedFiles(result);
    }
  }

  displayRelatedFiles(result) {
    const pathParts = result.path.split('.');
    let current = this.registry;

    // Navigate to the parent object
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
      if (!current) return;
    }

    console.log(chalk.green(`\n📁 Related files for "${result.path}":\n`));

    if (current.primary) {
      console.log(chalk.blue('PRIMARY (main file to change):'));
      console.log(chalk.white(`  ${current.primary}`));
    }

    if (current.secondary && Array.isArray(current.secondary)) {
      console.log(chalk.yellow('\nSECONDARY (files to update after):'));
      current.secondary.forEach(file => {
        console.log(chalk.white(`  ${file}`));
      });
    }

    if (current.automation) {
      console.log(chalk.green('\n🤖 AUTOMATION COMMANDS:'));
      Object.entries(current.automation).forEach(([key, command]) => {
        console.log(chalk.cyan(`  ${key}: `) + chalk.white(command));
      });
    }

    if (current.description) {
      console.log(chalk.gray(`\n📝 ${current.description}`));
    }

    console.log();
  }

  async browseByCategory() {
    const categories = Object.keys(this.registry).filter(
      key => key !== 'meta' && key !== 'change_scenarios'
    );

    console.log(chalk.blue('\n📂 Available categories:\n'));
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category}`);
    });

    const choice = await this.promptUser(
      chalk.cyan('\nSelect category number: ')
    );
    const categoryIndex = parseInt(choice) - 1;

    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      const category = categories[categoryIndex];
      this.displayCategory(category);
    } else {
      console.log(chalk.red('Invalid selection'));
    }
  }

  displayCategory(categoryName) {
    const category = this.registry[categoryName];

    console.log(chalk.blue(`\n📂 ${categoryName.toUpperCase()} Category:\n`));

    Object.entries(category).forEach(([subKey, subValue]) => {
      console.log(chalk.green(`${subKey}:`));

      if (subValue.primary) {
        console.log(chalk.white(`  Primary: ${subValue.primary}`));
      }

      if (subValue.secondary) {
        console.log(
          chalk.yellow(`  Secondary: ${subValue.secondary.join(', ')}`)
        );
      }

      if (subValue.description) {
        console.log(chalk.gray(`  Description: ${subValue.description}`));
      }

      if (subValue.automation) {
        console.log(
          chalk.cyan(
            `  Automation: ${Object.keys(subValue.automation).join(', ')}`
          )
        );
      }

      console.log();
    });
  }

  async showChangeScenarios() {
    const scenarios = this.registry.change_scenarios;

    if (!scenarios) {
      console.log(chalk.yellow('No change scenarios defined'));
      return;
    }

    console.log(chalk.blue('\n🔄 Common Change Scenarios:\n'));

    Object.entries(scenarios).forEach(([scenario, details], index) => {
      console.log(`${index + 1}. ${scenario.replace(/_/g, ' ').toUpperCase()}`);
    });

    const choice = await this.promptUser(
      chalk.cyan('\nSelect scenario number for details: ')
    );
    const scenarioKeys = Object.keys(scenarios);
    const scenarioIndex = parseInt(choice) - 1;

    if (scenarioIndex >= 0 && scenarioIndex < scenarioKeys.length) {
      const scenarioKey = scenarioKeys[scenarioIndex];
      this.displayChangeScenario(scenarioKey, scenarios[scenarioKey]);
    }
  }

  displayChangeScenario(scenarioName, scenario) {
    console.log(
      chalk.blue(`\n🔄 ${scenarioName.replace(/_/g, ' ').toUpperCase()}:\n`)
    );

    console.log(chalk.green('PRIMARY CHANGE:'));
    console.log(chalk.white(`  ${scenario.primary_change}`));

    if (scenario.secondary_updates) {
      console.log(chalk.yellow('\nSECONDARY UPDATES:'));
      scenario.secondary_updates.forEach(update => {
        console.log(chalk.white(`  • ${update}`));
      });
    }

    if (scenario.automation_flow) {
      console.log(chalk.cyan('\n🤖 AUTOMATION FLOW:'));
      scenario.automation_flow.forEach((command, index) => {
        console.log(chalk.white(`  ${index + 1}. ${command}`));
      });
    }

    console.log();
  }

  async validateSSotConsistency() {
    console.log(chalk.blue('\n🔍 Running SSOT consistency validation...\n'));

    try {
      const { execSync } = require('child_process');
      const output = execSync('npm run validate:ssot', {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      console.log(chalk.green('✓ SSOT validation completed successfully'));
      console.log(output);
    } catch (error) {
      console.log(chalk.red('✗ SSOT validation failed:'));
      console.log(error.stdout || error.message);
    }
  }

  async showAutomationCommands() {
    console.log(chalk.blue('\n🤖 Available Automation Commands:\n'));

    const commands = [
      {
        name: 'generate:types',
        description: 'Generate TypeScript types from database schema',
      },
      {
        name: 'generate:api-docs',
        description: 'Generate API documentation from routes',
      },
      { name: 'validate:ssot', description: 'Validate SSOT consistency' },
      { name: 'validate:runtime', description: 'Run runtime validation' },
      {
        name: 'check:breaking-changes',
        description: 'Check for breaking changes',
      },
      {
        name: 'generate:migration-guide',
        description: 'Generate migration guide',
      },
      {
        name: 'generate:migration-docs',
        description: 'Generate migration documentation',
      },
      { name: 'update:dependencies', description: 'Update dependent files' },
      {
        name: 'sync:changes',
        description: 'Sync changes between environments',
      },
      {
        name: 'watch:ssot',
        description: 'Start file watcher for auto-updates',
      },
      {
        name: 'generate:changelog',
        description: 'Generate changelog from git commits',
      },
      {
        name: 'update:readme',
        description: 'Update README from codebase analysis',
      },
    ];

    commands.forEach((cmd, index) => {
      console.log(chalk.cyan(`${index + 1}. npm run ${cmd.name}`));
      console.log(chalk.gray(`   ${cmd.description}`));
      console.log();
    });

    const choice = await this.promptUser(
      chalk.cyan('Enter command number to run (or press Enter to continue): ')
    );

    if (choice) {
      const cmdIndex = parseInt(choice) - 1;
      if (cmdIndex >= 0 && cmdIndex < commands.length) {
        await this.runCommand(commands[cmdIndex].name);
      }
    }
  }

  async runCommand(commandName) {
    console.log(chalk.blue(`\n🚀 Running: npm run ${commandName}\n`));

    try {
      const { execSync } = require('child_process');
      const output = execSync(`npm run ${commandName}`, {
        encoding: 'utf8',
        stdio: 'inherit',
      });
    } catch (error) {
      console.log(chalk.red(`\n✗ Command failed: ${error.message}`));
    }
  }

  async showImpact(filePath) {
    console.log(chalk.blue(`\n📊 Impact analysis for: ${filePath}\n`));

    const impactedFiles = new Set();

    // Search for files that reference this path
    const searchInRegistry = (obj, targetPath) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.includes(targetPath)) {
          impactedFiles.add(`${key}: ${value}`);
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string' && item.includes(targetPath)) {
              impactedFiles.add(`${key}: ${item}`);
            }
          });
        } else if (typeof value === 'object' && value !== null) {
          searchInRegistry(value, targetPath);
        }
      }
    };

    searchInRegistry(this.registry, filePath);

    if (impactedFiles.size === 0) {
      console.log(chalk.yellow('No direct impacts found in SSOT registry'));
    } else {
      console.log(chalk.green('Files that may be impacted:'));
      Array.from(impactedFiles).forEach(file => {
        console.log(chalk.white(`  • ${file}`));
      });
    }

    console.log(chalk.cyan('\n💡 Recommended actions:'));
    console.log(chalk.white('  1. Run: npm run validate:ssot'));
    console.log(chalk.white('  2. Run: npm run check:breaking-changes'));
    console.log(chalk.white('  3. Update secondary files as needed'));
    console.log();
  }

  async run() {
    await this.loadRegistry();

    while (true) {
      this.displayWelcome();

      const choice = await this.promptUser(
        chalk.cyan('Select an option (1-6): ')
      );

      switch (choice) {
        case '1':
          await this.searchByKeyword();
          break;
        case '2':
          await this.browseByCategory();
          break;
        case '3':
          await this.showChangeScenarios();
          break;
        case '4':
          await this.validateSSotConsistency();
          break;
        case '5':
          await this.showAutomationCommands();
          break;
        case '6':
          console.log(chalk.green('\nGoodbye! 👋'));
          this.rl.close();
          return;
        default:
          console.log(chalk.red('Invalid choice. Please select 1-6.'));
      }

      await this.promptUser(chalk.gray('\nPress Enter to continue...'));
      console.clear();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SSOT Finder - Interactive Tool

Usage: node scripts/ssot-finder.js [options]

Options:
  --help, -h     Show this help message
  --keyword=X    Search for specific keyword
  --category=X   Show specific category
  --impact=FILE  Show impact analysis for file

Examples:
  node scripts/ssot-finder.js                    # Interactive mode
  node scripts/ssot-finder.js --keyword=api      # Search for "api"
  node scripts/ssot-finder.js --category=database # Show database category
  node scripts/ssot-finder.js --impact=schema.ts # Show impact for schema.ts
    `);
    return;
  }

  const finder = new SSOTFinder();
  await finder.loadRegistry();

  // Handle non-interactive commands
  const keywordArg = args.find(arg => arg.startsWith('--keyword='));
  const categoryArg = args.find(arg => arg.startsWith('--category='));
  const impactArg = args.find(arg => arg.startsWith('--impact='));

  if (keywordArg) {
    const keyword = keywordArg.split('=')[1];
    const results = finder.findInRegistry(keyword.toLowerCase());
    finder.displaySearchResults(results, keyword);
    finder.rl.close();
    return;
  }

  if (categoryArg) {
    const category = categoryArg.split('=')[1];
    finder.displayCategory(category);
    finder.rl.close();
    return;
  }

  if (impactArg) {
    const filePath = impactArg.split('=')[1];
    await finder.showImpact(filePath);
    finder.rl.close();
    return;
  }

  // Interactive mode
  await finder.run();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

module.exports = { SSOTFinder };
