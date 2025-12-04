#!/usr/bin/env node

/**
 * Helper script to display the SQL that needs to be run in Supabase
 * This script reads the SQL file and displays it clearly for copy-paste
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n📋 SQL to Run in Supabase\n');
console.log('='.repeat(60));
console.log('Copy the SQL below and paste it into Supabase SQL Editor:');
console.log('='.repeat(60));
console.log('\n');

try {
  const sqlFile = join(__dirname, 'supabase-schema.sql');
  const sql = readFileSync(sqlFile, 'utf-8');
  console.log(sql);
  console.log('\n');
  console.log('='.repeat(60));
  console.log('\n📝 Instructions:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Click "SQL Editor" in the left sidebar');
  console.log('4. Click "New Query"');
  console.log('5. Paste the SQL above');
  console.log('6. Click "Run" (or press Ctrl+Enter / Cmd+Enter)');
  console.log('7. You should see "Success. No rows returned"');
  console.log('\n✅ After running, refresh your app and try submitting a score!\n');
} catch (error) {
  console.error('Error reading SQL file:', error.message);
  process.exit(1);
}

