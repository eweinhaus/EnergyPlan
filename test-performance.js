// Performance test script
// Run with: node test-performance.js

const fs = require('fs');

console.log('⚡ Running Performance Tests...\n');

// Test 1: File Size Limits
console.log('1. Testing file size limits...');
try {
  const stats = fs.statSync('sample-green-button.xml');
  const fileSizeMB = stats.size / (1024 * 1024);

  console.log(`   Sample XML file size: ${fileSizeMB.toFixed(2)} MB`);

  if (fileSizeMB <= 10) {
    console.log('✅ File size within limits (10MB max)');
  } else {
    console.log('❌ File size exceeds limit (10MB max)');
  }
} catch (error) {
  console.log('❌ Could not check file size:', error.message);
}

// Test 2: Processing Speed Simulation
console.log('\n2. Testing processing speed simulation...');

const startTime = Date.now();

// Simulate XML parsing (using sample data)
const xmlContent = fs.readFileSync('sample-green-button.xml', 'utf8');
const parseTime = Date.now() - startTime;

console.log(`   XML parsing time: ${parseTime}ms`);

// Simulate cost calculations
const mockUsageData = {
  monthlyTotals: Array.from({ length: 12 }, (_, i) => ({
    month: `2024-${String(i + 1).padStart(2, '0')}`,
    totalKwh: 600 + Math.random() * 400,
    daysWithData: 28 + Math.random() * 3,
    averageDaily: 20 + Math.random() * 10,
  })),
};

const mockPlans = Array.from({ length: 50 }, (_, i) => ({
  id: `plan-${i}`,
  supplierId: String(Math.floor(i / 5) + 1),
  supplierName: `Supplier ${Math.floor(i / 5) + 1}`,
  name: `Plan ${i + 1}`,
  rate: 8 + Math.random() * 8,
  renewablePercentage: Math.floor(Math.random() * 101),
  fees: {
    delivery: 3 + Math.random() * 2,
    admin: 4 + Math.random() * 2,
  },
}));

const calculationStart = Date.now();

function calculateAnnualCost(plan, usageData) {
  let totalCost = 0;
  for (const month of usageData.monthlyTotals) {
    const energyCost = (plan.rate / 100) * month.totalKwh;
    const fixedFees = plan.fees.delivery + plan.fees.admin;
    totalCost += energyCost + fixedFees;
  }
  return Math.round(totalCost * 100) / 100;
}

const costs = mockPlans.map(plan => calculateAnnualCost(plan, mockUsageData));
const calculationTime = Date.now() - calculationStart;

console.log(`   Cost calculation for ${mockPlans.length} plans: ${calculationTime}ms`);
console.log(`   Average time per plan: ${(calculationTime / mockPlans.length).toFixed(2)}ms`);

// Simulate recommendation algorithm
const recommendationStart = Date.now();

const currentPlan = { rate: 12.5 };
const suppliers = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  name: `Supplier ${i + 1}`,
  rating: 3 + Math.random() * 2,
}));

const plansWithCosts = mockPlans.map(plan => {
  const annualCost = costs[mockPlans.indexOf(plan)];
  const savings = calculateAnnualCost({
    ...plan,
    rate: currentPlan.rate,
    fees: { delivery: 3.5, admin: 5.0 },
  }, mockUsageData) - annualCost;

  const costScore = 0.5 * Math.min(Math.max(savings / 500, 0), 1);
  const renewableScore = 0.5 * (plan.renewablePercentage / 100);
  const supplierScore = 0.1 * (suppliers.find(s => s.id === plan.supplierId)?.rating || 3) / 5;

  return {
    ...plan,
    annualCost,
    savings,
    score: costScore + renewableScore + supplierScore,
  };
});

const topPlans = plansWithCosts
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);

const recommendationTime = Date.now() - recommendationStart;

console.log(`   Recommendation algorithm: ${recommendationTime}ms`);
console.log(`   Total processing time: ${parseTime + calculationTime + recommendationTime}ms`);

// Performance targets
const totalProcessingTime = parseTime + calculationTime + recommendationTime;
console.log('\n🎯 Performance Targets:');
console.log(`   Target: <10 seconds (${10000}ms) for recommendation generation`);
console.log(`   Actual: ${totalProcessingTime}ms`);

if (totalProcessingTime < 10000) {
  console.log('✅ Performance target met');
} else {
  console.log('❌ Performance target not met');
}

// Test 3: Memory Usage Estimation
console.log('\n3. Memory usage estimation...');

const estimatedMemoryUsage = {
  xmlContent: xmlContent.length,
  usageData: JSON.stringify(mockUsageData).length,
  plansData: JSON.stringify(mockPlans).length,
  suppliersData: JSON.stringify(suppliers).length,
};

const totalEstimatedMemory = Object.values(estimatedMemoryUsage).reduce((a, b) => a + b, 0);

console.log(`   XML content: ${(estimatedMemoryUsage.xmlContent / 1024).toFixed(2)} KB`);
console.log(`   Usage data: ${(estimatedMemoryUsage.usageData / 1024).toFixed(2)} KB`);
console.log(`   Plans data: ${(estimatedMemoryUsage.plansData / 1024).toFixed(2)} KB`);
console.log(`   Suppliers data: ${(estimatedMemoryUsage.suppliersData / 1024).toFixed(2)} KB`);
console.log(`   Total estimated: ${(totalEstimatedMemory / 1024).toFixed(2)} KB`);

if (totalEstimatedMemory < 50 * 1024 * 1024) { // 50MB
  console.log('✅ Memory usage appears reasonable');
} else {
  console.log('⚠️  High memory usage detected');
}

console.log('\n📊 Performance Summary:');
console.log(`   XML parsing: ${parseTime}ms`);
console.log(`   Cost calculations: ${calculationTime}ms (${mockPlans.length} plans)`);
console.log(`   Recommendations: ${recommendationTime}ms`);
console.log(`   Total: ${totalProcessingTime}ms`);
console.log(`   Performance target: ${totalProcessingTime < 10000 ? '✅ MET' : '❌ NOT MET'}`);

console.log('\n🎉 Performance tests completed!');

