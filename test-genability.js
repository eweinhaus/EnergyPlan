#!/usr/bin/env node

// Test script to verify Genability API with authentication
const https = require('https');
const fs = require('fs');

// Load environment variables
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
  // .env file not found, that's okay
}

const GENABILITY_API_KEY = envVars.GENABILITY_API_KEY || process.env.GENABILITY_API_KEY;
const UTILITY_API_KEY = envVars.UTILITY_API_KEY || process.env.UTILITY_API_KEY;
const EIA_API_KEY = envVars.EIA_API_KEY || process.env.EIA_API_KEY;
// Prefer Genability API key, fallback to others
const API_KEY = GENABILITY_API_KEY || UTILITY_API_KEY || EIA_API_KEY;

console.log('🧪 Testing Genability API...\n');
console.log(`API Key Status:`);
console.log(`  GENABILITY_API_KEY: ${GENABILITY_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
console.log(`  UTILITY_API_KEY: ${UTILITY_API_KEY ? '✅ SET (fallback)' : '❌ NOT SET'}`);
console.log(`  EIA_API_KEY: ${EIA_API_KEY ? '✅ SET (fallback)' : '❌ NOT SET'}`);
console.log(`  Using: ${GENABILITY_API_KEY ? 'GENABILITY_API_KEY' : UTILITY_API_KEY ? 'UTILITY_API_KEY' : EIA_API_KEY ? 'EIA_API_KEY' : 'NONE'}`);
if (!API_KEY) {
  console.log('\n💡 Note: Genability API requires authentication.');
  console.log('   Set GENABILITY_API_KEY in .env file (preferred)');
  console.log('   Or use UTILITY_API_KEY or EIA_API_KEY as fallback.\n');
} else if (!GENABILITY_API_KEY) {
  console.log('\n💡 Note: Using fallback API key. For best results, use GENABILITY_API_KEY.\n');
} else {
  console.log('');
}

async function testGenability(endpoint, name, apiKey) {
  return new Promise((resolve) => {
    const url = `https://api.genability.com/rest/public${endpoint}`;
    console.log(`Testing ${name}...`);
    console.log(`  URL: ${url}`);
    
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

    // Genability uses Basic Auth: API key as username, empty password
    if (apiKey) {
      const authString = Buffer.from(`${apiKey}:`).toString('base64');
      options.headers['Authorization'] = `Basic ${authString}`;
      console.log(`  Auth: Basic (API key provided)`);
    } else {
      console.log(`  Auth: None (will likely fail)`);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`  ✅ SUCCESS (HTTP ${res.statusCode})`);
            
            if (jsonData.results && Array.isArray(jsonData.results)) {
              console.log(`  📊 Found ${jsonData.results.length} results`);
              if (jsonData.results.length > 0) {
                console.log(`  📋 Sample result:`, JSON.stringify(jsonData.results[0], null, 2).substring(0, 200) + '...');
              }
            } else if (jsonData.status === 'success' && jsonData.results) {
              console.log(`  📊 API returned success status`);
              console.log(`  📋 Response structure:`, Object.keys(jsonData).join(', '));
            } else {
              console.log(`  📊 Response format:`, Object.keys(jsonData).join(', '));
              console.log(`  📋 Response preview:`, JSON.stringify(jsonData).substring(0, 200) + '...');
            }
          } catch (e) {
            console.log(`  ✅ SUCCESS (HTTP ${res.statusCode}) but could not parse JSON`);
            console.log(`  📋 Response preview:`, data.substring(0, 200));
          }
        } else if (res.statusCode === 401 || res.statusCode === 403) {
          console.log(`  ❌ UNAUTHORIZED/FORBIDDEN (HTTP ${res.statusCode})`);
          console.log(`  💡 This endpoint may require authentication`);
        } else if (res.statusCode === 404) {
          console.log(`  ❌ NOT FOUND (HTTP ${res.statusCode})`);
          console.log(`  💡 This endpoint doesn't exist`);
        } else {
          console.log(`  ❌ FAILED (HTTP ${res.statusCode})`);
          try {
            const errorData = JSON.parse(data);
            console.log(`  📋 Error:`, JSON.stringify(errorData).substring(0, 200));
          } catch (e) {
            console.log(`  📋 Response:`, data.substring(0, 200));
          }
        }
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log(`  ❌ ERROR: ${error.message}`);
      resolve({ statusCode: 0, error: error.message });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`  ❌ TIMEOUT: Request took longer than 10 seconds`);
      resolve({ statusCode: 0, error: 'timeout' });
    });

    req.end();
  });
}

async function main() {
  const testCases = [
    {
      endpoint: '/lses?country=US&state=TX',
      name: 'Genability LSEs (Load Serving Entities)'
    },
    {
      endpoint: '/tariffs?country=US&state=TX&customerClasses=1',
      name: 'Genability Tariffs (Plans)'
    }
  ];

  for (const testCase of testCases) {
    await testGenability(testCase.endpoint, testCase.name, API_KEY);
    console.log('');
  }

  console.log('✅ Test complete!');
  if (!API_KEY) {
    console.log('\n💡 Note: Genability API requires authentication via Basic Auth.');
    console.log('   Set UTILITY_API_KEY or EIA_API_KEY in your .env file to test with authentication.');
  } else {
    console.log('\n💡 Note: If you see 401/403 errors, your API key may be invalid or expired.');
    console.log('   If you see 404 errors, the endpoint may not exist or the URL is incorrect.');
  }
}

main().catch(console.error);

