#!/usr/bin/env node

// Script to test environment variables in the context of the application
// This should be run with the proper environment loaded

const fs = require('fs');
const path = require('path');

// Try to load .env file directly
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');

    const envVars = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    console.log('Could not load .env file:', error.message);
    return {};
  }
}

// Test API with loaded keys
async function testAPIs() {
  const envVars = loadEnvFile();

  console.log('🔍 Environment Variables Found:');
  console.log('  EIA_API_KEY:', envVars.EIA_API_KEY ? 'SET' : 'NOT SET');
  console.log('  UTILITY_API_KEY:', envVars.UTILITY_API_KEY ? 'SET' : 'NOT SET');

  if (!envVars.EIA_API_KEY && !envVars.UTILITY_API_KEY) {
    console.log('❌ No API keys found in .env file');
    return;
  }

  // Test EIA API
  if (envVars.EIA_API_KEY) {
    console.log('\n🧪 Testing EIA API...');
    try {
      const eiaUrl = `https://api.eia.gov/v2/electricity/retail-sales/data/?api_key=${envVars.EIA_API_KEY}&frequency=monthly&data[0]=customers&facets[stateid][]=TX&facets[sectorid][]=RES&sort[0][column]=period&sort[0][direction]=desc&length=1`;

      const response = await makeRequest(eiaUrl);
      if (response.statusCode === 200) {
        console.log('✅ EIA API working!');
        console.log('  Key appears to be valid');
      } else {
        console.log(`❌ EIA API failed: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log('❌ EIA API error:', error.message);
    }
  }

  // Test Genability API
  if (envVars.UTILITY_API_KEY) {
    console.log('\n🧪 Testing Genability API...');
    try {
      const genabilityUrl = 'https://api.genability.com/rest/public/lses?country=US&state=TX';

      const response = await makeRequest(genabilityUrl, `Bearer ${envVars.UTILITY_API_KEY}`);
      if (response.statusCode === 200) {
        console.log('✅ Genability API working!');
        console.log('  Key appears to be valid');
      } else if (response.statusCode === 401) {
        console.log('❌ Genability API: Invalid API key');
      } else {
        console.log(`❌ Genability API failed: HTTP ${response.statusCode}`);
      }
    } catch (error) {
      console.log('❌ Genability API error:', error.message);
    }
  }
}

function makeRequest(url, authHeader = null) {
  return new Promise((resolve, reject) => {
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false
    });

    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'EnergyPlan-Test/1.0'
      },
      agent
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

testAPIs().catch(console.error);
