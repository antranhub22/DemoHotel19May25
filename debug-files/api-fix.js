// ============================================
// PRODUCTION API FIXES
// ============================================

// ✅ FIX: Enhanced request controller with better error handling
export class RequestController {
  static async getAllRequests(req, res) {
    try {
      console.log('📋 [RequestController] Getting all requests...');

      // ✅ FIX: Use safe database operation
      const requests = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db.query.requests.findMany({
          orderBy: { createdAt: 'desc' },
          limit: 100,
        });
      });

      res.json({ success: true, data: requests });
    } catch (error) {
      console.error('❌ [RequestController] Failed to fetch requests:', error);

      // ✅ FIX: Better error responses
      if (error.message.includes('Database connection error')) {
        res.status(503).json({
          success: false,
          error: 'Database temporarily unavailable. Please try again.',
          code: 'DATABASE_UNAVAILABLE',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch requests',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }
  }

  static async createRequest(req, res) {
    try {
      console.log('📝 [RequestController] Creating new request...');

      const { serviceType, requestText, roomNumber, guestName, priority } =
        req.body;

      // ✅ FIX: Use safe database operation
      const newRequest = await safeDatabaseOperation(async () => {
        const db = await getDatabase();
        return await db
          .insert(requests)
          .values({
            serviceType,
            requestText,
            roomNumber,
            guestName,
            priority: priority || 'medium',
            status: 'pending',
            createdAt: new Date(),
          })
          .returning();
      });

      res.status(201).json({
        success: true,
        data: newRequest[0],
      });
    } catch (error) {
      console.error('❌ [RequestController] Failed to create request:', error);

      if (error.message.includes('Database connection error')) {
        res.status(503).json({
          success: false,
          error: 'Database temporarily unavailable. Please try again.',
          code: 'DATABASE_UNAVAILABLE',
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to create request',
          details:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    }
  }
}
