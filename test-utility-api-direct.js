const https = require('https');
const fs = require('fs');

// Load environment variables from .env manually
let envVars = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (error) {
  console.log('Could not read .env file:', error.message);
}

const UTILITY_API_BASE = 'https://utilityapi.com/api/v2';

// Test UtilityAPI connectivity
async function testUtilityAPI() {
  console.log('🧪 Testing UtilityAPI Integration...\n');

  const apiKey = envVars.UTILITY_API_KEY;
  if (!apiKey) {
    console.log('❌ UTILITY_API_KEY not found in environment');
    return;
  }

  console.log('🔑 API Key found, testing connectivity...\n');

  // First, test basic API connectivity and authentication
  try {
    console.log('🌐 Testing basic API connectivity and authentication...');
    const authTest = await makeAPIRequest('/authorizations', apiKey);
    console.log('✅ API authentication working');
    console.log('Auth response:', JSON.stringify(authTest, null, 2));
  } catch (error) {
    console.log('❌ API authentication failed:', error.message);
    console.log('💡 This could mean:');
    console.log('   - API key is invalid or expired');
    console.log('   - API key doesn\'t have access to these endpoints');
    console.log('   - UtilityAPI API structure has changed');
    console.log('   - Wrong API base URL');
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test suppliers endpoint
  try {
    console.log('📡 Testing suppliers endpoint (/suppliers?state=TX)...');
    const suppliersData = await makeAPIRequest('/suppliers?state=TX', apiKey);
    console.log('✅ Suppliers endpoint response received');
    console.log('Response:', JSON.stringify(suppliersData, null, 2));
  } catch (error) {
    console.log('❌ Suppliers endpoint failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test plans endpoint
  try {
    console.log('📊 Testing plans endpoint (/plans?state=TX&active=true)...');
    const plansData = await makeAPIRequest('/plans?state=TX&active=true', apiKey);
    console.log('✅ Plans endpoint response received');
    console.log('Response:', JSON.stringify(plansData, null, 2));
  } catch (error) {
    console.log('❌ Plans endpoint failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Try alternative endpoints that might exist
  const alternativeEndpoints = [
    '/authorizations',
    '/accounts',
    '/users',
    '/utilities',
    '/retailers',
    '/suppliers/texas',
    '/plans/texas',
    '/market/texas',
    '/retail_services/texas',
    '/service_providers'
  ];

  console.log('🔍 Testing alternative endpoints...');
  for (const endpoint of alternativeEndpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const data = await makeAPIRequest(endpoint, apiKey);
      console.log(`✅ ${endpoint} works!`);
      console.log('Response:', JSON.stringify(data, null, 2));
      break; // Stop at first working endpoint
    } catch (error) {
      console.log(`❌ ${endpoint} failed: ${error.message}`);
    }
  }

  console.log('\n🎯 UtilityAPI Integration Test Complete');
}

function makeAPIRequest(endpoint, apiKey) {
  return new Promise((resolve, reject) => {
    const url = `${UTILITY_API_BASE}${endpoint}`;

    const options = {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`JSON parse error: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

testUtilityAPI().catch(console.error);
