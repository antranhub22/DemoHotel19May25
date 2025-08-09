/**
 * Barrel exports for utils directory
 */

// Text processing
export { processText, applySmartSpacing } from './textProcessing.ts';

// Dictionary
export { findInDictionary } from './dictionary.ts';

// Dictionary data
export { englishDictionary } from './dictionary/englishDictionary.ts';
export { default as dictionaryData } from './dictionary/dictionary.json';
