#!/usr/bin/env node

/**
 * 🎯 Enhanced Change Guidance System
 * Intelligently determines which files to modify based on change intent
 */

const readline = require('readline');
const fs = require('fs');

// 🧠 INTELLIGENT CHANGE MAPPING
const CHANGE_PATTERNS = {
  // Visual & Animation Changes
  visual: {
    keywords: ['animation', 'color', 'visual', 'canvas', 'draw', 'render', 'effect', 'style', 'theme'],
    primaryFile: 'SiriButton.ts',
    secondaryFiles: [],
    description: 'Visual effects, animations, canvas operations',
    examples: [
      'Add new animation effect',
      'Change button colors or themes',
      'Modify canvas drawing logic',
      'Add visual feedback effects'
    ]
  },

  // Event & Interaction Changes  
  interaction: {
    keywords: ['click', 'touch', 'event', 'handler', 'interaction', 'gesture', 'tap', 'press'],
    primaryFile: 'SiriCallButton.tsx',
    secondaryFiles: ['SiriButton.ts (public interface only)'],
    description: 'Event handling, user interactions, business logic',
    examples: [
      'Add new touch gesture',
      'Modify click behavior',
      'Change business logic',
      'Add event validation'
    ]
  },

  // Layout & UI Changes
  layout: {
    keywords: ['layout', 'position', 'container', 'responsive', 'mobile', 'desktop', 'ui', 'spacing'],
    primaryFile: 'SiriButtonContainer.tsx',
    secondaryFiles: ['voice-interface.css'],
    description: 'Layout, positioning, responsive design',
    examples: [
      'Modify button positioning',
      'Add responsive breakpoints',
      'Change container layout',
      'Update mobile/desktop styles'
    ]
  },

  // Theme & Language Changes
  theme: {
    keywords: ['language', 'theme', 'localization', 'color scheme', 'i18n', 'translation'],
    primaryFile: 'SiriButtonContainer.tsx',
    secondaryFiles: ['SiriButton.ts (color handling)'],
    description: 'Themes, languages, color schemes',
    examples: [
      'Add new language support',
      'Create new color theme',
      'Modify language switching',
      'Update theme colors'
    ]
  },

  // Bug Fixes
  bugfix: {
    keywords: ['bug', 'fix', 'error', 'issue', 'problem', 'broken', 'not working'],
    primaryFile: 'ANALYSIS REQUIRED',
    secondaryFiles: ['Run diagnostic first'],
    description: 'Bug fixes require analysis',
    examples: [
      'Mobile touch not working → SiriCallButton.tsx + CSS',
      'Visual effects broken → SiriButton.ts',
      'Layout issues → SiriButtonContainer.tsx + CSS',
      'Event conflicts → Architecture review needed'
    ]
  }
};

// 🔍 INTELLIGENT ANALYZER
class ChangeGuidanceSystem {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    console.log('🎯 ENHANCED CHANGE GUIDANCE SYSTEM');
    console.log('=====================================\n');
    console.log('Tell me what you want to change, and I\'ll guide you to the right files!\n');

    while (true) {
      try {
        const input = await this.askQuestion('\n🤔 What do you want to change? (or "exit" to quit)\n> ');
        
        if (input.toLowerCase() === 'exit') {
          break;
        }

        this.analyzeAndGuide(input);
      } catch (error) {
        console.error('Error:', error.message);
      }
    }

    this.rl.close();
  }

  /**
   * Analyze user input and provide guidance
   */
  analyzeAndGuide(input) {
    const analysis = this.analyzeInput(input);
    
    if (analysis.length === 0) {
      this.showGeneralGuidance();
      return;
    }

    console.log('\n📊 ANALYSIS RESULTS:');
    console.log('====================\n');

    analysis.forEach((match, index) => {
      console.log(`${index + 1}. 🎯 ${match.category.toUpperCase()} CHANGE`);
      console.log(`   📝 Description: ${match.pattern.description}`);
      console.log(`   📁 Primary file: ${match.pattern.primaryFile}`);
      
      if (match.pattern.secondaryFiles.length > 0) {
        console.log(`   📁 Secondary files: ${match.pattern.secondaryFiles.join(', ')}`);
      }
      
      console.log(`   💡 Confidence: ${match.confidence}%`);
      console.log('');
    });

    // Provide specific recommendations
    this.provideRecommendations(analysis);
  }

  /**
   * Analyze user input using keyword matching and context
   */
  analyzeInput(input) {
    const inputLower = input.toLowerCase();
    const matches = [];

    Object.entries(CHANGE_PATTERNS).forEach(([category, pattern]) => {
      let confidence = 0;
      let matchedKeywords = [];

      // Keyword matching
      pattern.keywords.forEach(keyword => {
        if (inputLower.includes(keyword)) {
          confidence += 20;
          matchedKeywords.push(keyword);
        }
      });

      // Context analysis
      confidence += this.analyzeContext(inputLower, category);

      if (confidence > 0) {
        matches.push({
          category,
          pattern,
          confidence: Math.min(confidence, 100),
          matchedKeywords
        });
      }
    });

    // Sort by confidence
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze context for better accuracy
   */
  analyzeContext(input, category) {
    let contextScore = 0;

    // Visual context
    if (category === 'visual') {
      if (input.includes('look') || input.includes('appear') || input.includes('show')) {
        contextScore += 15;
      }
      if (input.includes('smooth') || input.includes('transition')) {
        contextScore += 10;
      }
    }

    // Interaction context
    if (category === 'interaction') {
      if (input.includes('when') || input.includes('user') || input.includes('click')) {
        contextScore += 15;
      }
      if (input.includes('not working') || input.includes('not responding')) {
        contextScore += 20;
      }
    }

    // Layout context
    if (category === 'layout') {
      if (input.includes('position') || input.includes('center') || input.includes('align')) {
        contextScore += 15;
      }
      if (input.includes('mobile') || input.includes('desktop')) {
        contextScore += 10;
      }
    }

    return contextScore;
  }

  /**
   * Provide specific recommendations
   */
  provideRecommendations(analysis) {
    if (analysis.length === 0) return;

    const topMatch = analysis[0];

    console.log('🔧 RECOMMENDATIONS:');
    console.log('==================\n');

    if (topMatch.pattern.primaryFile === 'ANALYSIS REQUIRED') {
      console.log('🔍 BUG FIX DETECTED - Diagnostic Required:');
      console.log('   1. Run: npm run validate:architecture');
      console.log('   2. Check browser console for errors');
      console.log('   3. Test on mobile vs desktop');
      console.log('   4. Review recent changes in git');
      console.log('');
      console.log('📋 Common bug fix patterns:');
      topMatch.pattern.examples.forEach(example => {
        console.log(`   • ${example}`);
      });
    } else {
      console.log(`🎯 Primary file to modify: ${topMatch.pattern.primaryFile}`);
      
      if (topMatch.pattern.secondaryFiles.length > 0) {
        console.log(`📁 Secondary files to check: ${topMatch.pattern.secondaryFiles.join(', ')}`);
      }

      console.log('\n💡 Example changes for this category:');
      topMatch.pattern.examples.forEach(example => {
        console.log(`   • ${example}`);
      });

      console.log('\n✅ Next steps:');
      console.log(`   1. Open ${topMatch.pattern.primaryFile}`);
      console.log('   2. Review docs/ARCHITECTURE_GUIDELINES.md');
      console.log('   3. Make changes following component responsibilities');
      console.log('   4. Run: npm run validate:architecture');
      console.log('   5. Test the changes');
    }

    // Show validation command
    console.log('\n🔍 Validate your changes:');
    console.log('   npm run validate:architecture');
    console.log('   npm run check:siri-components');
  }

  /**
   * Show general guidance when no specific match found
   */
  showGeneralGuidance() {
    console.log('\n❓ I couldn\'t determine the specific change type.');
    console.log('Here\'s the general guidance:\n');

    console.log('📋 COMPONENT RESPONSIBILITIES:');
    Object.entries(CHANGE_PATTERNS).forEach(([category, pattern]) => {
      if (pattern.primaryFile !== 'ANALYSIS REQUIRED') {
        console.log(`   ${category.toUpperCase()}: ${pattern.primaryFile}`);
        console.log(`      → ${pattern.description}`);
      }
    });

    console.log('\n🤔 Try being more specific:');
    console.log('   • "I want to add a new animation"');
    console.log('   • "The button is not responding to touch"');
    console.log('   • "I need to change the color theme"');
    console.log('   • "The layout looks wrong on mobile"');
  }

  /**
   * Helper to ask questions
   */
  askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// 🚀 EXECUTION
if (require.main === module) {
  const guidance = new ChangeGuidanceSystem();
  guidance.start().catch(console.error);
}

module.exports = { ChangeGuidanceSystem, CHANGE_PATTERNS }; 