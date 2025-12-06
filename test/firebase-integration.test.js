const { initializeTestApp, assertSucceeds, assertFails } = require('@firebase/testing');
const admin = require('firebase-admin');

// Mock the firebase-admin module
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    getUser: jest.fn(),
    deleteUser: jest.fn(),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(),
    doc: jest.fn(),
  })),
}));

describe('Firestore Security Rules', () => {
  let testApp;
  const projectId = 'energy-plan-test';

  beforeEach(async () => {
    testApp = initializeTestApp({
      projectId,
      auth: { uid: 'test-user' }
    });
  });

  afterEach(async () => {
    await testApp.delete();
  });

  describe('User Profile Access', () => {
    test('allows users to read their own profile', async () => {
      const db = testApp.firestore();
      const userDoc = db.collection('users').doc('test-user');

      await assertSucceeds(userDoc.get());
    });

    test('allows users to write their own profile', async () => {
      const db = testApp.firestore();
      const userDoc = db.collection('users').doc('test-user');

      await assertSucceeds(
        userDoc.set({
          uid: 'test-user',
          email: 'test@example.com',
          preferences: { costPriority: 70, renewablePriority: 30 },
        })
      );
    });

    test('denies users from reading other users profiles', async () => {
      const db = testApp.firestore();
      const otherUserDoc = db.collection('users').doc('other-user');

      await assertFails(otherUserDoc.get());
    });

    test('denies users from writing other users profiles', async () => {
      const db = testApp.firestore();
      const otherUserDoc = db.collection('users').doc('other-user');

      await assertFails(
        otherUserDoc.set({
          uid: 'other-user',
          email: 'other@example.com',
        })
      );
    });
  });

  describe('Recommendations Access', () => {
    test('allows users to read their own recommendations', async () => {
      const db = testApp.firestore();
      const recommendationsQuery = db
        .collection('recommendations')
        .where('userId', '==', 'test-user');

      await assertSucceeds(recommendationsQuery.get());
    });

    test('allows users to create their own recommendations', async () => {
      const db = testApp.firestore();
      const newRecommendation = db.collection('recommendations').doc();

      await assertSucceeds(
        newRecommendation.set({
          userId: 'test-user',
          formData: {
            currentPlan: { supplier: 'Test', rate: 12 },
            preferences: { costPriority: 50, renewablePriority: 50 },
          },
          recommendations: [],
          createdAt: new Date(),
        })
      );
    });

    test('denies users from reading other users recommendations', async () => {
      const db = testApp.firestore();
      const otherUserQuery = db
        .collection('recommendations')
        .where('userId', '==', 'other-user');

      await assertFails(otherUserQuery.get());
    });

    test('denies users from creating recommendations for other users', async () => {
      const db = testApp.firestore();
      const newRecommendation = db.collection('recommendations').doc();

      await assertFails(
        newRecommendation.set({
          userId: 'other-user', // Different user ID
          formData: {
            currentPlan: { supplier: 'Test', rate: 12 },
            preferences: { costPriority: 50, renewablePriority: 50 },
          },
          recommendations: [],
          createdAt: new Date(),
        })
      );
    });
  });

  describe('Usage Data Access', () => {
    test('allows users to read their own usage data', async () => {
      const db = testApp.firestore();
      const usageQuery = db
        .collection('usageData')
        .where('userId', '==', 'test-user');

      await assertSucceeds(usageQuery.get());
    });

    test('allows users to create their own usage data', async () => {
      const db = testApp.firestore();
      const newUsageData = db.collection('usageData').doc();

      await assertSucceeds(
        newUsageData.set({
          userId: 'test-user',
          parsedData: { monthlyTotals: [] },
          originalXmlHash: 'test-hash',
          createdAt: new Date(),
        })
      );
    });

    test('denies access to other users usage data', async () => {
      const db = testApp.firestore();
      const otherUserQuery = db
        .collection('usageData')
        .where('userId', '==', 'other-user');

      await assertFails(otherUserQuery.get());
    });
  });

  describe('Audit Log Access', () => {
    test('allows users to read their own audit logs', async () => {
      const db = testApp.firestore();
      const auditQuery = db
        .collection('auditLogs')
        .where('userId', '==', 'test-user');

      await assertSucceeds(auditQuery.get());
    });

    test('denies users from reading other users audit logs', async () => {
      const db = testApp.firestore();
      const otherUserAuditQuery = db
        .collection('auditLogs')
        .where('userId', '==', 'other-user');

      await assertFails(otherUserAuditQuery.get());
    });
  });
});

describe('Firestore Data Operations', () => {
  // Mock Firestore operations
  const mockDoc = (data) => ({
    exists: () => true,
    data: () => data,
    id: 'test-doc-id',
  });

  const mockQuerySnapshot = (docs) => ({
    docs,
    empty: docs.length === 0,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveRecommendation', () => {
    test('successfully saves recommendation with correct structure', async () => {
      const { saveRecommendation } = require('../lib/firestore');

      const mockSetDoc = jest.fn().mockResolvedValue(undefined);
      const mockDocRef = { id: 'test-rec-id' };
      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({ id: 'test-rec-id', set: mockSetDoc })
      });

      // Mock the db object
      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: mockCollection,
        },
      }));

      const userId = 'test-user';
      const formData = {
        currentPlan: { supplier: 'Test', rate: 12 },
        preferences: { costPriority: 50, renewablePriority: 50 },
      };
      const recommendations = [
        {
          plan: { id: 'plan-1', name: 'Test Plan' },
          explanation: 'Test explanation',
          confidence: 'high',
        },
      ];

      const result = await saveRecommendation(userId, formData, recommendations);

      expect(result).toBe('test-rec-id');
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          formData,
          recommendations,
        })
      );
    });
  });

  describe('getUserRecommendations', () => {
    test('returns properly formatted recommendations', async () => {
      const { getUserRecommendations } = require('../lib/firestore');

      const mockDoc = {
        id: 'rec-1',
        data: () => ({
          userId: 'test-user',
          formData: { currentPlan: { supplier: 'Test', rate: 12 } },
          recommendations: [],
          createdAt: { toDate: () => new Date('2024-01-01') },
        }),
      };

      const mockGetDocs = jest.fn().mockResolvedValue({
        docs: [mockDoc],
      });

      // Mock Firestore query
      jest.doMock('../lib/firebase', () => ({
        db: {
          collection: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  get: mockGetDocs,
                }),
              }),
            }),
          }),
        },
      }));

      const recommendations = await getUserRecommendations('test-user');

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].id).toBe('rec-1');
      expect(recommendations[0].userId).toBe('test-user');
      expect(recommendations[0].createdAt).toBeInstanceOf(Date);
    });
  });
});


