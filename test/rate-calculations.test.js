const {
  calculateAnnualCost,
  calculateMonthlyEnergyCost,
  calculateFixedRateCost,
  calculateTieredRateCost,
  calculateTOURateCost,
  calculateVariableRateCost,
  calculateSeasonalRateCost,
} = require('../lib/recommendationEngine');

describe('Texas Rate Structure Calculations', () => {
  const mockUsageData = {
    monthlyTotals: [
      { month: '2024-01', totalKwh: 500 },
      { month: '2024-02', totalKwh: 450 },
      { month: '2024-03', totalKwh: 480 },
      { month: '2024-04', totalKwh: 420 },
      { month: '2024-05', totalKwh: 400 },
      { month: '2024-06', totalKwh: 600 }, // Summer month
      { month: '2024-07', totalKwh: 650 }, // Summer month
      { month: '2024-08', totalKwh: 620 }, // Summer month
      { month: '2024-09', totalKwh: 580 }, // Summer month
      { month: '2024-10', totalKwh: 480 },
      { month: '2024-11', totalKwh: 520 },
      { month: '2024-12', totalKwh: 550 },
    ],
    dataQuality: 'good',
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
  };

  describe('Fixed Rate Calculations', () => {
    const fixedRatePlan = {
      id: 'test-fixed',
      supplierId: 'test',
      supplierName: 'Test Supplier',
      name: 'Fixed Rate Plan',
      rate: 12.50, // $0.125/kWh
      renewablePercentage: 0,
      fees: { delivery: 3.50, admin: 5.00 },
    };

    test('calculates correct annual cost for fixed rate', () => {
      const totalUsage = mockUsageData.monthlyTotals.reduce((sum, month) => sum + month.totalKwh, 0);
      const expectedEnergyCost = totalUsage * (12.50 / 100); // Convert cents to dollars
      const expectedFees = mockUsageData.monthlyTotals.length * (3.50 + 5.00);
      const expectedTotal = expectedEnergyCost + expectedFees;

      const actualCost = calculateAnnualCost(fixedRatePlan, mockUsageData);

      expect(actualCost).toBeCloseTo(expectedTotal, 2);
    });

    test('calculates correct monthly energy cost for fixed rate', () => {
      const monthlyCost = calculateMonthlyEnergyCost(fixedRatePlan, mockUsageData.monthlyTotals[0]);
      const expected = 500 * (12.50 / 100); // $62.50

      expect(monthlyCost).toBe(expected);
    });
  });

  describe('Tiered Rate Calculations', () => {
    const tieredRatePlan = {
      id: 'test-tiered',
      supplierId: 'test',
      supplierName: 'Test Supplier',
      name: 'Tiered Rate Plan',
      rate: 10.00, // fallback rate
      renewablePercentage: 0,
      fees: { delivery: 3.50, admin: 5.00 },
      rateStructure: {
        type: 'tiered',
        tiered: {
          tiers: [
            { minKwh: 0, maxKwh: 500, ratePerKwh: 8.00 },    // $0.08/kWh for first 500 kWh
            { minKwh: 501, maxKwh: 1000, ratePerKwh: 12.00 }, // $0.12/kWh for next 500 kWh
            { minKwh: 1001, maxKwh: 999999, ratePerKwh: 15.00 }, // $0.15/kWh for over 1000 kWh
          ],
        },
      },
    };

    test('calculates correct cost for usage within first tier', () => {
      const lowUsageMonth = { month: '2024-01', totalKwh: 300 };
      const cost = calculateMonthlyEnergyCost(tieredRatePlan, lowUsageMonth);
      const expected = 300 * (8.00 / 100); // $2.40

      expect(cost).toBe(expected);
    });

    test('calculates correct cost spanning multiple tiers', () => {
      const highUsageMonth = { month: '2024-01', totalKwh: 750 };
      const cost = calculateMonthlyEnergyCost(tieredRatePlan, highUsageMonth);

      // First 500 kWh @ $0.08 = $40.00
      // Next 250 kWh @ $0.12 = $30.00
      // Total = $70.00
      const expected = (500 * 0.08) + (250 * 0.12);

      expect(cost).toBe(expected);
    });

    test('calculates correct cost for usage in highest tier', () => {
      const veryHighUsageMonth = { month: '2024-01', totalKwh: 1200 };
      const cost = calculateMonthlyEnergyCost(tieredRatePlan, veryHighUsageMonth);

      // First 500 kWh @ $0.08 = $40.00
      // Next 500 kWh @ $0.12 = $60.00
      // Next 200 kWh @ $0.15 = $30.00
      // Total = $130.00
      const expected = (500 * 0.08) + (500 * 0.12) + (200 * 0.15);

      expect(cost).toBe(expected);
    });
  });

  describe('Time-of-Use Rate Calculations', () => {
    const touRatePlan = {
      id: 'test-tou',
      supplierId: 'test',
      supplierName: 'Test Supplier',
      name: 'TOU Rate Plan',
      rate: 10.00, // fallback rate
      renewablePercentage: 0,
      fees: { delivery: 3.50, admin: 5.00 },
      rateStructure: {
        type: 'tou',
        tou: {
          peakHours: { start: '16:00', end: '21:00', ratePerKwh: 25.00 }, // 4-9pm @ $0.25/kWh
          offPeakRatePerKwh: 10.00, // $0.10/kWh
          superOffPeakRatePerKwh: 8.00, // $0.08/kWh (overnight)
        },
      },
    };

    test('falls back to fixed rate calculation for TOU (simplified)', () => {
      // Since we don't have hourly data in this test, it should fall back to fixed rate
      const cost = calculateMonthlyEnergyCost(touRatePlan, mockUsageData.monthlyTotals[0]);
      const expected = 500 * (10.00 / 100); // Uses fallback rate

      expect(cost).toBe(expected);
    });
  });

  describe('Variable Rate Calculations', () => {
    const variableRatePlan = {
      id: 'test-variable',
      supplierId: 'test',
      supplierName: 'Test Supplier',
      name: 'Variable Rate Plan',
      rate: 12.00, // fallback rate
      renewablePercentage: 0,
      fees: { delivery: 3.50, admin: 5.00 },
      rateStructure: {
        type: 'variable',
        variable: {
          baseRatePerKwh: 12.00,
          marketAdjustment: 'ercot',
          caps: { min: 8.00, max: 20.00 },
          seasonalMultipliers: {
            summer: 1.2,  // 20% higher in summer
            winter: 0.9,  // 10% lower in winter
          },
        },
      },
    };

    test('calculates variable rate with seasonal adjustment', () => {
      // Test summer month (June)
      const summerDate = new Date('2024-06-15');
      const summerCost = calculateMonthlyEnergyCost(variableRatePlan, { ...mockUsageData.monthlyTotals[5], date: summerDate });

      // Base rate $0.12 * summer multiplier 1.2 = $0.144/kWh
      const expectedSummerRate = 12.00 * 1.2; // 14.4 cents
      const expectedSummerCost = 600 * (expectedSummerRate / 100);

      expect(summerCost).toBe(expectedSummerCost);
    });

    test('applies rate caps correctly', () => {
      // Create a plan that would exceed caps
      const extremeVariablePlan = {
        ...variableRatePlan,
        rateStructure: {
          type: 'variable',
          variable: {
            baseRatePerKwh: 25.00, // Would be 25 * 1.2 = 30 cents without cap
            marketAdjustment: 'ercot',
            caps: { min: 8.00, max: 20.00 },
            seasonalMultipliers: {
              summer: 1.2,
              winter: 0.9,
            },
          },
        },
      };

      const summerDate = new Date('2024-06-15');
      const cost = calculateMonthlyEnergyCost(extremeVariablePlan, { ...mockUsageData.monthlyTotals[5], date: summerDate });

      // Should be capped at $0.20/kWh
      const expectedCost = 600 * (20.00 / 100);
      expect(cost).toBe(expectedCost);
    });
  });

  describe('Seasonal Rate Calculations', () => {
    const seasonalRatePlan = {
      id: 'test-seasonal',
      supplierId: 'test',
      supplierName: 'Test Supplier',
      name: 'Seasonal Rate Plan',
      rate: 12.00, // fallback rate
      renewablePercentage: 0,
      fees: { delivery: 3.50, admin: 5.00 },
      rateStructure: {
        type: 'seasonal',
        seasonal: {
          winterRatePerKwh: 10.00, // $0.10/kWh in winter
          summerRatePerKwh: 15.00, // $0.15/kWh in summer
          seasonalMonths: {
            winter: [0, 1, 2, 3, 9, 10, 11], // Jan-Apr, Oct-Dec
            summer: [4, 5, 6, 7, 8], // May-Sep
          },
        },
      },
    };

    test('applies correct seasonal rate for summer months', () => {
      const summerDate = new Date('2024-07-15'); // July = month 6
      const cost = calculateMonthlyEnergyCost(seasonalRatePlan, { ...mockUsageData.monthlyTotals[6], date: summerDate });

      const expectedCost = 650 * (15.00 / 100); // Summer rate
      expect(cost).toBe(expectedCost);
    });

    test('applies correct seasonal rate for winter months', () => {
      const winterDate = new Date('2024-01-15'); // January = month 0
      const cost = calculateMonthlyEnergyCost(seasonalRatePlan, { ...mockUsageData.monthlyTotals[0], date: winterDate });

      const expectedCost = 500 * (10.00 / 100); // Winter rate
      expect(cost).toBe(expectedCost);
    });
  });

  describe('Annual Cost Accuracy', () => {
    test('annual cost calculation includes all months and fees', () => {
      const testPlan = {
        id: 'accuracy-test',
        supplierId: 'test',
        supplierName: 'Test Supplier',
        name: 'Accuracy Test Plan',
        rate: 12.00,
        renewablePercentage: 0,
        fees: { delivery: 4.00, admin: 6.00 },
      };

      const cost = calculateAnnualCost(testPlan, mockUsageData);
      const totalUsage = mockUsageData.monthlyTotals.reduce((sum, month) => sum + month.totalKwh, 0);
      const energyCost = totalUsage * (12.00 / 100);
      const totalFees = mockUsageData.monthlyTotals.length * (4.00 + 6.00);
      const expectedTotal = energyCost + totalFees;

      expect(cost).toBeCloseTo(expectedTotal, 2);
    });

    test('maintains calculation precision to 2 decimal places', () => {
      const precisionPlan = {
        id: 'precision-test',
        supplierId: 'test',
        supplierName: 'Test Supplier',
        name: 'Precision Test Plan',
        rate: 12.345, // Non-round rate
        renewablePercentage: 0,
        fees: { delivery: 3.14159, admin: 5.6789 }, // Non-round fees
      };

      const cost = calculateAnnualCost(precisionPlan, mockUsageData);

      // Should be rounded to 2 decimal places
      expect(cost).toBe(Math.round(cost * 100) / 100);
      expect(cost % 0.01).toBe(0); // Should be exact multiple of 0.01
    });
  });
});

