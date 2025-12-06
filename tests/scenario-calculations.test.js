const {
  calculateCostScenarios,
  createPlanWithScenarios,
  parseContractDate,
  calculateMonthsRemaining,
} = require('../lib/recommendationEngine');

describe('Cost Scenario Calculations', () => {
  const mockUsageData = {
    monthlyTotals: [
      { month: '2024-01', totalKwh: 500 },
      { month: '2024-02', totalKwh: 450 },
      { month: '2024-03', totalKwh: 480 },
      { month: '2024-04', totalKwh: 420 },
      { month: '2024-05', totalKwh: 400 },
      { month: '2024-06', totalKwh: 600 },
      { month: '2024-07', totalKwh: 650 },
      { month: '2024-08', totalKwh: 620 },
      { month: '2024-09', totalKwh: 580 },
      { month: '2024-10', totalKwh: 480 },
      { month: '2024-11', totalKwh: 520 },
      { month: '2024-12', totalKwh: 550 },
    ],
    dataQuality: 'good',
    dateRange: { start: '2024-01-01', end: '2024-12-31' },
  };

  const mockPlan = {
    id: 'test-plan',
    supplierId: 'test-supplier',
    supplierName: 'Test Supplier',
    name: 'Test Plan',
    rate: 12.50,
    renewablePercentage: 10,
    fees: { delivery: 3.50, admin: 5.00 },
    annualCost: 1500, // Mock annual cost
    savings: 200,
    score: 0.85,
  };

  const currentPlanCost = 1700; // Higher than recommended plan

  describe('Date Parsing Functions', () => {
    test('parseContractDate correctly parses MM/YYYY format', () => {
      const result = parseContractDate('12/2025');
      expect(result).toEqual(new Date(2025, 11, 1)); // December 1, 2025 (0-based month)

      const result2 = parseContractDate('01/2024');
      expect(result2).toEqual(new Date(2024, 0, 1)); // January 1, 2024
    });

    test('parseContractDate returns null for invalid format', () => {
      expect(parseContractDate('invalid')).toBeNull();
      expect(parseContractDate('13/2024')).toBeNull(); // Invalid month
      expect(parseContractDate('01/123')).toBeNull(); // Invalid year
      expect(parseContractDate('')).toBeNull();
      expect(parseContractDate(null)).toBeNull();
    });

    test('calculateMonthsRemaining returns correct months until contract end', () => {
      // Mock current date to be June 15, 2024
      const mockNow = new Date(2024, 5, 15); // June 15, 2024
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow);

      const contractEnd = new Date(2024, 11, 1); // December 1, 2024
      const monthsRemaining = calculateMonthsRemaining(contractEnd);

      // From July to November (5 months remaining after June)
      expect(monthsRemaining).toBe(5);

      jest.restoreAllMocks();
    });

    test('calculateMonthsRemaining returns 0 for past dates', () => {
      const mockNow = new Date(2024, 5, 15); // June 15, 2024
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow);

      const pastDate = new Date(2024, 2, 1); // March 1, 2024
      const monthsRemaining = calculateMonthsRemaining(pastDate);

      expect(monthsRemaining).toBe(0);

      jest.restoreAllMocks();
    });
  });

  describe('Cost Scenario Calculations', () => {
    const contractTerms = {
      earlyTerminationFee: 150,
      contractEndDate: '12/2024', // December 2024
    };

    test('calculateCostScenarios creates three scenarios with correct structure', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, contractTerms);

      expect(scenarios).toHaveLength(3);

      // Check scenario types
      expect(scenarios[0].type).toBe('stay-current');
      expect(scenarios[1].type).toBe('switch-now');
      expect(scenarios[2].type).toBe('wait-and-switch');

      // Check descriptions
      expect(scenarios[0].description).toBe('Continue with your current plan');
      expect(scenarios[1].description).toBe('Switch now (+$150 fee)');
      expect(scenarios[2].description).toBe('Wait until 12/2024, then switch');
    });

    test('stay-current scenario shows baseline cost', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, contractTerms);

      const stayCurrent = scenarios[0];
      expect(stayCurrent.annualCost).toBe(currentPlanCost);
      expect(stayCurrent.netSavings).toBe(0);
    });

    test('switch-now scenario includes termination fee', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, contractTerms);

      const switchNow = scenarios[1];
      expect(switchNow.annualCost).toBe(mockPlan.annualCost + contractTerms.earlyTerminationFee);
      expect(switchNow.netSavings).toBe(currentPlanCost - switchNow.annualCost);
    });

    test('wait-and-switch scenario prorates costs correctly', () => {
      // Mock current date to be June 15, 2024 for predictable calculation
      const mockNow = new Date(2024, 5, 15); // June 15, 2024
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow);

      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, contractTerms);

      const waitAndSwitch = scenarios[2];

      // Contract ends Dec 1, 2024, so from July to Nov (5 months) at current plan cost
      // December at new plan cost
      const monthsRemaining = 5; // July through November
      const contractPeriodCost = (currentPlanCost / 12) * monthsRemaining;
      const postContractCost = (mockPlan.annualCost / 12) * 1; // December
      const expectedCost = contractPeriodCost + postContractCost;

      expect(waitAndSwitch.annualCost).toBeCloseTo(expectedCost, 2);
      expect(waitAndSwitch.netSavings).toBe(currentPlanCost - waitAndSwitch.annualCost);

      jest.restoreAllMocks();
    });

    test('handles zero termination fee correctly', () => {
      const zeroFeeTerms = { ...contractTerms, earlyTerminationFee: 0 };
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, zeroFeeTerms);

      const switchNow = scenarios[1];
      expect(switchNow.annualCost).toBe(mockPlan.annualCost); // No fee added
      expect(switchNow.description).toBe('Switch now (+$0 fee)');
    });

    test('handles missing contract end date (only 2 scenarios)', () => {
      const noEndDateTerms = { earlyTerminationFee: 150 };
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, noEndDateTerms);

      expect(scenarios).toHaveLength(2); // Only stay-current and switch-now
      expect(scenarios[0].type).toBe('stay-current');
      expect(scenarios[1].type).toBe('switch-now');
    });

    test('identifies recommended scenario correctly', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, contractTerms);
      const planWithScenarios = createPlanWithScenarios(mockPlan, currentPlanCost, contractTerms);

      // Find the scenario with lowest annual cost
      const minCostScenario = scenarios.reduce((min, scenario) =>
        scenario.annualCost < min.annualCost ? scenario : min
      );

      expect(planWithScenarios.recommendedScenario?.type).toBe(minCostScenario.type);
      expect(planWithScenarios.scenarios).toHaveLength(scenarios.length);
    });
  });

  describe('Edge Cases and Validation', () => {
    test('handles very high termination fees', () => {
      const highFeeTerms = { earlyTerminationFee: 2000 };
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, highFeeTerms);

      const switchNow = scenarios[1];
      expect(switchNow.annualCost).toBe(mockPlan.annualCost + 2000);
      expect(switchNow.netSavings).toBeLessThan(0); // Negative savings
    });

    test('handles contract ending this month', () => {
      // Mock current date to be November 15, 2024
      const mockNow = new Date(2024, 10, 15); // November 15, 2024
      jest.spyOn(global, 'Date').mockImplementation(() => mockNow);

      const soonEndingTerms = {
        earlyTerminationFee: 150,
        contractEndDate: '12/2024', // December 2024
      };

      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, soonEndingTerms);
      const waitAndSwitch = scenarios[2];

      // Only 1 month remaining (December)
      const contractPeriodCost = (currentPlanCost / 12) * 0; // No months remaining in contract
      const postContractCost = (mockPlan.annualCost / 12) * 1; // December
      const expectedCost = contractPeriodCost + postContractCost;

      expect(waitAndSwitch.annualCost).toBeCloseTo(expectedCost, 2);

      jest.restoreAllMocks();
    });

    test('handles negative savings correctly', () => {
      const expensivePlan = { ...mockPlan, annualCost: 2000 }; // More expensive than current
      const scenarios = calculateCostScenarios(expensivePlan, currentPlanCost, {
        earlyTerminationFee: 150,
        contractEndDate: '12/2025',
      });

      const switchNow = scenarios[1];
      expect(switchNow.netSavings).toBeLessThan(0); // Negative savings
      expect(switchNow.annualCost).toBeGreaterThan(currentPlanCost);
    });
  });

  describe('Calculation Accuracy', () => {
    test('calculations are deterministic and consistent', () => {
      const terms = { earlyTerminationFee: 150, contractEndDate: '12/2024' };

      const result1 = calculateCostScenarios(mockPlan, currentPlanCost, terms);
      const result2 = calculateCostScenarios(mockPlan, currentPlanCost, terms);

      expect(result1).toEqual(result2);
    });

    test('annual costs are calculated to 2 decimal places', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, {
        earlyTerminationFee: 150,
        contractEndDate: '12/2024',
      });

      scenarios.forEach(scenario => {
        const decimalPlaces = (scenario.annualCost.toString().split('.')[1] || '').length;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });

    test('net savings calculation is accurate', () => {
      const scenarios = calculateCostScenarios(mockPlan, currentPlanCost, {
        earlyTerminationFee: 150,
      });

      scenarios.forEach(scenario => {
        const expectedNetSavings = currentPlanCost - scenario.annualCost;
        expect(scenario.netSavings).toBe(expectedNetSavings);
      });
    });
  });

  describe('createPlanWithScenarios Integration', () => {
    test('creates PlanWithScenarios with all required properties', () => {
      const terms = { earlyTerminationFee: 150, contractEndDate: '12/2024' };
      const result = createPlanWithScenarios(mockPlan, currentPlanCost, terms);

      expect(result).toHaveProperty('scenarios');
      expect(result).toHaveProperty('recommendedScenario');
      expect(result.scenarios).toHaveLength(3);
      expect(result.recommendedScenario).toBeDefined();

      // Should include all original plan properties
      expect(result.id).toBe(mockPlan.id);
      expect(result.annualCost).toBe(mockPlan.annualCost);
      expect(result.savings).toBe(mockPlan.savings);
    });

    test('recommendedScenario points to lowest cost option', () => {
      const terms = { earlyTerminationFee: 150, contractEndDate: '12/2024' };
      const result = createPlanWithScenarios(mockPlan, currentPlanCost, terms);

      const lowestCostScenario = result.scenarios.reduce((min, scenario) =>
        scenario.annualCost < min.annualCost ? scenario : min
      );

      expect(result.recommendedScenario?.annualCost).toBe(lowestCostScenario.annualCost);
      expect(result.recommendedScenario?.type).toBe(lowestCostScenario.type);
    });
  });
});
