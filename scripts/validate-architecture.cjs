#!/usr/bin/env node

/**
 * 🏗️ Architecture Validation Script
 * Automatically detects overlaps and validates separation of concerns
 */

const fs = require('fs');
const path = require('path');

// 📋 ARCHITECTURE RULES
const ARCHITECTURE_RULES = {
  'apps/client/src/components/siri/SiriButton.ts': {
    name: 'SiriButton',
    primaryResponsibility: 'Visual rendering & animations',
    allowed: [
      'canvas', 'draw', 'animate', 'color', 'visual', 'style', 'render',
      'resize', 'cleanup', 'setInteractionMode', 'setTouchPosition', 
      'updateVisualState', 'setListening', 'setVolumeLevel', 'window.addEventListener',
      'resize', 'matchMedia', 'change'
    ],
    forbidden: [
      'container.addEventListener', 'element.addEventListener', 'onClick', 'onTouch',
      'handleClick', 'handleTouch', 'onCallStart', 'onCallEnd', 'useState',
      'useEffect', 'useCallback', 'fetch', 'api', 'axios', 'touchstart', 'touchend',
      'mousedown', 'mouseup', 'click'
    ]
  },
  
  'apps/client/src/components/siri/SiriCallButton.tsx': {
    name: 'SiriCallButton',
    primaryResponsibility: 'Event handling & business logic',
    allowed: [
      'addEventListener', 'removeEventListener', 'onClick', 'onTouch',
      'handleClick', 'handleTouch', 'onCallStart', 'onCallEnd', 'useState',
      'useEffect', 'useCallback', 'deviceDetection', 'buttonRef.current'
    ],
    forbidden: [
      'createElement("canvas")', 'getContext', 'fillRect', 'drawImage',
      'beginPath', 'fillStyle', 'strokeStyle', '.draw', 'arc(', 'lineTo'
    ]
  },

  'apps/client/src/components/siri/SiriButtonContainer.tsx': {
    name: 'SiriButtonContainer',
    primaryResponsibility: 'Layout & theming',
    allowed: [
      'style', 'className', 'theme', 'color', 'layout', 'position',
      'SiriCallButton', 'language', 'props', 'jsx', 'div', 'button',
      'onCallStart', 'onCallEnd', 'onCancel', 'onConfirm'
    ],
    forbidden: [
      'addEventListener', 'removeEventListener', 'handleClick', 'handleTouch',
      'canvas', 'getContext', 'draw', 'touchstart', 'touchend', 'mousedown'
    ]
  }
};

// 🔍 VIOLATION DETECTION
class ArchitectureValidator {
  constructor() {
    this.violations = [];
    this.warnings = [];
  }

  /**
   * Main validation entry point
   */
  validate() {
    console.log('🏗️  Starting Architecture Validation...\n');
    
    for (const [filePath, rules] of Object.entries(ARCHITECTURE_RULES)) {
      if (fs.existsSync(filePath)) {
        this.validateFile(filePath, rules);
      } else {
        this.warnings.push(`⚠️  File not found: ${filePath}`);
      }
    }

    this.reportResults();
    return this.violations.length === 0;
  }

  /**
   * Validate individual file against rules
   */
  validateFile(filePath, rules) {
    console.log(`🔍 Validating ${rules.name} (${filePath})`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check for forbidden patterns
    rules.forbidden.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      
      lines.forEach((line, index) => {
        if (regex.test(line)) {
          this.violations.push({
            file: rules.name,
            line: index + 1,
            violation: `FORBIDDEN pattern "${pattern}" found`,
            code: line.trim(),
            severity: 'ERROR'
          });
        }
      });
    });

    // Check architecture-specific violations
    this.checkSpecificViolations(content, rules, filePath);
  }

  /**
   * Check for specific architecture violations
   */
  checkSpecificViolations(content, rules, filePath) {
    if (rules.name === 'SiriButton') {
      // Check for React imports (should be pure TypeScript)
      if (content.includes('import React') || content.includes('import { use')) {
        this.violations.push({
          file: rules.name,
          line: 1,
          violation: 'SiriButton should be pure TypeScript class, no React imports',
          code: 'React imports detected',
          severity: 'ERROR'
        });
      }

      // Check for event handling
      if (content.match(/\.addEventListener\s*\(/g)) {
        const matches = content.match(/\.addEventListener\s*\([^)]*\)/g) || [];
        matches.forEach(match => {
          // Allow window resize and matchMedia change events
          if (!match.includes('resize') && !match.includes('change')) {
            this.violations.push({
              file: rules.name,
              line: 'multiple',
              violation: 'SiriButton should not handle events directly',
              code: match,
              severity: 'ERROR'
            });
          }
        });
      }
    }

    if (rules.name === 'SiriCallButton') {
      // Check for canvas operations
      const canvasOps = ['getContext', 'fillRect', 'drawImage', 'beginPath'];
      canvasOps.forEach(op => {
        if (content.includes(op)) {
          this.violations.push({
            file: rules.name,
            line: 'multiple',
            violation: 'SiriCallButton should not perform canvas operations',
            code: `${op} operation detected`,
            severity: 'ERROR'
          });
        }
      });
    }

    if (rules.name === 'SiriButtonContainer') {
      // Check for direct event handling
      if (content.match(/\.addEventListener\s*\(/g)) {
        this.violations.push({
          file: rules.name,
          line: 'multiple',
          violation: 'SiriButtonContainer should not handle events directly',
          code: 'addEventListener detected',
          severity: 'ERROR'
        });
      }
    }
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n📊 ARCHITECTURE VALIDATION RESULTS\n');

    if (this.violations.length === 0) {
      console.log('✅ ARCHITECTURE VALIDATION PASSED!');
      console.log('🎯 All components maintain proper separation of concerns\n');
    } else {
      console.log('❌ ARCHITECTURE VIOLATIONS DETECTED!\n');
      
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. 🚨 ${violation.severity}: ${violation.file}`);
        console.log(`   📍 Line ${violation.line}: ${violation.violation}`);
        console.log(`   📝 Code: ${violation.code}`);
        console.log('');
      });
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }

    // Provide recommendations
    if (this.violations.length > 0) {
      console.log('🔧 RECOMMENDATIONS:');
      console.log('   1. Review docs/ARCHITECTURE_GUIDELINES.md');
      console.log('   2. Move violations to appropriate components');
      console.log('   3. Use public interfaces for cross-component communication');
      console.log('   4. Run npm run validate:architecture before committing\n');
    }
  }
}

// 🚀 EXECUTION
if (require.main === module) {
  const validator = new ArchitectureValidator();
  const isValid = validator.validate();
  
  process.exit(isValid ? 0 : 1);
}

module.exports = { ArchitectureValidator, ARCHITECTURE_RULES }; 