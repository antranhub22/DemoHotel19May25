import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return (res as any).status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
      }
      return (res as any).status(500).json({
        success: false,
        error: 'Validation error',
      });
    }
  };
}
