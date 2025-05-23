import { describe, expect, test } from '@jest/globals';

import { getValueByPath } from '../../utils/get-value.js';

describe('getValueByPath', () => {
  test('returns value for existing path', () => {
    const obj = { a: { b: { c: 5 } } };
    expect(getValueByPath(obj, 'a.b.c')).toBe(5);
  });

  test('returns undefined for missing path', () => {
    const obj = { a: { b: 1 } };
    expect(getValueByPath(obj, 'a.x.c')).toBeUndefined();
  });
});
