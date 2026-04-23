import { describe, test, expect } from 'vitest';
import { isValidUrl } from '../../utils/data-validators.js';

describe('isValidUrl scheme restriction (L2)', () => {
  test('accepts https URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  test('accepts http URL', () => {
    expect(isValidUrl('http://localhost:8080')).toBe(true);
  });

  test('rejects file:// URL', () => {
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });

  test('rejects javascript: URL', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });

  test('rejects ftp:// URL', () => {
    expect(isValidUrl('ftp://files.example.com')).toBe(false);
  });

  test('rejects data: URL', () => {
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  test('rejects invalid URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
  });

  test('rejects undefined', () => {
    expect(isValidUrl(undefined)).toBe(false);
  });

  test('rejects empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });
});
