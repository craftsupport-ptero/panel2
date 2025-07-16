// Test setup file for serverless API tests
import 'jest';

// Mock global fetch for testing
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalError;
  jest.clearAllMocks();
});

// Mock TextEncoder/TextDecoder for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock crypto for password hashing tests
if (typeof global.crypto === 'undefined') {
  global.crypto = require('crypto');
}