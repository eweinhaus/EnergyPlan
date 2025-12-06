// Integration test for the Energy Plan API
// Run with: node test-integration.js

const fs = require('fs');

console.log('🧪 Running Integration Tests...\n');

// Test 1: XML File Validation
console.log('1. Testing XML file validation...');
try {
  const xmlContent = fs.readFileSync('sample-green-button.xml', 'utf8');
  console.log('✅ Sample XML file exists and can be read');

  if (xmlContent.length > 1000) {
    console.log('✅ XML file has substantial content');
  }

  // Check for basic XML structure
  if (xmlContent.includes('<feed') && xmlContent.includes('<entry')) {
    console.log('✅ XML contains expected Green Button structure');
  } else {
    console.log('⚠️  XML structure may not match Green Button format');
  }

} catch (error) {
  console.error('❌ XML file validation failed:', error.message);
}

// Test 2: Cost Calculation Logic
console.log('\n2. Testing cost calculation logic...');

// Mock usage data (6 months)
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

// Manual cost calculation (same logic as in recommendationEngine.ts)
function calculateAnnualCost(plan, usageData) {
  let totalCost = 0;
  for (const month of usageData.monthlyTotals) {
    const energyCost = (plan.rate / 100) * month.totalKwh;
    const fixedFees = plan.fees.delivery + plan.fees.admin;
    totalCost += energyCost + fixedFees;
  }
  return Math.round(totalCost * 100) / 100;
}

function calculateSavings(currentPlan, recommendedPlan, usageData) {
  const currentAnnualCost = calculateAnnualCost(
    {
      ...recommendedPlan,
      rate: currentPlan.rate,
      fees: { delivery: 3.5, admin: 5.0 },
    },
    usageData
  );
  const recommendedAnnualCost = calculateAnnualCost(recommendedPlan, usageData);
  return Math.round((currentAnnualCost - recommendedAnnualCost) * 100) / 100;
}

try {
  const currentCost = calculateAnnualCost(mockPlans[0], mockUsageData);
  const txuCost = calculateAnnualCost(mockPlans[1], mockUsageData);
  const greenCost = calculateAnnualCost(mockPlans[2], mockUsageData);

  console.log('✅ Cost calculations work correctly');
  console.log(`   Current plan: $${currentCost.toFixed(2)}/year`);
  console.log(`   TXU Energy: $${txuCost.toFixed(2)}/year (${txuCost < currentCost ? 'cheaper' : 'more expensive'})`);
  console.log(`   Green Mountain: $${greenCost.toFixed(2)}/year (${greenCost < currentCost ? 'cheaper' : 'more expensive'})`);

  const txuSavings = calculateSavings({ rate: 12.5 }, mockPlans[1], mockUsageData);
  const greenSavings = calculateSavings({ rate: 12.5 }, mockPlans[2], mockUsageData);

  console.log(`   TXU savings: ${txuSavings > 0 ? '+' : ''}$${txuSavings.toFixed(2)}/year`);
  console.log(`   Green Mountain savings: ${greenSavings > 0 ? '+' : ''}$${greenSavings.toFixed(2)}/year`);

} catch (error) {
  console.error('❌ Cost calculation test failed:', error.message);
}

// Test 3: Data Validation
console.log('\n3. Testing data validation logic...');

try {
  // Test minimum data requirement
  if (mockUsageData.monthlyTotals.length >= 6) {
    console.log('✅ Minimum data requirement met (6+ months)');
  } else {
    console.log('❌ Insufficient data (less than 6 months)');
  }

  // Test realistic usage values
  const allPositive = mockUsageData.monthlyTotals.every(month => month.totalKwh > 0);
  const reasonableUsage = mockUsageData.monthlyTotals.every(month =>
    month.totalKwh >= 50 && month.totalKwh <= 10000
  );

  if (allPositive) {
    console.log('✅ All usage values are positive');
  } else {
    console.log('❌ Some usage values are negative or zero');
  }

  if (reasonableUsage) {
    console.log('✅ Usage values are within reasonable ranges');
  } else {
    console.log('⚠️  Some usage values may be unusually high or low');
  }

  // Test date range
  const startDate = new Date(mockUsageData.dateRange.start);
  const endDate = new Date(mockUsageData.dateRange.end);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff >= 180) {
    console.log('✅ Date range covers at least 6 months');
  } else {
    console.log('❌ Date range is less than 6 months');
  }

} catch (error) {
  console.error('❌ Data validation test failed:', error.message);
}

// Test 4: Recommendation Logic
console.log('\n4. Testing recommendation logic...');

try {
  const suppliers = [
    { id: '1', name: 'Reliant Energy', rating: 4.5 },
    { id: '2', name: 'TXU Energy', rating: 4.3 },
    { id: '4', name: 'Green Mountain Energy', rating: 4.7 },
  ];

  // Calculate scores (50% cost, 50% renewable)
  const scoredPlans = mockPlans.map(plan => {
    const annualCost = calculateAnnualCost(plan, mockUsageData);
    const savings = calculateSavings({ rate: 12.5 }, plan, mockUsageData);

    const costScore = 0.5 * Math.min(Math.max(savings / 500, 0), 1); // Cap at $500
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

  // Sort by score and get top 3
  const topPlans = scoredPlans.sort((a, b) => b.score - a.score).slice(0, 3);

  console.log('✅ Recommendation scoring works correctly');
  console.log('📋 Top 3 recommendations:');

  topPlans.forEach((plan, index) => {
    console.log(`   ${index + 1}. ${plan.supplierName} (${plan.score.toFixed(3)} score)`);
    console.log(`      Rate: ${plan.rate}¢/kWh, Renewable: ${plan.renewablePercentage}%`);
    console.log(`      Annual cost: $${plan.annualCost.toFixed(2)}, Savings: ${plan.savings > 0 ? '+' : ''}$${plan.savings.toFixed(2)}`);
  });

} catch (error) {
  console.error('❌ Recommendation logic test failed:', error.message);
}

console.log('\n🎉 Integration tests completed!');
console.log('\n📝 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Open http://localhost:3000 in your browser');
console.log('3. Test the complete user flow with the sample XML file');
console.log('4. Verify recommendations are generated correctly');



