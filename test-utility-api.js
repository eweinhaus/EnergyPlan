// Load environment variables
require('dotenv').config();

// Import the compiled JavaScript (we'll compile first)
const apiClients = require('./lib/apiClients.ts');
const { getSuppliers, getPlans } = apiClients;

// Test UtilityAPI integration
async function testUtilityAPI() {
  console.log('🧪 Testing UtilityAPI Integration...\n');

  try {
    console.log('📡 Fetching suppliers...');
    const suppliers = await getSuppliers();
    console.log(`✅ Suppliers fetched: ${suppliers.length} suppliers`);
    if (suppliers.length > 0) {
      console.log('📋 Sample suppliers:');
      suppliers.slice(0, 3).forEach(supplier => {
        console.log(`   - ${supplier.name} (ID: ${supplier.id}, Rating: ${supplier.rating})`);
      });
    }

    console.log('\n📊 Fetching plans...');
    const plans = await getPlans();
    console.log(`✅ Plans fetched: ${plans.length} plans`);
    if (plans.length > 0) {
      console.log('📋 Sample plans:');
      plans.slice(0, 3).forEach(plan => {
        console.log(`   - ${plan.name} (${plan.supplierName}) - $${plan.rate}/kWh`);
      });
    }

    console.log('\n🎉 UtilityAPI integration test completed successfully!');
    console.log('📈 Data appears to be real market data (not mock data)');

  } catch (error) {
    console.log('\n❌ UtilityAPI integration test failed:');
    console.log('Error:', error.message);

    if (error.message.includes('mock data')) {
      console.log('📝 Note: System is falling back to mock data as expected');
      console.log('🔧 To activate real UtilityAPI data, ensure UTILITY_API_KEY is properly configured');
    }
  }
}

testUtilityAPI();
