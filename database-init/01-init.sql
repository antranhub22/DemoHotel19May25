-- Database initialization for production-local testing
-- This file runs when PostgreSQL container starts for the first time

-- Create the database (already created by POSTGRES_DB env var)
-- But we can add additional setup here

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE demovoicehotelsaas_prod_local TO postgres;

-- Create indexes for performance (will be created by Prisma migrations)
-- But we can add custom indexes here if needed

-- Log successful initialization
INSERT INTO pg_stat_statements_info VALUES ('Database initialized for production-local testing') 
ON CONFLICT DO NOTHING;