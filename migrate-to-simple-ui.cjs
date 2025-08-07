#!/usr/bin/env node

/**
 * Migration Script: shadcn/ui -> Simple UI
 * Automatically migrates import statements across the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = (color, message) => console.log(`${colors[color]}${message}${colors.reset}`);

// Migration mappings
const importMappings = {
  // Basic components - 1:1 mapping
  'Button': 'Button',
  'Card': 'Card',
  'CardContent': 'CardContent', 
  'CardHeader': 'CardHeader',
  'CardFooter': 'CardFooter',
  'Modal': 'Modal',
  'Input': 'Input',
  'Badge': 'Badge',
  'Avatar': 'Avatar',
  'Switch': 'Switch',
  
  // Components that need wrappers/alternatives
  'Skeleton': 'LoadingSpinner', // Use LoadingSpinner instead
  'Dialog': 'Modal', // Use Modal instead
  'DialogContent': 'Modal',
  'DialogHeader': 'Modal',
  'DialogTitle': 'Modal',
  'Separator': 'Divider',
  'Label': null, // Use native HTML label
  'Textarea': 'Input', // Input component supports multiline
  
  // Components to be implemented later
  'Select': null,
  'Checkbox': null,
  'RadioGroup': null,
  'Tabs': null,
  'Tooltip': null,
  'Popover': null,
  'Command': null,
  'DropdownMenu': null,
  'Sheet': null,
  'AlertDialog': null,
  'Calendar': null,
  'Form': null,
  'Table': null,
  'Pagination': null,
  'NavigationMenu': null,
  'Menubar': null,
  'ContextMenu': null,
  'HoverCard': null,
  'Progress': null,
  'Slider': null,
  'ToggleGroup': null,
  'Toggle': null,
  'Collapsible': null,
  'Accordion': null,
  'AspectRatio': null,
  'Breadcrumb': null,
  'Carousel': null,
  'Chart': null,
  'Drawer': null,
  'InputOTP': null,
  'Resizable': null,
  'ScrollArea': null,
  'Sidebar': null,
  'Toast': 'Toast',
  'Toaster': 'ToastContainer',
};

// Special replacements for content
const contentReplacements = [
  // CardTitle wrapper - create inline component
  {
    search: /import.*CardTitle.*from.*@\/components\/ui.*$/gm,
    replace: 'import { CardHeader } from "@/components/simple-ui";',
    note: 'CardTitle -> inline component'
  },
  
  // Skeleton replacement with simple div
  {
    search: /<Skeleton\s+className="([^"]*)".*\/>/g,
    replace: '<div className="$1 bg-gray-200 rounded animate-pulse" />',
    note: 'Skeleton -> simple div'
  },
  
  // Dialog to Modal
  {
    search: /<Dialog\s+/g,
    replace: '<Modal ',
    note: 'Dialog -> Modal'
  },
  
  // Add more specific replacements as needed
];

// Find all files that import from @/components/ui
function findFilesToMigrate() {
  try {
    const result = execSync(
      'find apps/client/src -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/components/ui"',
      { encoding: 'utf8', cwd: process.cwd() }
    );
    
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    log('red', 'Error finding files to migrate:');
    log('red', error.message);
    return [];
  }
}

// Migrate a single file
function migrateFile(filePath) {
  try {
    log('blue', `📄 Migrating: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let changes = 0;
    
    // Step 1: Replace import statements
    const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]@\/components\/ui\/([^'"]+)['"]/g;
    
    content = content.replace(importRegex, (match, imports, uiComponent) => {
      const importList = imports
        .split(',')
        .map(imp => imp.trim())
        .filter(Boolean);
      
      const mappedImports = [];
      const unmappedImports = [];
      
      importList.forEach(imp => {
        if (importMappings.hasOwnProperty(imp)) {
          const mapped = importMappings[imp];
          if (mapped) {
            mappedImports.push(mapped);
          }
          // null means we skip this import (will be handled manually)
        } else {
          unmappedImports.push(imp);
        }
      });
      
      let replacement = '';
      
      if (mappedImports.length > 0) {
        replacement = `import { ${mappedImports.join(', ')} } from '@/components/simple-ui'`;
        changes++;
      }
      
      if (unmappedImports.length > 0) {
        log('yellow', `  ⚠️  Unmapped imports in ${filePath}: ${unmappedImports.join(', ')}`);
        if (replacement) {
          replacement += `\n// TODO: Migrate these manually: ${unmappedImports.join(', ')}`;
        } else {
          replacement = `// TODO: Migrate these manually: ${unmappedImports.join(', ')}\n${match}`;
        }
      }
      
      return replacement;
    });
    
    // Step 2: Apply content replacements
    contentReplacements.forEach(({ search, replace, note }) => {
      const beforeLength = content.length;
      content = content.replace(search, replace);
      const afterLength = content.length;
      
      if (beforeLength !== afterLength) {
        log('cyan', `  🔄 Applied: ${note}`);
        changes++;
      }
    });
    
    // Step 3: Write back if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      log('green', `  ✅ Migrated ${changes} changes`);
      return { success: true, changes };
    } else {
      log('gray', '  ℹ️  No changes needed');
      return { success: true, changes: 0 };
    }
    
  } catch (error) {
    log('red', `  ❌ Error migrating ${filePath}:`);
    log('red', `     ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main migration function
function migrate() {
  log('magenta', '🚀 Starting Simple UI Migration...\n');
  
  const filesToMigrate = findFilesToMigrate();
  
  if (filesToMigrate.length === 0) {
    log('yellow', '⚠️  No files found to migrate');
    return;
  }
  
  log('blue', `📋 Found ${filesToMigrate.length} files to migrate:\n`);
  
  const results = {
    success: 0,
    failed: 0,
    totalChanges: 0,
    failures: []
  };
  
  filesToMigrate.forEach(file => {
    const result = migrateFile(file);
    
    if (result.success) {
      results.success++;
      results.totalChanges += result.changes;
    } else {
      results.failed++;
      results.failures.push({ file, error: result.error });
    }
  });
  
  // Summary
  log('magenta', '\n📊 Migration Summary:');
  log('green', `✅ Successfully migrated: ${results.success} files`);
  log('green', `🔄 Total changes made: ${results.totalChanges}`);
  
  if (results.failed > 0) {
    log('red', `❌ Failed migrations: ${results.failed} files`);
    results.failures.forEach(({ file, error }) => {
      log('red', `   - ${file}: ${error}`);
    });
  }
  
  log('blue', '\n📝 Next Steps:');
  log('blue', '1. Review migrated files manually');
  log('blue', '2. Handle TODO comments for unmapped imports');
  log('blue', '3. Test functionality');
  log('blue', '4. Fix any TypeScript errors');
  log('blue', '5. Start development server: npm run dev');
  
  log('cyan', '\n🎯 Check progress: http://localhost:5173/ui-demo');
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = { migrate, migrateFile, importMappings };
