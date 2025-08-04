import { logger } from "@shared/utils/logger";
import { Request, Response } from "express";

// ✅ NEW: Phase 1 imports for validation and response standardization
import { getValidatedData } from "@server/middleware/requestValidation";
import { RequestService } from "@server/services/RequestService";
import { isFeatureEnabled } from "@server/shared/FeatureFlags";
import { ResponseWrapper } from "@shared/utils/responseWrapper";
import {
  CreateRequestInput,
  CreateRequestSchema,
  formatValidationErrors,
  validateRequestData,
} from "@shared/validation/requestSchemas";

// 🔄 NEW: Prisma integration imports
import { DatabaseServiceFactory } from "@shared/db/DatabaseServiceFactory";

// ✅ FIX: Enhanced error handling for database operations with fallback
