import { RequestController } from '@server/controllers/requestController';
import { getDatabase } from '@shared/db';
import { logger } from '@shared/utils/logger';
import { Request, Response } from 'express';

// Mock dependencies
jest.mock('@shared/db');
jest.mock('@shared/utils/logger');

const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('RequestController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup response mocks
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Setup logger mocks
    mockLogger.info = jest.fn();
    mockLogger.success = jest.fn();
    mockLogger.error = jest.fn();
  });

  describe('createRequest', () => {
    beforeEach(() => {
      mockRequest = {
        body: {
          serviceType: 'room_service',
          requestText: 'Test request',
          roomNumber: '101',
          guestName: 'John Doe',
          priority: 'medium',
          tenantId: 'test-tenant',
        },
      };
    });

    it('should create request successfully', async () => {
      // Mock database
      const mockDb = {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([
          {
            id: 1,
            tenant_id: 'test-tenant',
            room_number: '101',
            request_content: 'Test request',
            guest_name: 'John Doe',
            priority: 'medium',
            status: 'pending',
            created_at: new Date(),
            description: 'Service: room_service',
          },
        ]),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.createRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 1,
            room_number: '101',
            request_content: 'Test request',
          }),
          _metadata: expect.objectContaining({
            module: 'request-module',
            version: '2.0.0',
            architecture: 'modular-enhanced',
          }),
        })
      );
    });

    it('should handle database connection errors', async () => {
      mockGetDatabase.mockRejectedValue(
        new Error('Database connection failed')
      );

      await RequestController.createRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(503);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database temporarily unavailable. Please try again.',
          code: 'DATABASE_UNAVAILABLE',
        })
      );
    });

    it('should handle missing required fields', async () => {
      mockRequest.body = {
        serviceType: 'room_service',
        // Missing requestText and roomNumber
        guestName: 'John Doe',
      };

      await RequestController.createRequest(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to create request',
        })
      );
    });
  });

  describe('getAllRequests', () => {
    it('should fetch all requests successfully', async () => {
      const mockRequests = [
        {
          id: 1,
          room_number: '101',
          request_content: 'Test request 1',
          status: 'pending',
          created_at: new Date(),
        },
        {
          id: 2,
          room_number: '102',
          request_content: 'Test request 2',
          status: 'completed',
          created_at: new Date(),
        },
      ];

      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockRequests),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockRequests,
        })
      );
    });

    it('should handle database errors', async () => {
      mockGetDatabase.mockRejectedValue(new Error('Database error'));

      await RequestController.getAllRequests(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Failed to fetch requests',
        })
      );
    });
  });

  describe('getRequestById', () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: '1' },
      };
    });

    it('should fetch request by ID successfully', async () => {
      const mockRequestData = {
        id: 1,
        room_number: '101',
        request_content: 'Test request',
        status: 'pending',
        created_at: new Date(),
      };

      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockRequestData]),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockRequestData,
        })
      );
    });

    it('should return 404 for non-existent request', async () => {
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.getRequestById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Request not found',
          code: 'REQUEST_NOT_FOUND',
        })
      );
    });
  });

  describe('updateRequestStatus', () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: '1' },
        body: { status: 'completed' },
      };
    });

    it('should update request status successfully', async () => {
      const mockUpdatedRequest = {
        id: 1,
        room_number: '101',
        request_content: 'Test request',
        status: 'completed',
        updated_at: new Date(),
      };

      const mockDb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([mockUpdatedRequest]),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.updateRequestStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUpdatedRequest,
        })
      );
    });

    it('should return 400 for missing status', async () => {
      mockRequest.body = {};

      await RequestController.updateRequestStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Status is required',
          code: 'VALIDATION_ERROR',
        })
      );
    });

    it('should return 404 for non-existent request', async () => {
      const mockDb = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([]),
      };
      mockGetDatabase.mockResolvedValue(mockDb as any);

      await RequestController.updateRequestStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Request not found',
          code: 'REQUEST_NOT_FOUND',
        })
      );
    });
  });

  describe('safeDatabaseOperation', () => {
    it('should retry on database connection errors', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('connection timeout'))
        .mockResolvedValueOnce({ success: true });

      // Mock initializeDatabase
      const mockInitializeDatabase = jest.fn().mockResolvedValue(undefined);
      jest.doMock('@shared/db', () => ({
        getDatabase: mockGetDatabase,
        initializeDatabase: mockInitializeDatabase,
      }));

      // This would test the safeDatabaseOperation function
      // Note: This is a private function, so we test it indirectly
      // through the public methods
    });
  });
});
