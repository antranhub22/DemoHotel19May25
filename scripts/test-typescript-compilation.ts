#!/usr/bin/env node

/**
 * Test script to verify TypeScript compilation status
 * This script will attempt to compile the TypeScript code and report any errors
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

async function checkTypeScriptCompilation() {
  console.log('🔍 Checking TypeScript compilation...');
  
  try {
    // Run TypeScript compiler in check mode
    const tsc = spawn('npx', ['tsc', '--noEmit'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    
    tsc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    tsc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    return new Promise((resolve, reject) => {
      tsc.on('close', (code) => {
        if (code === 0) {
          console.log('✅ TypeScript compilation successful!');
          resolve({ success: true, stdout, stderr });
        } else {
          console.log('❌ TypeScript compilation failed with code:', code);
          console.log('Errors:', stderr);
          console.log('Output:', stdout);
          resolve({ success: false, code, stdout, stderr });
        }
      });
      
      tsc.on('error', (error) => {
        console.error('❌ Failed to run TypeScript compiler:', error);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking TypeScript compilation:', error);
    return { success: false, error };
  }
}

async function main() {
  console.log('🚀 TypeScript Compilation Test');
  console.log('==============================');
  
  try {
    const result = await checkTypeScriptCompilation();
    
    if ((result as any).success) {
      console.log('🎉 All TypeScript compilation errors have been resolved!');
      process.exit(0);
    } else {
      console.log('⚠️ There are still TypeScript compilation errors to fix.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 