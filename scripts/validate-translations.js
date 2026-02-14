#!/usr/bin/env node

/**
 * T046: Validation script to ensure translation key consistency
 * Verifies all keys exist in both de.json and en.json
 */

import deTranslations from '../src/locales/de.json' assert { type: 'json' };
import enTranslations from '../src/locales/en.json' assert { type: 'json' };

function flattenObject(obj, prefix = '') {
  const keys = new Set();
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = flattenObject(value, fullKey);
      nested.forEach(k => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  
  return keys;
}

function validateTranslations() {
  console.log('🔍 Validating translation keys...\n');
  
  const deKeys = flattenObject(deTranslations);
  const enKeys = flattenObject(enTranslations);
  
  console.log(`📊 Statistics:`);
  console.log(`   German keys: ${deKeys.size}`);
  console.log(`   English keys: ${enKeys.size}\n`);
  
  // Find missing keys
  const missingInDE = [...enKeys].filter(key => !deKeys.has(key));
  const missingInEN = [...deKeys].filter(key => !enKeys.has(key));
  
  let hasErrors = false;
  
  if (missingInDE.length > 0) {
    hasErrors = true;
    console.error('❌ Keys missing in de.json:');
    missingInDE.forEach(key => console.error(`   - ${key}`));
    console.log('');
  }
  
  if (missingInEN.length > 0) {
    hasErrors = true;
    console.error('❌ Keys missing in en.json:');
    missingInEN.forEach(key => console.error(`   - ${key}`));
    console.log('');
  }
  
  if (hasErrors) {
    console.error('❌ Translation validation FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ All translation keys are consistent!\n');
    console.log(`✅ Total keys validated: ${deKeys.size}`);
    process.exit(0);
  }
}

validateTranslations();
