/**
 * 🏭 QUERY BUILDER FACTORY
 *
 * Centralized factory for creating optimized query builders
 * for all entities in the system
 */

import { PrismaClient } from "../../../generated/prisma";
import { QueryBuilder } from "./QueryBuilder";

export class QueryBuilderFactory {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // ======================================
  // ENTITY QUERY BUILDERS
  // ======================================

  request(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "request", "tenant_id");
  }

  call(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "call", "tenant_id");
  }

  transcript(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "transcript", "tenant_id");
  }

  staff(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "staff", "tenant_id");
  }

  tenants(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "tenants", "id"); // Different tenant field for tenants table
  }

  callSummaries(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "call_summaries", "tenant_id");
  }

  services(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "services", "tenant_id");
  }

  hotelProfiles(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "hotel_profiles", "tenant_id");
  }

  orderItems(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "order_items", "tenant_id");
  }

  message(): QueryBuilder<any> {
    return new QueryBuilder(this.prisma, "message", "tenant_id");
  }
}

// ======================================
// GLOBAL FACTORY INSTANCE
// ======================================

let globalFactory: QueryBuilderFactory | null = null;

export function createQueryBuilderFactory(
  prisma: PrismaClient,
): QueryBuilderFactory {
  if (!globalFactory) {
    globalFactory = new QueryBuilderFactory(prisma);
  }
  return globalFactory;
}

export function getQueryBuilderFactory(): QueryBuilderFactory {
  if (!globalFactory) {
    throw new Error(
      "QueryBuilderFactory not initialized. Call createQueryBuilderFactory first.",
    );
  }
  return globalFactory;
}
