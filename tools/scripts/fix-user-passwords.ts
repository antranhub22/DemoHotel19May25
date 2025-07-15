#!/usr/bin/env tsx

import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';

// Database connection
const dbPath = path.join(process.cwd(), 'dev.db');
const db = new Database(dbPath);

async function fixUserPasswords() {
  console.log('🔧 Fixing password hashes for frontdesk and itmanager users...\n');

  const usersToFix = [
    { username: 'frontdesk', password: 'frontdesk123' },
    { username: 'itmanager', password: 'itmanager123' },
  ];

  for (const user of usersToFix) {
    console.log(`Fixing password for: ${user.username}`);
    
    // Generate new hash
    const newHash = await bcrypt.hash(user.password, 10);
    console.log(`📋 New hash: ${newHash.substring(0, 20)}...`);
    
    // Update in database
    const result = db.prepare('UPDATE staff SET password = ? WHERE username = ?').run(newHash, user.username);
    
    if (result.changes > 0) {
      console.log(`✅ Password updated for ${user.username}`);
      
      // Test the new hash
      const testValid = await bcrypt.compare(user.password, newHash);
      console.log(`🔄 Hash verification test: ${testValid ? '✅ VALID' : '❌ STILL INVALID'}`);
    } else {
      console.log(`❌ User ${user.username} not found or not updated`);
    }
    
    console.log('---');
  }
  
  console.log('✅ Password fix completed');
  db.close();
}

fixUserPasswords().catch(console.error); 