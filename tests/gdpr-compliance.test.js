const { exportUserData, deleteUserData, logAuditEvent } = require('../lib/firestore');

// Mock Firebase admin
jest.mock('firebase-admin', () => ({
  auth: jest.fn(() => ({
    getUser: jest.fn(),
    deleteUser: jest.fn(),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        delete: jest.fn(),
      }),
      where: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    }),
  })),
}));

describe('GDPR Compliance Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Export', () => {
    test('exports complete user data structure', async () => {
      const mockUserProfile = {
        uid: 'test-user',
        email: 'test@example.com',
        preferences: { costPriority: 70, renewablePriority: 30 },
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date('2024-01-15'),
        gdprConsent: {
          analytics: true,
          marketing: false,
          dataProcessing: true,
          dataStorage: false,
          lastUpdated: new Date('2024-01-10'),
          version: '1.0',
        },
      };

      const mockRecommendations = [
        {
          id: 'rec-1',
          userId: 'test-user',
          formData: { currentPlan: { supplier: 'Test', rate: 12 } },
          recommendations: [],
          createdAt: new Date('2024-01-05'),
        },
      ];

      const mockUsageData = [
        {
          id: 'usage-1',
          userId: 'test-user',
          parsedData: { monthlyTotals: [] },
          originalXmlHash: 'test-hash',
          createdAt: new Date('2024-01-05'),
        },
      ];

      const mockAuditLogs = [
        {
          id: 'audit-1',
          userId: 'test-user',
          action: 'data_export',
          timestamp: new Date('2024-01-15'),
          details: { format: 'json' },
        },
      ];

      // Mock the internal functions
      const originalGetUserProfile = require('../lib/firestore').getUserProfile;
      const originalGetUserRecommendations = require('../lib/firestore').getUserRecommendations;
      const originalGetUserUsageData = require('../lib/firestore').getUserUsageData;
      const originalGetUserAuditLogs = require('../lib/firestore').getUserAuditLogs;

      require('../lib/firestore').getUserProfile = jest.fn().mockResolvedValue(mockUserProfile);
      require('../lib/firestore').getUserRecommendations = jest.fn().mockResolvedValue(mockRecommendations);
      require('../lib/firestore').getUserUsageData = jest.fn().mockResolvedValue(mockUsageData);
      require('../lib/firestore').getUserAuditLogs = jest.fn().mockResolvedValue(mockAuditLogs);

      const result = await exportUserData('test-user');

      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('usageData');
      expect(result).toHaveProperty('auditLogs');
      expect(result).toHaveProperty('exportDate');

      expect(result.profile.uid).toBe('test-user');
      expect(result.recommendations).toHaveLength(1);
      expect(result.usageData).toHaveLength(1);
      expect(result.auditLogs).toHaveLength(1);

      // Restore original functions
      require('../lib/firestore').getUserProfile = originalGetUserProfile;
      require('../lib/firestore').getUserRecommendations = originalGetUserRecommendations;
      require('../lib/firestore').getUserUsageData = originalGetUserUsageData;
      require('../lib/firestore').getUserAuditLogs = originalGetUserAuditLogs;
    });

    test('handles missing data gracefully', async () => {
      // Mock functions to return null/empty data
      require('../lib/firestore').getUserProfile = jest.fn().mockResolvedValue(null);
      require('../lib/firestore').getUserRecommendations = jest.fn().mockResolvedValue([]);
      require('../lib/firestore').getUserUsageData = jest.fn().mockResolvedValue([]);
      require('../lib/firestore').getUserAuditLogs = jest.fn().mockResolvedValue([]);

      const result = await exportUserData('test-user');

      expect(result.profile).toBeNull();
      expect(result.recommendations).toEqual([]);
      expect(result.usageData).toEqual([]);
      expect(result.auditLogs).toEqual([]);
      expect(result).toHaveProperty('exportDate');
    });
  });

  describe('Data Deletion', () => {
    test('deletes data from all collections', async () => {
      const mockDeleteDoc = jest.fn().mockResolvedValue(undefined);
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: [
          { ref: { delete: mockDeleteDoc } },
          { ref: { delete: mockDeleteDoc } },
        ],
      });

      // Mock Firestore operations
      const mockWhere = jest.fn().mockReturnValue({
        get: mockGetDocs,
      });
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDeleteDoc,
        }),
        where: mockWhere,
      });

      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: mockCollection,
        },
      }));

      const result = await deleteUserData('test-user');

      expect(result).toContain('users');
      expect(result).toContain('recommendations');
      expect(result).toContain('usageData');
      expect(result).toContain('auditLogs');

      // Should delete user profile + multiple docs from each collection
      expect(mockDeleteDoc).toHaveBeenCalledTimes(5); // 1 user + 2 recs + 2 usage + 0 audit
    });

    test('continues deletion even if some operations fail', async () => {
      const mockDeleteDoc = jest.fn()
        .mockResolvedValueOnce(undefined) // user profile succeeds
        .mockRejectedValueOnce(new Error('Delete failed')) // recommendation fails
        .mockResolvedValueOnce(undefined); // usage data succeeds

      // Mock to return some docs
      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: [{ ref: { delete: mockDeleteDoc } }],
      });

      const mockWhere = jest.fn().mockReturnValue({
        get: mockGetDocs,
      });

      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          delete: mockDeleteDoc,
        }),
        where: mockWhere,
      });

      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: mockCollection,
        },
      }));

      const result = await deleteUserData('test-user');

      // Should still return collections that were attempted
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('Audit Logging', () => {
    test('logs data export events', async () => {
      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        set: mockSetDoc,
      });
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: mockCollection,
        },
      }));

      await logAuditEvent('test-user', 'data_export', { format: 'json' });

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user',
          action: 'data_export',
          details: { format: 'json' },
        })
      );
    });

    test('logs data deletion events', async () => {
      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        set: mockSetDoc,
      });
      const mockCollection = jest.fn().mockReturnValue({
        doc: mockDoc,
      });

      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: mockCollection,
        },
      }));

      await logAuditEvent('test-user', 'data_deletion', { completedAt: new Date() });

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user',
          action: 'data_deletion',
          details: expect.any(Object),
        })
      );
    });
  });
});

describe('API Route Tests', () => {
  describe('Data Export API', () => {
    test('POST /api/data-export returns user data', async () => {
      const mockExportUserData = jest.fn().mockResolvedValue({
        profile: { uid: 'test-user' },
        recommendations: [],
        exportDate: new Date().toISOString(),
      });

      const mockLogAuditEvent = jest.fn().mockResolvedValue('audit-id');

      // Mock the functions
      require('../lib/firestore').exportUserData = mockExportUserData;
      require('../lib/firestore').logAuditEvent = mockLogAuditEvent;

      const { POST } = require('../app/api/data-export/route');

      const request = {
        json: jest.fn().mockResolvedValue({ userId: 'test-user' }),
      };

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.data.profile.uid).toBe('test-user');
      expect(mockLogAuditEvent).toHaveBeenCalledWith(
        'test-user',
        'data_export',
        expect.objectContaining({ exportFormat: 'json' })
      );
    });

    test('GET /api/data-export returns downloadable file', async () => {
      const mockExportUserData = jest.fn().mockResolvedValue({
        profile: { uid: 'test-user' },
        recommendations: [],
      });

      require('../lib/firestore').exportUserData = mockExportUserData;

      const { GET } = require('../app/api/data-export/route');

      const url = new URL('http://localhost/api/data-export?userId=test-user');
      const request = { url };

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
    });
  });

  describe('Data Deletion API', () => {
    test('POST /api/data-deletion deletes user data with valid confirmation', async () => {
      const mockDeleteUserData = jest.fn().mockResolvedValue(['users', 'recommendations']);
      const mockLogAuditEvent = jest.fn().mockResolvedValue('audit-id');

      // Mock admin auth
      const mockGetAuth = jest.fn(() => ({
        getUser: jest.fn().mockResolvedValue({ uid: 'test-user' }),
        deleteUser: jest.fn().mockResolvedValue(undefined),
      }));

      jest.doMock('firebase-admin', () => ({
        auth: mockGetAuth,
      }));

      require('../lib/firestore').deleteUserData = mockDeleteUserData;
      require('../lib/firestore').logAuditEvent = mockLogAuditEvent;

      const { POST } = require('../app/api/data-deletion/route');

      const request = {
        json: jest.fn().mockResolvedValue({
          userId: 'test-user',
          confirmationCode: 'DELETE_test-user_2024-01-01',
        }),
      };

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.status).toBe('deleted');
      expect(result.deletedCollections).toContain('users');
    });

    test('rejects deletion with invalid confirmation code', async () => {
      const { POST } = require('../app/api/data-deletion/route');

      const request = {
        json: jest.fn().mockResolvedValue({
          userId: 'test-user',
          confirmationCode: 'INVALID_CODE',
        }),
      };

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('Invalid confirmation code');
    });
  });
});


