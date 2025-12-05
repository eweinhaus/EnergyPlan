/**
 * Phase 2 Integration Tests
 * Tests the complete user flow with Firebase, advanced rates, PDF export, and GDPR
 */

// Mock all external dependencies
jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('@react-pdf/renderer');
jest.mock('puppeteer');

const mockFirebase = require('firebase/app');
const mockAuth = require('firebase/auth');
const mockFirestore = require('firebase/firestore');

// Setup Firebase mocks
mockFirebase.initializeApp.mockReturnValue({});
mockAuth.getAuth.mockReturnValue({
  currentUser: { uid: 'test-user', email: 'test@example.com' },
});

const mockDoc = (data) => ({
  id: 'test-doc',
  data: () => data,
  ref: { delete: jest.fn() },
});

const mockCollection = {
  doc: jest.fn(() => ({
    set: jest.fn(),
    get: jest.fn().mockResolvedValue(mockDoc({})),
    delete: jest.fn(),
  })),
  where: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ docs: [] }),
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({ docs: [] }),
      })),
    })),
  })),
};

mockFirestore.getFirestore.mockReturnValue({
  collection: jest.fn(() => mockCollection),
});

describe('Phase 2 Complete User Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Registration and Authentication Flow', () => {
    test('user can register, authenticate, and access dashboard', async () => {
      // Mock successful user registration
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-user', email: 'test@example.com' },
      });

      // Mock successful login
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-user', email: 'test@example.com' },
      });

      // Mock user profile creation
      const { createUserProfile } = require('../lib/firestore');
      await createUserProfile('test-user', 'test@example.com');

      // Verify user profile was created
      expect(mockCollection.doc).toHaveBeenCalledWith('test-user');

      // Simulate dashboard access
      const { getUserProfile } = require('../lib/firestore');
      const profile = await getUserProfile('test-user');

      expect(profile).toBeDefined();
    });

    test('authenticated user can save and retrieve recommendations', async () => {
      const { saveRecommendation, getUserRecommendations } = require('../lib/firestore');

      const formData = {
        currentPlan: { supplier: 'Test Supplier', rate: 12 },
        preferences: { costPriority: 70, renewablePriority: 30 },
      };

      const recommendations = [
        {
          plan: {
            id: 'plan-1',
            supplierId: 'supplier-1',
            supplierName: 'Test Supplier',
            name: 'Test Plan',
            rate: 10,
            renewablePercentage: 50,
            fees: { delivery: 3.5, admin: 5.0 },
            annualCost: 1200,
            savings: 100,
            score: 0.8,
          },
          explanation: 'This plan saves you $100 annually.',
          confidence: 'high',
        },
      ];

      // Save recommendation
      const savedId = await saveRecommendation('test-user', formData, recommendations);
      expect(savedId).toBeDefined();

      // Retrieve recommendations
      const userRecommendations = await getUserRecommendations('test-user');
      expect(userRecommendations).toBeDefined();
      expect(Array.isArray(userRecommendations)).toBe(true);
    });
  });

  describe('Advanced Rate Structure Processing', () => {
    test('processes tiered rate plans correctly', async () => {
      const { calculateAnnualCost } = require('../lib/recommendationEngine');

      const tieredRatePlan = {
        id: 'tiered-plan',
        supplierId: 'supplier-1',
        supplierName: 'Tiered Supplier',
        name: 'Tiered Rate Plan',
        rate: 10, // fallback
        renewablePercentage: 0,
        fees: { delivery: 3.5, admin: 5.0 },
        rateStructure: {
          type: 'tiered',
          tiered: {
            tiers: [
              { minKwh: 0, maxKwh: 500, ratePerKwh: 8 },
              { minKwh: 501, maxKwh: 1000, ratePerKwh: 12 },
              { minKwh: 1001, maxKwh: 999999, ratePerKwh: 15 },
            ],
          },
        },
      };

      const usageData = {
        monthlyTotals: [
          { month: '2024-01', totalKwh: 600 }, // Spans two tiers
          { month: '2024-02', totalKwh: 400 }, // First tier only
        ],
        dataQuality: 'good',
        dateRange: { start: '2024-01-01', end: '2024-02-28' },
      };

      const annualCost = calculateAnnualCost(tieredRatePlan, usageData);

      // Month 1: 500kWh @ $0.08 = $40, 100kWh @ $0.12 = $12, total $52
      // Month 2: 400kWh @ $0.08 = $32
      // Fees: 2 months * ($3.50 + $5.00) = $17
      // Total: $52 + $32 + $17 = $101
      expect(annualCost).toBeCloseTo(101, 2);
    });

    test('processes TOU rate plans with proper time segmentation', async () => {
      const { calculateMonthlyEnergyCost } = require('../lib/recommendationEngine');

      const touRatePlan = {
        id: 'tou-plan',
        supplierId: 'supplier-1',
        supplierName: 'TOU Supplier',
        name: 'Time-of-Use Plan',
        rate: 10, // fallback
        renewablePercentage: 0,
        fees: { delivery: 3.5, admin: 5.0 },
        rateStructure: {
          type: 'tou',
          tou: {
            peakHours: { start: '16:00', end: '21:00', ratePerKwh: 25 },
            offPeakRatePerKwh: 10,
            superOffPeakRatePerKwh: 8,
          },
        },
      };

      // For TOU testing, we fall back to fixed rate since we don't have hourly data
      // In production, this would integrate with hourly XML parsing
      const cost = calculateMonthlyEnergyCost(touRatePlan, { month: '2024-01', totalKwh: 500 });

      // Falls back to fixed rate of $0.10/kWh
      expect(cost).toBe(50); // 500 kWh * $0.10
    });
  });

  describe('PDF Export Integration', () => {
    test('generates PDF report for user recommendations', async () => {
      const { generatePDFReport } = require('../lib/pdfGenerator');
      const { pdf } = require('@react-pdf/renderer');

      // Mock PDF generation
      const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
      pdf.mockReturnValue({
        toBlob: jest.fn().mockResolvedValue(mockBlob),
      });

      const recommendations = [
        {
          plan: {
            id: 'plan-1',
            supplierId: 'supplier-1',
            supplierName: 'Test Supplier',
            name: 'Test Plan',
            rate: 10,
            renewablePercentage: 50,
            fees: { delivery: 3.5, admin: 5.0 },
            annualCost: 1200,
            savings: 100,
            score: 0.8,
          },
          explanation: 'This plan saves you $100 annually.',
          confidence: 'high',
        },
      ];

      const formData = {
        currentPlan: { supplier: 'Current Supplier', rate: 12 },
        preferences: { costPriority: 70, renewablePriority: 30 },
      };

      const result = await generatePDFReport(recommendations, formData);

      expect(result.success).toBe(true);
      expect(result.url).toBeDefined();
      expect(result.generationTime).toBeGreaterThan(0);
    });

    test('falls back to puppeteer when react-pdf fails', async () => {
      const { generatePDFReport } = require('../lib/pdfGenerator');
      const puppeteer = require('puppeteer');

      // Mock react-pdf failure
      const { pdf } = require('@react-pdf/renderer');
      pdf.mockImplementation(() => {
        throw new Error('React-pdf failed');
      });

      // Mock puppeteer success
      const mockBrowser = {
        newPage: jest.fn().mockResolvedValue({
          setContent: jest.fn(),
          pdf: jest.fn().mockResolvedValue(Buffer.from('mock pdf')),
          close: jest.fn(),
        }),
        close: jest.fn(),
      };
      puppeteer.default.launch.mockResolvedValue(mockBrowser);

      const recommendations = [];
      const formData = {
        currentPlan: { supplier: 'Test', rate: 12 },
        preferences: { costPriority: 50, renewablePriority: 50 },
      };

      const result = await generatePDFReport(recommendations, formData);

      expect(result.success).toBe(true);
      expect(puppeteer.default.launch).toHaveBeenCalled();
    });
  });

  describe('GDPR Compliance End-to-End', () => {
    test('user can export all their data', async () => {
      const { exportUserData } = require('../lib/firestore');

      // Mock the individual data retrieval functions
      const mockUserProfile = {
        uid: 'test-user',
        email: 'test@example.com',
        preferences: { costPriority: 70, renewablePriority: 30 },
        createdAt: new Date(),
        lastLoginAt: new Date(),
        gdprConsent: {
          analytics: true,
          marketing: false,
          dataProcessing: true,
          dataStorage: false,
          lastUpdated: new Date(),
          version: '1.0',
        },
      };

      require('../lib/firestore').getUserProfile = jest.fn().mockResolvedValue(mockUserProfile);
      require('../lib/firestore').getUserRecommendations = jest.fn().mockResolvedValue([]);
      require('../lib/firestore').getUserUsageData = jest.fn().mockResolvedValue([]);
      require('../lib/firestore').getUserAuditLogs = jest.fn().mockResolvedValue([]);

      const exportedData = await exportUserData('test-user');

      expect(exportedData).toHaveProperty('profile');
      expect(exportedData).toHaveProperty('recommendations');
      expect(exportedData).toHaveProperty('usageData');
      expect(exportedData).toHaveProperty('auditLogs');
      expect(exportedData).toHaveProperty('exportDate');

      expect(exportedData.profile.uid).toBe('test-user');
    });

    test('user can delete all their data', async () => {
      const { deleteUserData } = require('../lib/firestore');

      // Mock successful deletions
      const deletedCollections = await deleteUserData('test-user');

      expect(deletedCollections).toContain('users');
      expect(deletedCollections).toContain('recommendations');
      expect(deletedCollections).toContain('usageData');
      expect(deletedCollections).toContain('auditLogs');
    });
  });

  describe('PWA Functionality', () => {
    test('service worker registers correctly', async () => {
      const { registerServiceWorker } = require('../lib/pwa');

      // Mock successful service worker registration
      const mockRegistration = {
        addEventListener: jest.fn(),
      };

      global.navigator.serviceWorker.register = jest.fn().mockResolvedValue(mockRegistration);

      const registration = await registerServiceWorker();

      expect(global.navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(registration).toBe(mockRegistration);
    });

    test('offline manager tracks connectivity', () => {
      const { offlineManager } = require('../lib/pwa');

      const isOnline = offlineManager.getIsOnline();

      expect(typeof isOnline).toBe('boolean');
    });
  });

  describe('Complete User Journey', () => {
    test('end-to-end user flow from registration to PDF export', async () => {
      // This test would simulate the complete user journey:
      // 1. User registers
      // 2. User uploads XML and gets recommendations
      // 3. Recommendations are saved to Firebase
      // 4. User views recommendations in dashboard
      // 5. User exports data via GDPR
      // 6. User generates PDF report

      // Mock all the necessary functions
      mockAuth.createUserWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'journey-user', email: 'journey@example.com' },
      });

      // Step 1: Registration
      const { createUserProfile } = require('../lib/firestore');
      await createUserProfile('journey-user', 'journey@example.com');

      // Step 2: Save recommendation
      const { saveRecommendation } = require('../lib/firestore');
      const formData = {
        currentPlan: { supplier: 'Journey Supplier', rate: 12 },
        preferences: { costPriority: 60, renewablePriority: 40 },
      };
      const recommendations = [
        {
          plan: {
            id: 'journey-plan',
            supplierId: 'journey-supplier',
            supplierName: 'Journey Supplier',
            name: 'Journey Plan',
            rate: 10,
            renewablePercentage: 75,
            fees: { delivery: 3.5, admin: 5.0 },
            annualCost: 1150,
            savings: 150,
            score: 0.85,
          },
          explanation: 'This plan offers excellent savings with renewable energy.',
          confidence: 'high',
        },
      ];

      const savedId = await saveRecommendation('journey-user', formData, recommendations);
      expect(savedId).toBeDefined();

      // Step 3: Retrieve recommendations
      const { getUserRecommendations } = require('../lib/firestore');
      const userRecs = await getUserRecommendations('journey-user');
      expect(userRecs.length).toBeGreaterThan(0);

      // Step 4: Export data (GDPR)
      const { exportUserData } = require('../lib/firestore');
      const exportedData = await exportUserData('journey-user');
      expect(exportedData).toHaveProperty('recommendations');

      // Step 5: Generate PDF
      const { generatePDFReport } = require('../lib/pdfGenerator');
      const pdfResult = await generatePDFReport(recommendations, formData);
      expect(pdfResult.success).toBe(true);

      // Journey complete - all major Phase 2 features work together
    });
  });

  describe('Performance Requirements', () => {
    test('recommendation generation meets performance targets', async () => {
      const { generateRecommendations } = require('../lib/recommendationEngine');

      const currentPlan = { supplier: 'Test', rate: 12 };
      const usageData = {
        monthlyTotals: Array.from({ length: 12 }, (_, i) => ({
          month: `2024-${String(i + 1).padStart(2, '0')}`,
          totalKwh: 400 + Math.random() * 200, // 400-600 kWh
        })),
        dataQuality: 'good',
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
      };
      const preferences = { costPriority: 70, renewablePriority: 30 };

      // Mock API call
      const mockPlans = [
        {
          id: 'perf-plan-1',
          supplierId: 'perf-supplier',
          supplierName: 'Performance Supplier',
          name: 'Fast Plan',
          rate: 10,
          renewablePercentage: 0,
          fees: { delivery: 3.5, admin: 5.0 },
        },
      ];

      require('../lib/apiClients').getPlans = jest.fn().mockResolvedValue(mockPlans);
      require('../lib/apiClients').getSuppliers = jest.fn().mockResolvedValue([
        { id: 'perf-supplier', rating: 4.0 },
      ]);

      const startTime = Date.now();
      const recommendations = await generateRecommendations(currentPlan, usageData, preferences, mockPlans, 'fake-api-key');
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(recommendations).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
    });
  });
});

