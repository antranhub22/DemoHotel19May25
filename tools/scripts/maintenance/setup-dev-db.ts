#!/usr/bin/env node

// Script to setup SQLite database for development
import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';

const DB_PATH = './apps/dev.db';

console.log('🔧 Setting up SQLite database for development...');

// Create database directory if not exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open database
const db = new Database(DB_PATH);

// Create tables
db.exec(`
  -- Tenants table
  CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    hotel_name TEXT,
    subdomain TEXT,
    subscription_plan TEXT,
    subscription_status TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    is_active INTEGER DEFAULT 1,
    tier TEXT,
    max_calls INTEGER,
    max_users INTEGER
  );

  -- Staff table
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    role TEXT,
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    last_login INTEGER,
    permissions TEXT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
  CREATE INDEX IF NOT EXISTS idx_staff_tenant ON staff(tenant_id);
`);

console.log('✅ Tables created');

// Create default tenant
const tenantId = 'mi-nhon-hotel';
const checkTenant = db
  .prepare('SELECT id FROM tenants WHERE id = ?')
  .get(tenantId);

if (!checkTenant) {
  db.prepare(
    `
    INSERT INTO tenants (
      id, hotel_name, subdomain, subscription_plan, subscription_status,
      created_at, updated_at, is_active, tier, max_calls, max_users
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
  ).run(
    tenantId,
    'Mi Nhon Hotel',
    'minhonmuine',
    'premium',
    'active',
    Math.floor(Date.now() / 1000),
    Math.floor(Date.now() / 1000),
    1,
    'premium',
    5000,
    50
  );
  console.log('✅ Default tenant created');
}

// Create default users
const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'super_admin',
    displayName: 'System Administrator',
    email: 'admin@minhonhotel.com',
  },
  {
    username: 'manager',
    password: 'manager123',
    role: 'hotel-manager',
    displayName: 'Hotel Manager',
    email: 'manager@minhonhotel.com',
  },
  {
    username: 'frontdesk',
    password: 'frontdesk123',
    role: 'front-desk',
    displayName: 'Front Desk Staff',
    email: 'frontdesk@minhonhotel.com',
  },
  {
    username: 'itmanager',
    password: 'itmanager123',
    role: 'it-manager',
    displayName: 'IT Manager',
    email: 'itmanager@minhonhotel.com',
  },
  {
    username: 'staff',
    password: 'staff123',
    role: 'front-desk',
    displayName: 'General Staff',
    email: 'staff@minhonhotel.com',
  },
];

for (const user of (users as any[])) {
  const checkUser = db
    .prepare('SELECT id FROM staff WHERE username = ?')
    .get(user.username);
  const hashedPassword = bcrypt.hashSync(user.password, 10);

  if (checkUser) {
    // Update existing user
    db.prepare(
      `
      UPDATE staff SET
        password = ?,
        email = ?,
        role = ?,
        display_name = ?,
        tenant_id = ?,
        is_active = ?,
        updated_at = ?
      WHERE username = ?
    `
    ).run(
      hashedPassword,
      user.email,
      user.role,
      user.displayName,
      tenantId,
      1,
      Math.floor(Date.now() / 1000),
      user.username
    );
    console.log(`✅ Updated user: ${user.username}`);
  } else {
    // Create new user
    db.prepare(
      `
      INSERT INTO staff (
        id, tenant_id, username, password, email, role, display_name,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      `${user.username}-${Date.now()}`,
      tenantId,
      user.username,
      hashedPassword,
      user.email,
      user.role,
      user.displayName,
      1,
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000)
    );
    console.log(`✅ Created user: ${user.username}`);
  }
}

// Verify setup
console.log('\n📋 Database setup completed!');
console.log('\n📝 Test credentials:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
for (const user of (users as any[])) {
  console.log(`   ${user.username} / ${user.password} (${user.role})`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

db.close();
