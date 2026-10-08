import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { readSecretFile, resolveSecret } from '../../utils/secret-file.js';

describe('secret-file', () => {
  let dir: string;

  const writeSecret = (name: string, content: string, mode = 0o600) => {
    const filePath = path.join(dir, name);
    writeFileSync(filePath, content);
    chmodSync(filePath, mode);
    return filePath;
  };

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'secret-file-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe('readSecretFile', () => {
    test('reads secret from file', () => {
      const filePath = writeSecret('password', 'secret');
      expect(readSecretFile(filePath)).toBe('secret');
    });

    test('strips single trailing newline', () => {
      expect(readSecretFile(writeSecret('lf', 'secret\n'))).toBe('secret');
      expect(readSecretFile(writeSecret('crlf', 'secret\r\n'))).toBe('secret');
    });

    test('keeps inner and leading whitespace', () => {
      const filePath = writeSecret('password', ' sec ret\n\n');
      expect(readSecretFile(filePath)).toBe(' sec ret\n');
    });

    test('warns when file is accessible by group/others', () => {
      const stderr = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);
      const filePath = writeSecret('password', 'secret', 0o644);

      expect(readSecretFile(filePath)).toBe('secret');
      expect(stderr).toHaveBeenCalledWith(
        expect.stringContaining('consider chmod 600'),
      );
    });

    test('does not warn for 0600 file', () => {
      const stderr = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);
      readSecretFile(writeSecret('password', 'secret'));

      expect(stderr).not.toHaveBeenCalled();
    });

    test('does not leak secret in warning', () => {
      const stderr = vi
        .spyOn(process.stderr, 'write')
        .mockImplementation(() => true);
      readSecretFile(writeSecret('password', 'top-secret', 0o644));

      expect(String(stderr.mock.calls[0]?.[0])).not.toContain('top-secret');
    });

    test('throws on missing file', () => {
      expect(() => readSecretFile(path.join(dir, 'missing'))).toThrow();
    });
  });

  describe('resolveSecret', () => {
    test('returns value when no file is set', () => {
      expect(resolveSecret('PASSWORD', 'secret')).toBe('secret');
    });

    test('reads file when only file is set', () => {
      const filePath = writeSecret('password', 'from-file\n');
      expect(resolveSecret('PASSWORD', undefined, filePath)).toBe('from-file');
    });

    test('throws when both value and file are set', () => {
      const filePath = writeSecret('password', 'from-file');
      expect(() => resolveSecret('PASSWORD', 'secret', filePath)).toThrow(
        'Provide only one of PASSWORD or PASSWORD_FILE',
      );
    });

    test('throws when file is empty', () => {
      const empty = writeSecret('empty', '');
      const newline = writeSecret('newline', '\n');

      expect(() => resolveSecret('PASSWORD', undefined, empty)).toThrow(
        `PASSWORD_FILE (${empty}) is empty`,
      );
      expect(() => resolveSecret('PASSWORD', undefined, newline)).toThrow(
        'is empty',
      );
    });

    test('returns undefined when nothing is set', () => {
      expect(resolveSecret('PASSWORD')).toBeUndefined();
    });
  });
});
