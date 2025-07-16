#!/usr/bin/env node

/**
 * Test script for Pterodactyl Panel Serverless Migration
 * Validates API endpoints, authentication, and database operations
 */

const https = require('https');
const http = require('http');

class ServerlessAPITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'http://localhost:8787';
    this.authToken = null;
    this.testResults = [];
  }

  async request(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Pterodactyl-Serverless-Tester/1.0',
          ...headers,
        },
      };

      if (this.authToken && !headers.Authorization) {
        options.headers.Authorization = `Bearer ${this.authToken}`;
      }

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: parsed,
              raw: body,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: null,
              raw: body,
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  logTest(name, passed, details = '') {
    const result = { name, passed, details, timestamp: new Date().toISOString() };
    this.testResults.push(result);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
  }

  async testHealthEndpoint() {
    console.log('\n🏥 Testing Health Endpoints...');
    
    try {
      const response = await this.request('GET', '/health');
      this.logTest(
        'Health Check',
        response.status === 200 && response.data?.status === 'ok',
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Health Check', false, `Error: ${error.message}`);
    }

    try {
      const response = await this.request('GET', '/');
      this.logTest(
        'Root Endpoint',
        response.status === 200 && response.data?.message,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Root Endpoint', false, `Error: ${error.message}`);
    }

    try {
      const response = await this.request('GET', '/api');
      this.logTest(
        'API Info',
        response.status === 200 && response.data?.version,
        `Version: ${response.data?.version}`
      );
    } catch (error) {
      this.logTest('API Info', false, `Error: ${error.message}`);
    }
  }

  async testCORSHeaders() {
    console.log('\n🌐 Testing CORS Headers...');
    
    try {
      const response = await this.request('OPTIONS', '/api/auth/login', null, {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      });
      
      const hasCORSHeaders = 
        response.headers['access-control-allow-origin'] &&
        response.headers['access-control-allow-methods'] &&
        response.headers['access-control-allow-headers'];
      
      this.logTest(
        'CORS Preflight',
        response.status === 204 && hasCORSHeaders,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('CORS Preflight', false, `Error: ${error.message}`);
    }
  }

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication...');
    
    // Test login without credentials
    try {
      const response = await this.request('POST', '/api/auth/login', {});
      this.logTest(
        'Login Validation',
        response.status === 422,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Login Validation', false, `Error: ${error.message}`);
    }

    // Test login with invalid credentials
    try {
      const response = await this.request('POST', '/api/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      this.logTest(
        'Invalid Login',
        response.status === 401,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Invalid Login', false, `Error: ${error.message}`);
    }

    // Test protected endpoint without auth
    try {
      const response = await this.request('GET', '/api/auth/me');
      this.logTest(
        'Protected Endpoint (No Auth)',
        response.status === 401,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Protected Endpoint (No Auth)', false, `Error: ${error.message}`);
    }
  }

  async testRateLimiting() {
    console.log('\n⏱️ Testing Rate Limiting...');
    
    const requests = [];
    const maxRequests = 5; // Small number for testing
    
    for (let i = 0; i < maxRequests; i++) {
      requests.push(this.request('GET', '/api'));
    }
    
    try {
      const responses = await Promise.all(requests);
      const hasRateLimitHeaders = responses.some(r => 
        r.headers['x-ratelimit-limit'] || r.headers['x-ratelimit-remaining']
      );
      
      this.logTest(
        'Rate Limit Headers',
        hasRateLimitHeaders,
        `Headers present: ${hasRateLimitHeaders}`
      );
    } catch (error) {
      this.logTest('Rate Limit Headers', false, `Error: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    console.log('\n📡 Testing API Endpoints...');
    
    // Test client endpoints (should require auth)
    const clientEndpoints = [
      '/api/client/servers',
      '/api/application/users',
      '/api/application/servers',
      '/api/application/nodes',
    ];

    for (const endpoint of clientEndpoints) {
      try {
        const response = await this.request('GET', endpoint);
        this.logTest(
          `Endpoint ${endpoint}`,
          response.status === 401, // Should require authentication
          `Status: ${response.status}`
        );
      } catch (error) {
        this.logTest(`Endpoint ${endpoint}`, false, `Error: ${error.message}`);
      }
    }
  }

  async test404Handling() {
    console.log('\n🔍 Testing 404 Handling...');
    
    try {
      const response = await this.request('GET', '/nonexistent-endpoint');
      this.logTest(
        '404 Handling',
        response.status === 404,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('404 Handling', false, `Error: ${error.message}`);
    }
  }

  async testRegistration() {
    console.log('\n📝 Testing User Registration...');
    
    // Test registration with invalid data
    try {
      const response = await this.request('POST', '/api/auth/register', {
        username: 'a', // Too short
        email: 'invalid-email',
        password: '123' // Too weak
      });
      this.logTest(
        'Registration Validation',
        response.status === 422,
        `Status: ${response.status}`
      );
    } catch (error) {
      this.logTest('Registration Validation', false, `Error: ${error.message}`);
    }
  }

  generateSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = total - passed;
    
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.details}`));
    }

    return { total, passed, failed, results: this.testResults };
  }

  async runAllTests() {
    console.log('🚀 Starting Pterodactyl Serverless API Tests');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log('='.repeat(50));

    await this.testHealthEndpoint();
    await this.testCORSHeaders();
    await this.testAuthentication();
    await this.testRateLimiting();
    await this.testAPIEndpoints();
    await this.test404Handling();
    await this.testRegistration();

    return this.generateSummary();
  }
}

// Main execution
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:8787';
  const tester = new ServerlessAPITester(baseUrl);
  
  try {
    const summary = await tester.runAllTests();
    
    // Exit with error code if tests failed
    if (summary.failed > 0) {
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n💥 Test runner error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ServerlessAPITester };