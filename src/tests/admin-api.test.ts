/**
 * Basic tests for admin API functionality
 */

import { validateAdminPermission, validateBulkOperation, validateTimeframe } from '../schemas/admin';
import { validateEmailDriver, validatePasswordRequirements } from '../schemas/settings';
import { validateMetricName, validateTimeRange } from '../schemas/analytics';
import { getErrorMessage, formatBytes, calculatePercentage, isValidEmail, isValidUrl } from '../utils';

describe('Admin Schema Validation', () => {
  test('validateAdminPermission should work correctly', () => {
    expect(validateAdminPermission('admin.dashboard.view', ['admin.dashboard.view'])).toBe(true);
    expect(validateAdminPermission('admin.dashboard.view', ['admin.*'])).toBe(true);
    expect(validateAdminPermission('admin.dashboard.view', ['user.view'])).toBe(false);
  });

  test('validateBulkOperation should validate item counts', () => {
    expect(validateBulkOperation(50)).toBe(true);
    expect(validateBulkOperation(100)).toBe(true);
    expect(validateBulkOperation(101)).toBe(false);
    expect(validateBulkOperation(0)).toBe(false);
  });

  test('validateTimeframe should validate timeframe strings', () => {
    expect(validateTimeframe('24h')).toBe(true);
    expect(validateTimeframe('7d')).toBe(true);
    expect(validateTimeframe('invalid')).toBe(false);
  });
});

describe('Settings Schema Validation', () => {
  test('validateEmailDriver should validate email configurations', () => {
    expect(validateEmailDriver('smtp', {
      host: 'smtp.example.com',
      port: 587,
      encryption: 'tls'
    })).toBe(true);

    expect(validateEmailDriver('mailgun', {
      domain: 'example.com',
      secret: 'key-test'
    })).toBe(true);

    expect(validateEmailDriver('smtp', {
      // completely invalid smtp config
      invalid: 'config'
    })).toBe(false);
  });

  test('validatePasswordRequirements should validate passwords', () => {
    const requirements = {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false
    };

    const result1 = validatePasswordRequirements('Password123', requirements);
    expect(result1.valid).toBe(true);
    expect(result1.errors).toHaveLength(0);

    const result2 = validatePasswordRequirements('weak', requirements);
    expect(result2.valid).toBe(false);
    expect(result2.errors.length).toBeGreaterThan(0);
  });
});

describe('Analytics Schema Validation', () => {
  test('validateMetricName should validate metric names', () => {
    expect(validateMetricName('cpu.usage')).toBe(true);
    expect(validateMetricName('memory_usage')).toBe(true);
    expect(validateMetricName('invalid-metric-name')).toBe(false);
    expect(validateMetricName('123invalid')).toBe(false);
  });

  test('validateTimeRange should validate time ranges', () => {
    const start = '2024-01-01T00:00:00Z';
    const end = '2024-01-02T00:00:00Z';
    
    const result1 = validateTimeRange(start, end);
    expect(result1.valid).toBe(true);

    const result2 = validateTimeRange(end, start); // reversed
    expect(result2.valid).toBe(false);
    expect(result2.error).toContain('Start date must be before end date');
  });
});

describe('Utility Functions', () => {
  test('getErrorMessage should handle different error types', () => {
    expect(getErrorMessage(new Error('Test error'))).toBe('Test error');
    expect(getErrorMessage('String error')).toBe('String error');
    expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
    expect(getErrorMessage(null)).toBe('Unknown error occurred');
  });

  test('formatBytes should format byte values correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(1073741824)).toBe('1 GB');
  });

  test('calculatePercentage should calculate percentages correctly', () => {
    expect(calculatePercentage(50, 100)).toBe(50);
    expect(calculatePercentage(1, 3)).toBe(33.33);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(100, 0)).toBe(0);
  });

  test('isValidEmail should validate email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
  });

  test('isValidUrl should validate URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:8080')).toBe(true);
    expect(isValidUrl('ftp://files.example.com')).toBe(true);
    expect(isValidUrl('invalid-url')).toBe(false);
    expect(isValidUrl('https://')).toBe(false);
  });
});