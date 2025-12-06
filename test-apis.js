#!/usr/bin/env node

// Test script to verify API connectivity and endpoints
const fs = require('fs');
const https = require('https');

// Load environment variables from .env file
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

const EIA_API_KEY = envVars.EIA_API_KEY;
const UTILITY_API_KEY = envVars.UTILITY_API_KEY;

console.log('🔍 API Key Status:');
console.log('  EIA_API_KEY:', EIA_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  UTILITY_API_KEY:', UTILITY_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('');

// Test EIA API first (known to work)
async function testEIA() {
  console.log('🧪 Testing EIA API...');
  if (!EIA_API_KEY) {
    console.log('❌ EIA_API_KEY not configured');
    return;
  }

  try {
    const url = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${EIA_API_KEY}&frequency=monthly&data[0]=customers&facets[stateid][]=TX&facets[sectorid][]=RES&sort[0][column]=period&sort[0][direction]=desc&length=1`;

    const response = await makeRequest(url);
    if (response.statusCode === 200) {
      console.log('✅ EIA API working');
      const data = JSON.parse(response.data);
      console.log('  Response contains data:', data.response && data.response.data ? 'YES' : 'NO');
    } else {
      console.log('❌ EIA API failed:', response.statusCode);
    }
  } catch (error) {
    console.log('❌ EIA API error:', error.message);
  }
}

// Test various energy APIs
async function testAPIs() {
  const testCases = [
    {
      name: 'Genability LSEs',
      url: 'https://api.genability.com/rest/public/lses?country=US&state=TX',
      auth: UTILITY_API_KEY ? `Bearer ${UTILITY_API_KEY}` : null
    },
    {
      name: 'Genability Tariffs',
      url: 'https://api.genability.com/rest/public/tariffs?country=US&state=TX&customerClasses=1',
      auth: UTILITY_API_KEY ? `Bearer ${UTILITY_API_KEY}` : null
    },
    {
      name: 'Arcadia Suppliers',
      url: 'https://api.arcadia.com/v2/suppliers?state=TX',
      auth: UTILITY_API_KEY ? `Bearer ${UTILITY_API_KEY}` : null
    },
    {
      name: 'UtilityAPI Suppliers',
      url: 'https://utilityapi.com/api/v2/suppliers?state=TX',
      auth: UTILITY_API_KEY ? `Bearer ${UTILITY_API_KEY}` : null
    },
    {
      name: 'UtilityAPI Utilities',
      url: 'https://utilityapi.com/api/v2/utilities?state=TX',
      auth: UTILITY_API_KEY ? `Bearer ${UTILITY_API_KEY}` : null
    }
  ];

  console.log('🔍 Testing Energy APIs...\n');

  for (const testCase of testCases) {
    console.log(`Testing ${testCase.name}...`);
    try {
      const response = await makeRequest(testCase.url, testCase.auth);
      if (response.statusCode === 200) {
        console.log(`✅ ${testCase.name}: SUCCESS`);
        try {
          const data = JSON.parse(response.data);
          if (data.results && Array.isArray(data.results)) {
            console.log(`  📊 Found ${data.results.length} results`);
          } else if (data.suppliers && Array.isArray(data.suppliers)) {
            console.log(`  📊 Found ${data.suppliers.length} suppliers`);
          } else if (Array.isArray(data)) {
            console.log(`  📊 Found ${data.length} items`);
          } else {
            console.log('  📊 Response format unknown');
          }
        } catch (e) {
          console.log('  📊 Could not parse response');
        }
      } else if (response.statusCode === 401) {
        console.log(`❌ ${testCase.name}: UNAUTHORIZED (check API key)`);
      } else if (response.statusCode === 403) {
        console.log(`❌ ${testCase.name}: FORBIDDEN (API key lacks permissions)`);
      } else if (response.statusCode === 404) {
        console.log(`❌ ${testCase.name}: NOT FOUND (endpoint doesn't exist)`);
      } else {
        console.log(`❌ ${testCase.name}: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
    }
    console.log('');
  }
}

function makeRequest(url, authHeader = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EnergyPlan-Test/1.0'
      }
    };

    if (authHeader) {
      options.headers['Authorization'] = authHeader;
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Run tests
async function main() {
  await testEIA();
  console.log('');
  await testAPIs();
}

main().catch(console.error);
