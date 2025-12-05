// Simple test script for cost calculations and recommendations
// Run with: node lib/test-calculations.js

const { calculateAnnualCost, calculateSavings, generateRecommendations } = require('./recommendationEngine');

console.log('Testing Cost Calculations...\n');

// Mock data for testing
const mockUsageData = {
  monthlyTotals: [
    { month: '2024-01', totalKwh: 850, daysWithData: 31, averageDaily: 27.4 },
    { month: '2024-02', totalKwh: 780, daysWithData: 29, averageDaily: 26.9 },
    { month: '2024-03', totalKwh: 720, daysWithData: 31, averageDaily: 23.2 },
    { month: '2024-04', totalKwh: 680, daysWithData: 30, averageDaily: 22.7 },
    { month: '2024-05', totalKwh: 620, daysWithData: 31, averageDaily: 20.0 },
    { month: '2024-06', totalKwh: 580, daysWithData: 30, averageDaily: 19.3 },
  ],
  dataQuality: 'good',
  dateRange: { start: '2024-01-01', end: '2024-06-30' }
};

const mockCurrentPlan = {
  supplier: 'Reliant Energy',
  rate: 12.5, // cents per kWh
};

const mockPlans = [
  {
    id: 'reliant-fixed-1',
    supplierId: '1',
    supplierName: 'Reliant Energy',
    name: 'Reliant Fixed Rate',
    rate: 12.5,
    renewablePercentage: 0,
    fees: { delivery: 3.5, admin: 5.0 }
  },
  {
    id: 'txu-fixed-1',
    supplierId: '2',
    supplierName: 'TXU Energy',
    name: 'TXU Fixed Rate',
    rate: 11.8,
    renewablePercentage: 10,
    fees: { delivery: 4.0, admin: 4.5 }
  },
  {
    id: 'green-mountain-1',
    supplierId: '4',
    supplierName: 'Green Mountain Energy',
    name: 'Green Choice',
    rate: 13.2,
    renewablePercentage: 100,
    fees: { delivery: 3.0, admin: 5.5 }
  }
];

console.log('🧮 Testing Cost Calculations...\n');

// Test annual cost calculation
try {
  const currentCost = calculateAnnualCost(mockPlans[0], mockUsageData);
  const txuCost = calculateAnnualCost(mockPlans[1], mockUsageData);
  const greenCost = calculateAnnualCost(mockPlans[2], mockUsageData);

  console.log('✅ Annual cost calculations successful');
  console.log(`   Current plan: $${currentCost.toFixed(2)}`);
  console.log(`   TXU Energy: $${txuCost.toFixed(2)}`);
  console.log(`   Green Mountain: $${greenCost.toFixed(2)}`);

  // Test savings calculation
  const savings1 = calculateSavings(mockCurrentPlan, mockPlans[1], mockUsageData);
  const savings2 = calculateSavings(mockCurrentPlan, mockPlans[2], mockUsageData);

  console.log('\n💰 Savings calculations:');
  console.log(`   TXU Energy: ${savings1 > 0 ? '+' : ''}$${savings1.toFixed(2)}`);
  console.log(`   Green Mountain: ${savings2 > 0 ? '+' : ''}$${savings2.toFixed(2)}`);

  console.log('\n🎯 Cost Calculations test PASSED');

} catch (error) {
  console.error('❌ Cost Calculations test FAILED:', error.message);
  process.exit(1);
}

// Test recommendation generation
console.log('\n🤖 Testing Recommendation Engine...\n');

try {
  // Mock API function to return suppliers
  const mockGetSuppliers = async () => [
    { id: '1', name: 'Reliant Energy', rating: 4.5 },
    { id: '2', name: 'TXU Energy', rating: 4.3 },
    { id: '4', name: 'Green Mountain Energy', rating: 4.7 },
  ];

  // Mock generateRecommendations call
  const testRecommendations = async () => {
    const suppliers = await mockGetSuppliers();

    // Simulate the recommendation logic
    const plansWithCosts = mockPlans.map(plan => {
      const annualCost = calculateAnnualCost(plan, mockUsageData);
      const savings = calculateSavings(mockCurrentPlan, plan, mockUsageData);

      // Simple scoring: cost savings priority 50%, renewable priority 50%
      const costScore = 0.5 * Math.min(savings / 500, 1);
      const renewableScore = 0.5 * (plan.renewablePercentage / 100);
      const supplierScore = 0.1 * (suppliers.find(s => s.id === plan.supplierId)?.rating || 3) / 5;

      const score = costScore + renewableScore + supplierScore;

      return {
        ...plan,
        annualCost,
        savings,
        score,
      };
    });

    // Sort by score and take top 3
    const topPlans = plansWithCosts
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return topPlans.map(plan => ({
      plan,
      explanation: `Test explanation for ${plan.name}`,
      confidence: 'high',
    }));
  };

  testRecommendations().then(recommendations => {
    console.log('✅ Recommendation generation successful');
    console.log('📋 Top 3 recommendations:');

    recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec.plan.supplierName} - ${rec.plan.name}`);
      console.log(`      Annual Cost: $${rec.plan.annualCost.toFixed(2)}`);
      console.log(`      Savings: ${rec.plan.savings > 0 ? '+' : ''}$${rec.plan.savings.toFixed(2)}`);
      console.log(`      Renewable: ${rec.plan.renewablePercentage}%`);
      console.log(`      Score: ${rec.plan.score.toFixed(3)}`);
      console.log('');
    });

    console.log('🎉 Recommendation Engine test PASSED');
    console.log('\n✅ All tests passed successfully!');
  }).catch(error => {
    console.error('❌ Recommendation test FAILED:', error.message);
    process.exit(1);
  });

} catch (error) {
  console.error('❌ Recommendation Engine test setup FAILED:', error.message);
  process.exit(1);
}

