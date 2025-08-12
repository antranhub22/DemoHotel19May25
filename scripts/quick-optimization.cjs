#!/usr/bin/env node
/**
 * 🚀 Quick Wins Optimization Script
 * Safe optimizations that don't affect current functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Quick Wins Optimization...\n');

// 1. Add performance script to package.json
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add useful dev scripts that are missing
const newScripts = {
  'perf:analyze': 'npm run build && npx vite-bundle-analyzer dist',
  'deps:check': 'npx npm-check-updates --interactive',
  'size:check': 'npx bundlesize',
  'security:audit': 'npm audit --audit-level moderate',
  'clean:cache': 'npm cache clean --force && rm -rf node_modules/.cache',
  'lint:fix': 'eslint --fix "**/*.{ts,tsx,js,jsx}" && prettier --write "**/*.{ts,tsx,js,jsx,json,md}"',
  'quick:health': 'npm run health:check && npm run security:audit'
};

let scriptsAdded = 0;
for (const [script, command] of Object.entries(newScripts)) {
  if (!packageJson.scripts[script]) {
    packageJson.scripts[script] = command;
    scriptsAdded++;
    console.log(`✅ Added script: ${script}`);
  }
}

if (scriptsAdded > 0) {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`\n📝 Updated package.json with ${scriptsAdded} new scripts`);
} else {
  console.log('📝 All performance scripts already exist');
}

console.log('\n🎉 Quick Wins Optimization Complete!');
console.log('\n💡 New available commands:');
Object.keys(newScripts).forEach(script => {
  console.log(`   npm run ${script}`);
});