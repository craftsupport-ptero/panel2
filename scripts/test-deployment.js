#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuration
const config = {
  baseUrl: process.env.TEST_URL || 'https://your-worker.your-subdomain.workers.dev',
  timeout: 10000,
};

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
};

let authToken = null;

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const req = lib.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Pterodactyl-Test-Client/1.0',
        ...options.headers,
      },
      timeout: config.timeout,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null,
          };
          resolve(response);
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  console.log(`🧪 Testing ${name}...`);
  
  try {
    const response = await makeRequest(url, options);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`✅ ${name} - Status: ${response.status}`);
      return response;
    } else {
      console.log(`❌ ${name} - Status: ${response.status}`);
      if (response.data) {
        console.log(`   Error: ${JSON.stringify(response.data, null, 2)}`);
      }
      return null;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Pterodactyl Panel deployment test...');
  console.log(`Base URL: ${config.baseUrl}\n`);
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Health check
  const health = await testEndpoint(
    'Health Check',
    `${config.baseUrl}/health`
  );
  
  if (health) {
    passed++;
    console.log(`   Environment: ${health.data.environment}`);
  } else {
    failed++;
  }
  
  // Test 2: Root endpoint
  const root = await testEndpoint(
    'Root Endpoint',
    `${config.baseUrl}/`
  );
  
  if (root) {
    passed++;
    console.log(`   API Version: ${root.data.version}`);
  } else {
    failed++;
  }
  
  // Test 3: 404 handling
  const notFound = await testEndpoint(
    '404 Error Handling',
    `${config.baseUrl}/non-existent-endpoint`
  );
  
  if (notFound && notFound.status === 404) {
    passed++;
  } else {
    failed++;
  }
  
  // Test 4: Authentication - Register (if enabled)
  console.log(`🧪 Testing User Registration...`);
  const register = await makeRequest(`${config.baseUrl}/api/auth/register`, {
    method: 'POST',
    body: testUser,
  });
  
  if (register && register.status === 201) {
    console.log(`✅ User Registration - Status: ${register.status}`);
    authToken = register.data.attributes.token;
    passed++;
  } else if (register && register.status === 409) {
    console.log(`⚠️  User Registration - User already exists (expected)`);
    
    // Try login instead
    console.log(`🧪 Testing User Login...`);
    const login = await makeRequest(`${config.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    
    if (login && login.status === 200) {
      console.log(`✅ User Login - Status: ${login.status}`);
      authToken = login.data.attributes.token;
      passed++;
    } else {
      console.log(`❌ User Login - Status: ${login ? login.status : 'Failed'}`);
      failed++;
    }
  } else {
    console.log(`❌ User Registration - Status: ${register ? register.status : 'Failed'}`);
    failed++;
  }
  
  // Test 5: Authenticated endpoints (if we have a token)
  if (authToken) {
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
    };
    
    // Test current user
    const me = await testEndpoint(
      'Get Current User',
      `${config.baseUrl}/api/auth/me`,
      { headers: authHeaders }
    );
    
    if (me) {
      passed++;
      console.log(`   User: ${me.data.attributes.email}`);
    } else {
      failed++;
    }
    
    // Test client servers
    const servers = await testEndpoint(
      'List Client Servers',
      `${config.baseUrl}/api/client/servers`,
      { headers: authHeaders }
    );
    
    if (servers) {
      passed++;
      console.log(`   Servers: ${servers.data.data.length}`);
    } else {
      failed++;
    }
    
    // Test client permissions
    const permissions = await testEndpoint(
      'Get Client Permissions',
      `${config.baseUrl}/api/client/permissions`,
      { headers: authHeaders }
    );
    
    if (permissions) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Test 6: Rate limiting
  console.log(`🧪 Testing Rate Limiting...`);
  let rateLimitHit = false;
  
  for (let i = 0; i < 10; i++) {
    const response = await makeRequest(`${config.baseUrl}/api/auth/login`, {
      method: 'POST',
      body: { email: 'invalid@example.com', password: 'invalid' },
    });
    
    if (response && response.status === 429) {
      rateLimitHit = true;
      break;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (rateLimitHit) {
    console.log(`✅ Rate Limiting - Working correctly`);
    passed++;
  } else {
    console.log(`⚠️  Rate Limiting - Not triggered (may be configured differently)`);
    // Not counting as failure since rate limits might be configured differently
  }
  
  // Test 7: CORS headers
  const cors = await testEndpoint(
    'CORS Headers',
    `${config.baseUrl}/`,
    { method: 'OPTIONS' }
  );
  
  if (cors && cors.headers['access-control-allow-origin']) {
    console.log(`✅ CORS Headers - Status: ${cors.status}`);
    passed++;
  } else {
    console.log(`❌ CORS Headers - Missing or invalid`);
    failed++;
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Deployment is working correctly.');
    return 0;
  } else if (failed <= 2) {
    console.log('\n⚠️  Most tests passed. Some minor issues detected.');
    return 1;
  } else {
    console.log('\n❌ Multiple test failures. Please check the deployment.');
    return 2;
  }
}

// Performance test
async function runPerformanceTest() {
  console.log('\n🚀 Running performance test...');
  
  const testUrl = `${config.baseUrl}/health`;
  const requests = 50;
  const concurrency = 10;
  
  const startTime = Date.now();
  const results = [];
  
  // Run concurrent requests
  const chunks = [];
  for (let i = 0; i < requests; i += concurrency) {
    chunks.push(Array.from({ length: Math.min(concurrency, requests - i) }));
  }
  
  for (const chunk of chunks) {
    const promises = chunk.map(async () => {
      const reqStart = Date.now();
      try {
        const response = await makeRequest(testUrl);
        const reqEnd = Date.now();
        return {
          status: response.status,
          time: reqEnd - reqStart,
          success: response.status >= 200 && response.status < 300,
        };
      } catch (error) {
        const reqEnd = Date.now();
        return {
          status: 0,
          time: reqEnd - reqStart,
          success: false,
          error: error.message,
        };
      }
    });
    
    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // Calculate statistics
  const successfulRequests = results.filter(r => r.success);
  const responseTimes = successfulRequests.map(r => r.time);
  
  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);
    const p95Time = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
    
    console.log('📊 Performance Results:');
    console.log(`Total Requests: ${requests}`);
    console.log(`Successful: ${successfulRequests.length} (${Math.round((successfulRequests.length / requests) * 100)}%)`);
    console.log(`Total Time: ${totalTime}ms`);
    console.log(`Requests/sec: ${Math.round((requests / totalTime) * 1000)}`);
    console.log(`Average Response Time: ${Math.round(avgTime)}ms`);
    console.log(`Min Response Time: ${minTime}ms`);
    console.log(`Max Response Time: ${maxTime}ms`);
    console.log(`95th Percentile: ${p95Time}ms`);
    
    if (avgTime < 100) {
      console.log('🚀 Excellent performance! Sub-100ms average response time.');
    } else if (avgTime < 500) {
      console.log('✅ Good performance! Response times under 500ms.');
    } else {
      console.log('⚠️  Performance could be improved. Consider optimization.');
    }
  } else {
    console.log('❌ Performance test failed - no successful requests');
  }
}

// Main execution
async function main() {
  const exitCode = await runTests();
  
  if (process.argv.includes('--performance')) {
    await runPerformanceTest();
  }
  
  process.exit(exitCode);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(3);
  });
}

module.exports = { runTests, runPerformanceTest };