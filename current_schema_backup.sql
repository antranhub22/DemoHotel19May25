CREATE TABLE call_summaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        call_id TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE tenants (
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
CREATE TABLE staff (
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
CREATE INDEX idx_staff_username ON staff(username);
CREATE INDEX idx_staff_tenant ON staff(tenant_id);
