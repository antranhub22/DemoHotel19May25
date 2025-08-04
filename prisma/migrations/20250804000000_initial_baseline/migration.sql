-- CreateTable
CREATE TABLE IF NOT EXISTS "call_summaries" (
    "id" SERIAL NOT NULL,
    "call_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "room_number" TEXT,
    "duration" TEXT,

    CONSTRAINT "call_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hotel_profiles" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT,
    "hotel_name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "amenities" TEXT,
    "policies" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "research_data" TEXT,
    "assistant_config" TEXT,
    "vapi_assistant_id" TEXT,
    "services_config" TEXT,
    "knowledge_base" TEXT,
    "system_prompt" TEXT,

    CONSTRAINT "hotel_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "services" (
    "id" SERIAL NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "price" REAL NOT NULL,
    "currency" VARCHAR(10) DEFAULT 'VND',
    "category" VARCHAR(50) NOT NULL,
    "subcategory" VARCHAR(50),
    "is_active" BOOLEAN DEFAULT true,
    "estimated_time" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "staff" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR(50) DEFAULT 'front-desk',
    "tenant_id" TEXT,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "email" VARCHAR(100),
    "phone" VARCHAR(20),
    "is_active" BOOLEAN DEFAULT true,
    "display_name" VARCHAR(255),
    "avatar_url" TEXT,
    "permissions" TEXT DEFAULT '[]',
    "last_login" TIMESTAMP(6),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "call" (
    "id" SERIAL NOT NULL,
    "tenant_id" TEXT,
    "call_id_vapi" TEXT,
    "room_number" VARCHAR(20),
    "language" VARCHAR(10) DEFAULT 'en',
    "service_type" VARCHAR(100),
    "duration" INTEGER,
    "start_time" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transcript" (
    "id" SERIAL NOT NULL,
    "call_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT DEFAULT 'default',

    CONSTRAINT "transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "message" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL DEFAULT 1,
    "sender" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "request" (
    "id" SERIAL NOT NULL,
    "room" VARCHAR(255) NOT NULL,
    "order_id" VARCHAR(255) NOT NULL,
    "guest_name" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "call_id" VARCHAR(255),
    "tenant_id" VARCHAR(255),
    "description" TEXT,
    "priority" VARCHAR(50) DEFAULT 'medium',
    "assigned_to" VARCHAR(255),
    "completed_at" TIMESTAMP(6),
    "metadata" TEXT,
    "type" VARCHAR(50) DEFAULT 'order',
    "total_amount" DECIMAL(10,2),
    "items" TEXT,
    "delivery_time" TIMESTAMP(6),
    "special_instructions" TEXT,
    "order_type" VARCHAR(100),
    "service_id" VARCHAR(255),
    "urgency" VARCHAR(20),

    CONSTRAINT "request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tenants" (
    "id" TEXT NOT NULL,
    "hotel_name" VARCHAR(200),
    "subdomain" VARCHAR(50) NOT NULL,
    "custom_domain" VARCHAR(100),
    "subscription_plan" VARCHAR(50) DEFAULT 'trial',
    "subscription_status" VARCHAR(50) DEFAULT 'active',
    "trial_ends_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "max_voices" INTEGER DEFAULT 5,
    "max_languages" INTEGER DEFAULT 4,
    "voice_cloning" BOOLEAN DEFAULT false,
    "multi_location" BOOLEAN DEFAULT false,
    "white_label" BOOLEAN DEFAULT false,
    "data_retention_days" INTEGER DEFAULT 90,
    "monthly_call_limit" INTEGER DEFAULT 1000,
    "name" VARCHAR(200),
    "is_active" BOOLEAN DEFAULT true,
    "settings" TEXT,
    "tier" VARCHAR(50) DEFAULT 'free',
    "max_calls" INTEGER DEFAULT 1000,
    "max_users" INTEGER DEFAULT 10,
    "features" TEXT,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "orders" (
    "id" SERIAL NOT NULL,
    "call_id" TEXT NOT NULL,
    "room_number" TEXT NOT NULL,
    "order_type" TEXT NOT NULL,
    "delivery_time" TEXT NOT NULL,
    "special_instructions" TEXT,
    "items" JSONB NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_call_summaries_call_id" ON "call_summaries"("call_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_call_summaries_timestamp" ON "call_summaries"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "staff_username_unique" ON "staff"("username");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "call_call_id_vapi_key" ON "call"("call_id_vapi");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tenants_subdomain_key" ON "tenants"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "hotel_profiles" ADD CONSTRAINT IF NOT EXISTS "fk_hotel_profiles_tenant" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT IF NOT EXISTS "services_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "call" ADD CONSTRAINT IF NOT EXISTS "call_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT IF NOT EXISTS "message_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;