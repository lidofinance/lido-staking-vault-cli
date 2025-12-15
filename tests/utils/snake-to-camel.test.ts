import { describe, it, expect } from 'vitest';
import { snakeToCamel } from 'utils/snake-to-camel.js';

describe('snakeToCamel', () => {
  it('should convert snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld');
    expect(snakeToCamel('foo_bar_baz')).toBe('fooBarBaz');
    expect(snakeToCamel('test_value')).toBe('testValue');
  });

  it('should handle single word without underscores', () => {
    expect(snakeToCamel('hello')).toBe('hello');
    expect(snakeToCamel('test')).toBe('test');
  });

  it('should handle multiple consecutive underscores', () => {
    expect(snakeToCamel('hello__world')).toBe('hello_World');
    expect(snakeToCamel('foo___bar')).toBe('foo__Bar');
  });

  it('should handle leading underscores', () => {
    expect(snakeToCamel('_hello_world')).toBe('HelloWorld');
    expect(snakeToCamel('__test')).toBe('_Test');
  });

  it('should handle trailing underscores', () => {
    expect(snakeToCamel('hello_world_')).toBe('helloWorld_');
    expect(snakeToCamel('test__')).toBe('test__');
  });

  it('should handle empty string', () => {
    expect(snakeToCamel('')).toBe('');
  });

  it('should only convert lowercase letters after underscore', () => {
    expect(snakeToCamel('hello_World')).toBe('hello_World');
    expect(snakeToCamel('foo_Bar_baz')).toBe('foo_BarBaz');
  });

  it('should handle numbers', () => {
    expect(snakeToCamel('test_123_value')).toBe('test_123Value');
    expect(snakeToCamel('var_1_name')).toBe('var_1Name');
  });
});
