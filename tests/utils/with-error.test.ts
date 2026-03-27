import { describe, it, expect } from 'vitest';
import { withError } from '../../utils/with-error.js';

describe('withError', () => {
  it('should return result and null error on resolved promise', async () => {
    const { result, error } = await withError(Promise.resolve(42));
    expect(result).toBe(42);
    expect(error).toBeNull();
  });

  it('should return null result and error on rejected promise', async () => {
    const originalError = new Error('test error');
    const { result, error } = await withError(Promise.reject(originalError));
    expect(result).toBeNull();
    expect(error).toBe(originalError);
  });

  it('should handle rejection with string error', async () => {
    const { result, error } = await withError(Promise.reject('string error'));
    expect(result).toBeNull();
    expect(error).toBe('string error');
  });

  it('should handle rejection with object error', async () => {
    const errorObj = { code: 404, message: 'not found' };
    const { result, error } = await withError(Promise.reject(errorObj));
    expect(result).toBeNull();
    expect(error).toEqual(errorObj);
  });

  it('should preserve complex resolved value types', async () => {
    const complexValue = { nested: { array: [1, 2, 3] }, flag: true };
    const { result, error } = await withError(Promise.resolve(complexValue));
    expect(result).toEqual(complexValue);
    expect(error).toBeNull();
  });

  it('should handle async function that throws', async () => {
    const asyncFn = async () => {
      throw new Error('async throw');
    };
    const { result, error } = await withError(asyncFn());
    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('async throw');
  });
});
