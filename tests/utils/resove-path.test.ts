import { describe, expect, test } from 'vitest';
import path from 'node:path';
import { homedir } from 'node:os';

import { resolvePath } from '../../utils/resolve-path.js';

describe('resolvePath', () => {
  test('resolves relative path', () => {
    const rel = 'folder/file';
    expect(resolvePath(rel)).toBe(path.resolve(rel));
  });

  test('returns absolute path as is', () => {
    const abs = path.resolve('file');
    expect(resolvePath(abs)).toBe(abs);
  });

  test('expands tilde to home directory', () => {
    expect(resolvePath('~/test')).toBe(path.join(homedir(), 'test'));
  });
});
