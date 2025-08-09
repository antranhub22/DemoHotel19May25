#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Auto-installing missing @types packages...');

// Get current TypeScript errors to analyze
function getCurrentErrors() {
    try {
        const result = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
        return result.split('\n').filter(line => line.includes('error TS'));
    } catch (error) {
        return error.stdout ? error.stdout.split('\n').filter(line => line.includes('error TS')) : [];
    }
}

// Extract TS7016 errors (Try `npm i --save-dev @types/...`)
function getTS7016Errors(errors) {
    return errors.filter(error => error.includes('error TS7016'))
        .map(error => {
            // Extract package name from error message
            const match = error.match(/Could not find a declaration file for module ['"]([^'"]+)['"]/);
            if (match) {
                return {
                    package: match[1],
                    line: error
                };
            }
            return null;
        }).filter(Boolean);
}

// Extract TS2307 errors for potential @types packages
function getModuleNotFoundErrors(errors) {
    return errors.filter(error => error.includes('error TS2307'))
        .map(error => {
            const match = error.match(/Cannot find module ['"]([^'"]+)['"]/);
            if (match) {
                const moduleName = match[1];
                // Only consider npm packages (not relative imports)
                if (!moduleName.startsWith('.') && !moduleName.startsWith('/')) {
                    return {
                        package: moduleName.split('/')[0], // Get base package name
                        line: error
                    };
                }
            }
            return null;
        }).filter(Boolean);
}

// Get package.json to check existing dependencies
function getCurrentDependencies() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        return {
            dependencies: Object.keys(packageJson.dependencies || {}),
            devDependencies: Object.keys(packageJson.devDependencies || {})
        };
    } catch (error) {
        console.warn('Warning: Could not read package.json');
        return { dependencies: [], devDependencies: [] };
    }
}

// Check if a @types package exists on npm
async function checkTypesPackageExists(packageName) {
    try {
        const typesPackage = `@types/${packageName}`;
        execSync(`npm view ${typesPackage} version`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

// Install missing @types packages
async function installMissingTypes() {
    const errors = getCurrentErrors();
    const ts7016Errors = getTS7016Errors(errors);
    const moduleNotFoundErrors = getModuleNotFoundErrors(errors);
    const dependencies = getCurrentDependencies();

    console.log(`📊 Found ${ts7016Errors.length} TS7016 errors and ${moduleNotFoundErrors.length} module not found errors`);

    // Collect all packages that might need @types
    const candidatePackages = new Set();

    // Add packages from TS7016 errors (explicit suggestions)
    ts7016Errors.forEach(error => {
        candidatePackages.add(error.package);
    });

    // Add packages from TS2307 errors that exist in dependencies
    moduleNotFoundErrors.forEach(error => {
        const packageName = error.package;
        if (dependencies.dependencies.includes(packageName) ||
            dependencies.devDependencies.includes(packageName)) {
            candidatePackages.add(packageName);
        }
    });

    // Filter out packages that already have @types installed
    const packagesNeedingTypes = Array.from(candidatePackages).filter(pkg => {
        const typesPackage = `@types/${pkg}`;
        return !dependencies.devDependencies.includes(typesPackage);
    });

    if (packagesNeedingTypes.length === 0) {
        console.log('✅ No missing @types packages found!');
        return;
    }

    console.log(`🔍 Checking ${packagesNeedingTypes.length} packages for available @types...`);

    // Check which @types packages actually exist
    const availableTypesPackages = [];
    for (const pkg of packagesNeedingTypes) {
        console.log(`   Checking @types/${pkg}...`);
        if (await checkTypesPackageExists(pkg)) {
            availableTypesPackages.push(`@types/${pkg}`);
            console.log(`   ✅ @types/${pkg} exists`);
        } else {
            console.log(`   ❌ @types/${pkg} not found`);
        }
    }

    if (availableTypesPackages.length === 0) {
        console.log('💡 No available @types packages to install');
        return;
    }

    // Install the available @types packages
    console.log(`\n📦 Installing ${availableTypesPackages.length} @types packages...`);
    console.log(`   ${availableTypesPackages.join(' ')}`);

    try {
        const installCommand = `npm install --save-dev ${availableTypesPackages.join(' ')}`;
        execSync(installCommand, { stdio: 'inherit' });
        console.log('✅ Successfully installed @types packages!');
    } catch (error) {
        console.error('❌ Failed to install @types packages:', error.message);
        return;
    }

    // Check improvement
    console.log('\n🔍 Checking improvement...');
    const newErrors = getCurrentErrors();
    const improvement = errors.length - newErrors.length;

    console.log('\n📊 RESULTS:');
    console.log(`Before: ${errors.length} errors`);
    console.log(`After: ${newErrors.length} errors`);
    console.log(`Improvement: ${improvement} errors fixed`);

    if (improvement > 0) {
        console.log('🎉 Successfully reduced TypeScript errors!');
    } else {
        console.log('💡 No immediate error reduction, but types are now available');
    }
}

// Additional common @types packages to consider
async function installCommonTypes() {
    console.log('\n🔧 Installing common @types packages...');

    const commonTypes = [
        '@types/jest',
        '@types/jsdom',
        '@types/cookie-parser',
        '@types/compression',
        '@types/helmet',
        '@types/morgan'
    ];

    const dependencies = getCurrentDependencies();
    const neededTypes = commonTypes.filter(typesPkg =>
        !dependencies.devDependencies.includes(typesPkg)
    );

    if (neededTypes.length === 0) {
        console.log('✅ All common @types packages already installed');
        return;
    }

    console.log(`📦 Installing common types: ${neededTypes.join(' ')}`);

    try {
        const installCommand = `npm install --save-dev ${neededTypes.join(' ')}`;
        execSync(installCommand, { stdio: 'inherit' });
        console.log('✅ Common @types packages installed!');
    } catch (error) {
        console.log('💡 Some common @types packages may not be needed');
    }
}

// Main execution
async function main() {
    const startTime = Date.now();
    console.log('🚀 Starting automatic @types installation...\n');

    const initialErrors = getCurrentErrors();
    console.log(`📊 Initial TypeScript errors: ${initialErrors.length}\n`);

    await installMissingTypes();
    await installCommonTypes();

    const finalErrors = getCurrentErrors();
    const totalImprovement = initialErrors.length - finalErrors.length;

    console.log('\n📊 FINAL RESULTS:');
    console.log(`Initial errors: ${initialErrors.length}`);
    console.log(`Final errors: ${finalErrors.length}`);
    console.log(`Total improvement: ${totalImprovement} errors`);
    console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    if (totalImprovement > 0) {
        console.log('\n🎉 Successfully improved TypeScript error count!');
    } else {
        console.log('\n💡 Type definitions installed for better development experience');
    }
}

main().catch(console.error);