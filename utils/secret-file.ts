import { readFileSync, statSync } from 'node:fs';

import { resolvePath } from './resolve-path.js';

// Read a secret from file (systemd LoadCredential, Docker secrets)
export const readSecretFile = (filePath: string) => {
  const fullPath = resolvePath(filePath);

  // eslint-disable-next-line sonarjs/bitwise-operators -- file mode mask
  if ((statSync(fullPath).mode & 0o077) !== 0) {
    process.stderr.write(
      `Warning: ${filePath} is accessible by group/others, consider chmod 600\n`,
    );
  }

  return readFileSync(fullPath, 'utf8').replace(/\r?\n$/, '');
};

// Take a secret from <NAME> or <NAME>_FILE, never both
export const resolveSecret = (name: string, value?: string, file?: string) => {
  if (value && file) {
    throw new Error(`Provide only one of ${name} or ${name}_FILE`);
  }

  if (!file) return value;

  const secret = readSecretFile(file);
  if (!secret) {
    throw new Error(`${name}_FILE (${file}) is empty`);
  }

  return secret;
};
