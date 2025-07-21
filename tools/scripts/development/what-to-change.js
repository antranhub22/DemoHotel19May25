#!/usr/bin/env node

/**
 * What To Change - Interactive CLI tool
 * Guides developers through common change scenarios with step-by-step instructions
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

class ChangeWizard {
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
    } catch (error) {
      console.error(
        chalk.red('✗ Failed to load SSOT registry:', error.message)
      );
      process.exit(1);
    }
  }

  async promptUser(question) {
    return new Promise(resolve => {
      this.rl.question(question, answer => {
        resolve(answer.trim());
      });
    });
  }

  displayWelcome() {
    console.log(chalk.blue.bold('\n🧙‍♂️ Hotel Management Change Wizard'));
    console.log(
      chalk.gray('Let me guide you through making changes to the system\n')
    );
  }

  async askWhatToChange() {
    console.log(chalk.yellow('What do you want to change? Choose from:'));
    console.log(chalk.white('1. 🗄️  Database schema (add/modify tables)'));
    console.log(chalk.white('2. 🔌 API endpoints (add/modify routes)'));
    console.log(chalk.white('3. 🎨 Frontend components (UI changes)'));
    console.log(chalk.white('4. ⚙️  Configuration (environment, build)'));
    console.log(chalk.white('5. 📝 Documentation (update docs)'));
    console.log(chalk.white('6. 🔄 Data migration (breaking changes)'));
    console.log(chalk.white('7. 🏨 Hotel-specific features'));
    console.log(chalk.white('8. 🔐 Authentication & permissions'));
    console.log(chalk.white('9. 📊 Analytics & reporting'));
    console.log(chalk.white('10. 🎙️ Voice assistant features'));
    console.log(chalk.white('11. Exit\n'));

    const choice = await this.promptUser(chalk.cyan('Select option (1-11): '));
    return parseInt(choice);
  }

  async handleDatabaseChange() {
    console.log(chalk.blue('\n🗄️ Database Schema Changes\n'));

    console.log(chalk.yellow('What kind of database change?'));
    console.log('1. Add new table');
    console.log('2. Modify existing table');
    console.log('3. Remove table (breaking change)');
    console.log('4. Add/modify relationships');
    console.log('5. Update constraints or indexes\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Step-by-step guide:\n'));

    console.log(chalk.blue('PRIMARY FILE TO CHANGE:'));
    console.log(chalk.white('  packages/shared/db/schema.ts'));

    console.log(chalk.yellow('\nAUTOMATION STEPS:'));
    console.log(chalk.white('  1. Make your changes to schema.ts'));
    console.log(
      chalk.white(
        '  2. npm run generate:types           # Generate new TypeScript types'
      )
    );
    console.log(
      chalk.white(
        '  3. npm run check:breaking-changes   # Check for breaking changes'
      )
    );

    if (subChoice === '3') {
      console.log(
        chalk.red(
          '  4. npm run generate:migration-guide # REQUIRED for breaking changes'
        )
      );
    }

    console.log(
      chalk.white(
        '  4. npm run validate:ssot            # Validate all consistency'
      )
    );

    console.log(chalk.yellow('\nSECONDARY FILES TO UPDATE:'));
    console.log(chalk.white('  • tools/migrations/[new-migration].sql'));
    console.log(
      chalk.white('  • packages/shared/types/core.ts (auto-generated)')
    );
    console.log(
      chalk.white('  • schemas/dashboard-schema.json (if UI changes needed)')
    );

    if (subChoice === '1' || subChoice === '2') {
      console.log(chalk.yellow('\nIF ADDING NEW API ENDPOINTS:'));
      console.log(chalk.white('  • apps/server/routes/[relevant-route].ts'));
      console.log(
        chalk.white('  • apps/client/src/services/[relevant-service].ts')
      );
      console.log(chalk.white('  • npm run generate:api-docs'));
    }

    await this.showTestingChecklist([
      'Database migration',
      'Type checking',
      'API endpoints',
    ]);
  }

  async handleApiChange() {
    console.log(chalk.blue('\n🔌 API Endpoint Changes\n'));

    console.log(chalk.yellow('What kind of API change?'));
    console.log('1. Add new endpoint');
    console.log('2. Modify existing endpoint');
    console.log('3. Remove endpoint (breaking change)');
    console.log('4. Change request/response format');
    console.log('5. Add authentication to endpoint\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Step-by-step guide:\n'));

    console.log(chalk.blue('PRIMARY FILE TO CHANGE:'));
    console.log(
      chalk.white('  apps/server/routes/[choose appropriate route file]')
    );
    console.log(chalk.gray('    • auth.ts - Authentication routes'));
    console.log(chalk.gray('    • calls.ts - Call management'));
    console.log(chalk.gray('    • orders.ts - Order/request management'));
    console.log(chalk.gray('    • analytics.ts - Analytics endpoints'));
    console.log(chalk.gray('    • dashboard.ts - Dashboard data'));

    console.log(chalk.yellow('\nAUTOMATION STEPS:'));
    console.log(chalk.white('  1. Make your changes to the route file'));
    console.log(
      chalk.white(
        '  2. npm run generate:api-docs         # Update API documentation'
      )
    );
    console.log(
      chalk.white(
        '  3. npm run validate:runtime --api    # Validate API schema'
      )
    );

    if (subChoice === '3' || subChoice === '4') {
      console.log(
        chalk.red(
          '  4. npm run check:breaking-changes    # REQUIRED for breaking changes'
        )
      );
    }

    console.log(chalk.yellow('\nSECONDARY FILES TO UPDATE:'));
    console.log(
      chalk.white(
        '  • schemas/api-schema.json (if request/response format changes)'
      )
    );
    console.log(
      chalk.white('  • packages/shared/types/api.ts (auto-generated)')
    );
    console.log(
      chalk.white('  • apps/client/src/services/[relevant-service].ts')
    );
    console.log(chalk.white('  • docs/API_DOCUMENTATION.md (auto-generated)'));

    await this.showTestingChecklist([
      'API endpoint testing',
      'Frontend integration',
      'Authentication',
    ]);
  }

  async handleFrontendChange() {
    console.log(chalk.blue('\n🎨 Frontend Component Changes\n'));

    console.log(chalk.yellow('What kind of frontend change?'));
    console.log('1. Add new React component');
    console.log('2. Modify existing component');
    console.log('3. Add new page/route');
    console.log('4. Update styling/theme');
    console.log('5. Add new form or data input\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Step-by-step guide:\n'));

    console.log(chalk.blue('PRIMARY DIRECTORY TO CHANGE:'));
    console.log(
      chalk.white('  apps/client/src/components/[choose appropriate directory]')
    );
    console.log(chalk.gray('    • ui/ - Reusable UI components'));
    console.log(chalk.gray('    • dashboard/ - Dashboard-specific components'));
    console.log(
      chalk.gray('    • unified-dashboard/ - Unified dashboard components')
    );
    console.log(chalk.gray('    • pages/ - Page-level components'));

    console.log(chalk.yellow('\nAUTOMATION STEPS:'));
    console.log(chalk.white('  1. Create/modify your component files'));
    console.log(
      chalk.white(
        '  2. npm run type-check                # TypeScript validation'
      )
    );

    if (subChoice === '5') {
      console.log(
        chalk.white(
          '  3. npm run validate:runtime --components # Validate form schemas'
        )
      );
    }

    console.log(chalk.yellow('\nSECONDARY FILES TO UPDATE:'));
    console.log(
      chalk.white('  • packages/shared/types/ui.ts (if new props/interfaces)')
    );
    console.log(
      chalk.white(
        '  • apps/client/src/components/index.ts (export new components)'
      )
    );

    if (subChoice === '5') {
      console.log(
        chalk.white('  • schemas/dashboard-schema.json (add validation schema)')
      );
    }

    if (subChoice === '3') {
      console.log(chalk.white('  • apps/client/src/App.tsx (add new route)'));
    }

    await this.showTestingChecklist([
      'Component rendering',
      'User interactions',
      'Responsive design',
    ]);
  }

  async handleConfigChange() {
    console.log(chalk.blue('\n⚙️ Configuration Changes\n'));

    console.log(chalk.yellow('What kind of configuration change?'));
    console.log('1. Environment variables');
    console.log('2. Build configuration');
    console.log('3. Database configuration');
    console.log('4. External service configuration');
    console.log('5. TypeScript configuration\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Step-by-step guide:\n'));

    switch (subChoice) {
      case 1:
        console.log(chalk.blue('PRIMARY FILE TO CHANGE:'));
        console.log(chalk.white('  .env.example'));
        console.log(chalk.yellow('\nSECONDARY FILES:'));
        console.log(chalk.white('  • packages/config/environment.ts'));
        console.log(chalk.white('  • apps/server/index.ts'));
        console.log(chalk.white('  • docs/DEPLOYMENT_QUICKSTART.md'));
        break;
      case 2:
        console.log(chalk.blue('PRIMARY FILE TO CHANGE:'));
        console.log(chalk.white('  vite.config.ts'));
        console.log(chalk.yellow('\nSECONDARY FILES:'));
        console.log(chalk.white('  • package.json'));
        console.log(chalk.white('  • tsconfig.json'));
        break;
    }

    console.log(chalk.yellow('\nAUTOMATION STEPS:'));
    console.log(chalk.white('  1. Make your configuration changes'));
    console.log(
      chalk.white(
        '  2. npm run sync:changes              # Sync to all environments'
      )
    );
    console.log(
      chalk.white(
        '  3. npm run validate:runtime --config # Validate configuration'
      )
    );

    await this.showTestingChecklist([
      'Build process',
      'Environment validation',
      'Deployment',
    ]);
  }

  async handleHotelFeatures() {
    console.log(chalk.blue('\n🏨 Hotel-Specific Features\n'));

    console.log(chalk.yellow('What hotel feature do you want to change?'));
    console.log('1. Room service ordering');
    console.log('2. Voice assistant configuration');
    console.log('3. Hotel information/settings');
    console.log('4. Multi-tenant features');
    console.log('5. Guest communication\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Hotel Feature Guide:\n'));

    switch (subChoice) {
      case 1:
        console.log(chalk.blue('ROOM SERVICE ORDERING:'));
        console.log(chalk.white('  Database: request table in schema.ts'));
        console.log(chalk.white('  API: apps/server/routes/orders.ts'));
        console.log(
          chalk.white('  Frontend: apps/client/src/components/EmailForm.tsx')
        );
        console.log(
          chalk.white('  Service: apps/server/services/orderService.ts')
        );
        break;
      case 2:
        console.log(chalk.blue('VOICE ASSISTANT:'));
        console.log(
          chalk.white('  Config: apps/client/src/context/AssistantContext.tsx')
        );
        console.log(
          chalk.white('  Service: apps/server/services/vapiIntegration.ts')
        );
        console.log(
          chalk.white(
            '  Frontend: apps/client/src/components/VoiceAssistant.tsx'
          )
        );
        break;
      case 4:
        console.log(chalk.blue('MULTI-TENANT FEATURES:'));
        console.log(chalk.white('  Database: tenants table in schema.ts'));
        console.log(
          chalk.white('  Middleware: apps/server/middleware/tenant.ts')
        );
        console.log(
          chalk.white('  Service: apps/server/services/tenantService.ts')
        );
        break;
    }

    await this.showTestingChecklist([
      'Feature functionality',
      'Multi-tenant isolation',
      'Voice assistant integration',
    ]);
  }

  async handleVoiceAssistant() {
    console.log(chalk.blue('\n🎙️ Voice Assistant Features\n'));

    console.log(chalk.yellow('What voice assistant feature?'));
    console.log('1. Add new voice commands');
    console.log('2. Modify voice responses');
    console.log('3. Change voice assistant configuration');
    console.log('4. Add new language support');
    console.log('5. Update call handling logic\n');

    const subChoice = await this.promptUser(
      chalk.cyan('Select option (1-5): ')
    );

    console.log(chalk.green('\n📋 Voice Assistant Guide:\n'));

    console.log(chalk.blue('PRIMARY FILES:'));
    console.log(
      chalk.white('  • apps/client/src/context/AssistantContext.tsx')
    );
    console.log(chalk.white('  • apps/server/services/vapiIntegration.ts'));
    console.log(
      chalk.white('  • apps/client/src/components/VoiceAssistant.tsx')
    );

    console.log(chalk.yellow('\nCONFIGURATION:'));
    console.log(chalk.white('  • Environmental: .env.example (VAPI keys)'));
    console.log(chalk.white('  • Language support: apps/client/src/i18n/'));

    if (subChoice === 4) {
      console.log(chalk.yellow('\nFOR NEW LANGUAGE SUPPORT:'));
      console.log(
        chalk.white(
          '  1. Add new language file: apps/client/src/i18n/[lang].json'
        )
      );
      console.log(chalk.white('  2. Update language selector in components'));
      console.log(chalk.white('  3. Configure Vapi for new language'));
    }

    await this.showTestingChecklist([
      'Voice commands',
      'Language switching',
      'Call quality',
      'Response accuracy',
    ]);
  }

  async showTestingChecklist(testAreas) {
    console.log(chalk.green('\n🧪 TESTING CHECKLIST:\n'));

    testAreas.forEach((area, index) => {
      console.log(chalk.white(`  ${index + 1}. Test ${area}`));
    });

    console.log(chalk.cyan('\n  Run: npm run test              # Unit tests'));
    console.log(
      chalk.cyan('  Run: npm run validate:ssot     # System consistency')
    );
    console.log(
      chalk.cyan('  Run: npm run validate:runtime  # Runtime validation')
    );
  }

  async generateChangeChecklist() {
    const taskDescription = await this.promptUser(
      chalk.cyan('\nDescribe your change in one sentence: ')
    );

    console.log(chalk.blue('\n📝 CHANGE CHECKLIST GENERATED:\n'));
    console.log(chalk.white(`Task: ${taskDescription}\n`));

    console.log(chalk.yellow('□ 1. Identify primary SSOT file'));
    console.log(chalk.yellow('□ 2. Make changes to primary file'));
    console.log(chalk.yellow('□ 3. Run appropriate automation commands'));
    console.log(chalk.yellow('□ 4. Update secondary files as needed'));
    console.log(chalk.yellow('□ 5. Validate SSOT consistency'));
    console.log(chalk.yellow('□ 6. Test affected functionality'));
    console.log(chalk.yellow('□ 7. Update documentation if needed'));
    console.log(chalk.yellow('□ 8. Commit changes with clear message'));

    console.log(
      chalk.gray('\n💡 Tip: Use "npm run validate:ssot" before committing')
    );
  }

  async showQuickCommands() {
    console.log(chalk.blue('\n⚡ QUICK COMMANDS:\n'));

    const commands = [
      { desc: 'Find SSOT files', cmd: 'node scripts/ssot-finder.js' },
      { desc: 'Validate everything', cmd: 'npm run validate:ssot' },
      { desc: 'Generate types', cmd: 'npm run generate:types' },
      { desc: 'Check breaking changes', cmd: 'npm run check:breaking-changes' },
      { desc: 'Generate API docs', cmd: 'npm run generate:api-docs' },
      { desc: 'Runtime validation', cmd: 'npm run validate:runtime' },
      { desc: 'Start file watcher', cmd: 'npm run watch:ssot' },
      { desc: 'Update README', cmd: 'npm run update:readme' },
    ];

    commands.forEach((item, index) => {
      console.log(chalk.cyan(`${index + 1}. ${item.desc}`));
      console.log(chalk.white(`   ${item.cmd}`));
      console.log();
    });
  }

  async run() {
    await this.loadRegistry();

    while (true) {
      this.displayWelcome();

      const choice = await this.askWhatToChange();

      switch (choice) {
        case 1:
          await this.handleDatabaseChange();
          break;
        case 2:
          await this.handleApiChange();
          break;
        case 3:
          await this.handleFrontendChange();
          break;
        case 4:
          await this.handleConfigChange();
          break;
        case 5:
          console.log(chalk.blue('\n📝 Documentation updates are automated!'));
          console.log(
            chalk.white(
              '  Run: npm run update:readme           # Update README'
            )
          );
          console.log(
            chalk.white(
              '  Run: npm run generate:api-docs       # Update API docs'
            )
          );
          console.log(
            chalk.white(
              '  Run: npm run generate:changelog      # Generate changelog'
            )
          );
          break;
        case 6:
          console.log(chalk.red('\n🔄 Breaking Changes - CAREFUL!'));
          console.log(chalk.white('  1. Make your changes'));
          console.log(
            chalk.white('  2. npm run check:breaking-changes   # REQUIRED')
          );
          console.log(
            chalk.white('  3. npm run generate:migration-guide # REQUIRED')
          );
          console.log(
            chalk.white('  4. npm run generate:migration-docs  # REQUIRED')
          );
          console.log(
            chalk.yellow(
              '  5. Review generated migration guide before deploying'
            )
          );
          break;
        case 7:
          await this.handleHotelFeatures();
          break;
        case 8:
          console.log(chalk.blue('\n🔐 Authentication & Permissions:'));
          console.log(
            chalk.white(
              '  Database: staff table in packages/shared/db/schema.ts'
            )
          );
          console.log(
            chalk.white('  Middleware: apps/server/middleware/auth.ts')
          );
          console.log(
            chalk.white('  Frontend: apps/client/src/context/AuthContext.tsx')
          );
          break;
        case 9:
          console.log(chalk.blue('\n📊 Analytics & Reporting:'));
          console.log(chalk.white('  API: apps/server/routes/analytics.ts'));
          console.log(
            chalk.white('  Service: apps/server/services/analyticsService.ts')
          );
          console.log(
            chalk.white(
              '  Frontend: apps/client/src/pages/AnalyticsDashboard.tsx'
            )
          );
          break;
        case 10:
          await this.handleVoiceAssistant();
          break;
        case 11:
          console.log(chalk.green('\nHappy coding! 🚀'));
          this.rl.close();
          return;
        default:
          console.log(chalk.red('Invalid choice. Please select 1-11.'));
          continue;
      }

      await this.generateChangeChecklist();
      await this.showQuickCommands();

      const continueChoice = await this.promptUser(
        chalk.cyan('\nNeed help with another change? (y/n): ')
      );
      if (continueChoice.toLowerCase() !== 'y') {
        console.log(chalk.green('\nHappy coding! 🚀'));
        this.rl.close();
        return;
      }

      console.clear();
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
What To Change - Interactive Change Wizard

Usage: node scripts/what-to-change.js

This interactive tool guides you through common change scenarios
in the hotel management system, providing step-by-step instructions
and automation commands.

Features:
  • Database schema changes
  • API endpoint modifications  
  • Frontend component updates
  • Configuration changes
  • Hotel-specific features
  • Voice assistant features
  • Automated testing checklist
  • SSOT consistency validation
    `);
    return;
  }

  const wizard = new ChangeWizard();
  await wizard.run();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ChangeWizard };
