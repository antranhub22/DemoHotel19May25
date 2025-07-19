/**
 * Database Transformation Utilities
 * Handles camelCase ↔ snake_case conversion at API boundary
 */

// ✅ SOLUTION 1: Field mapping utilities
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// ✅ SOLUTION 2: Object transformation
export const transformObjectToCamelCase = <T = any>(obj: any): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(transformObjectToCamelCase) as T;
  }
  
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key);
    transformed[camelKey] = typeof value === 'object' ? transformObjectToCamelCase(value) : value;
  }
  return transformed;
};

export const transformObjectToSnakeCase = <T = any>(obj: any): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(transformObjectToSnakeCase) as T;
  }
  
  const transformed: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    transformed[snakeKey] = typeof value === 'object' ? transformObjectToSnakeCase(value) : value;
  }
  return transformed;
};

// ✅ SOLUTION 3: Type-safe request mapping
export interface RequestTransformConfig {
  includeFields?: string[];
  excludeFields?: string[];
  customMappings?: Record<string, string>;
}

export const createRequestMapper = (config: RequestTransformConfig = {}) => {
  return {
    toDatabase: <T = any>(frontendData: any): T => {
      const { customMappings = {}, excludeFields = [] } = config;
      
      const transformed = transformObjectToSnakeCase(frontendData);
      
      // Apply custom mappings
      Object.entries(customMappings).forEach(([frontendKey, dbKey]) => {
        if (frontendData[frontendKey] !== undefined) {
          transformed[dbKey] = frontendData[frontendKey];
          delete transformed[toSnakeCase(frontendKey)];
        }
      });
      
      // Remove excluded fields
      excludeFields.forEach(field => {
        delete transformed[field];
      });
      
      return transformed;
    },
    
    toFrontend: <T = any>(dbData: any): T => {
      const { customMappings = {} } = config;
      
      const transformed = transformObjectToCamelCase(dbData);
      
      // Apply reverse custom mappings
      const reverseMappings = Object.fromEntries(
        Object.entries(customMappings).map(([frontendKey, dbKey]) => [dbKey, frontendKey])
      );
      
      Object.entries(reverseMappings).forEach(([dbKey, frontendKey]) => {
        if (dbData[dbKey] !== undefined) {
          transformed[frontendKey] = dbData[dbKey];
          delete transformed[toCamelCase(dbKey)];
        }
      });
      
      return transformed;
    }
  };
};

// ✅ SOLUTION 4: Request-specific mappers
export const requestMapper = createRequestMapper({
  customMappings: {
    callId: 'call_id',
    roomNumber: 'room_number',
    orderId: 'order_id',
    requestContent: 'request_content',
    tenantId: 'tenant_id',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  excludeFields: ['id'] // Auto-generated fields
});

// ✅ SOLUTION 5: API middleware integration
export const withTransformation = (handler: Function) => {
  return async (req: any, res: any) => {
    // Transform incoming camelCase to snake_case
    req.transformedBody = requestMapper.toDatabase(req.body);
    
    // Execute original handler
    const result = await handler(req, res);
    
    // Transform outgoing snake_case to camelCase (if response is object)
    if (result && typeof result === 'object' && result.data) {
      result.data = requestMapper.toFrontend(result.data);
    }
    
    return result;
  };
}; 