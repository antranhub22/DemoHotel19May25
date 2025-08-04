-- Migration: Rename column 'name' to 'hotel_name' in tenants table

-- For PostgreSQL
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='tenants' AND column_name='name'
    ) THEN
        ALTER TABLE tenants RENAME COLUMN name TO hotel_name;
    END IF;
END$$;

-- For SQLite (if needed, use Prisma migrate)
-- Use prisma migrate dev to handle SQLite migrations 