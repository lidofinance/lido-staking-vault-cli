import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Process-level check on the shipped artifact. Anything written to stdout
// before commander parses — a dotenv banner, a chain-resolution log — lands
// ahead of the JSON and breaks `--json | jq`, and in-process tests cannot see
// it. Running dist/ also catches a build that emits unloadable imports.

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const CLI = path.join(REPO_ROOT, 'dist', 'index.js');

// A cwd with its own .env, so dotenv has a file to load and report on, and a
// configs/ link so chain resolution runs instead of failing on a missing file.
const makeSandbox = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lsv-json-'));
  fs.writeFileSync(
    path.join(dir, '.env'),
    'DEPLOYED=deployed-mainnet-vaults.json\nCHAIN_ID=1\n',
  );
  fs.symlinkSync(path.join(REPO_ROOT, 'configs'), path.join(dir, 'configs'));
  return dir;
};

// EL_URL is cleared so the run stays offline and deterministic: the command
// fails with a known error instead of reaching out to an RPC endpoint.
const runCli = (cwd: string, args: string[]): string => {
  const env = { ...process.env, EL_URL: '' };
  try {
    return execFileSync(process.execPath, [CLI, ...args], {
      cwd,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 60_000,
    });
  } catch (error) {
    // The CLI exits 1 on error but still writes a complete JSON document.
    const stdout = (error as { stdout?: string }).stdout;
    if (typeof stdout === 'string') return stdout;
    throw error;
  }
};

const withSandbox = (fn: (cwd: string) => void): void => {
  const sandbox = makeSandbox();
  try {
    fn(sandbox);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
};

describe('--json stdout is machine-readable', () => {
  beforeAll(() => {
    if (!fs.existsSync(CLI)) {
      throw new Error(`${CLI} is missing — run \`yarn build\` first`);
    }
  });

  it('emits nothing but JSON, even when the command fails', () => {
    withSandbox((cwd) => {
      const stdout = runCli(cwd, ['--json', 'r', 'read', 'latest-report-data']);

      expect(stdout.trimStart().startsWith('[')).toBe(true);
      expect(() => JSON.parse(stdout) as unknown).not.toThrow();
    });
  });

  it('closes the array it opened, so the failure is readable', () => {
    withSandbox((cwd) => {
      const parsed = JSON.parse(
        runCli(cwd, ['--json', 'r', 'read', 'latest-report-data']),
      ) as { error?: string }[];

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.at(-1)?.error).toEqual(expect.any(String));
    });
  });
});
