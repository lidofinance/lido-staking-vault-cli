import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Get current directory (works in both ESM and CommonJS after compilation)
const getCurrentDir = (): string => {
  try {
    // ESM way
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    // CommonJS way (fallback) - __dirname exists in CommonJS after compilation
    return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
};

// Find project root by looking for package.json
const findProjectRoot = (): string => {
  let currentDir = getCurrentDir();

  // Go up until we find package.json
  while (currentDir !== '/') {
    if (existsSync(path.resolve(currentDir, 'package.json'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  // Fallback to current directory
  return process.cwd();
};

const PROJECT_ROOT = findProjectRoot();

/**
 * Execute a CLI command and return the output
 * @param command - The CLI command to execute (without 'yarn start' prefix)
 * @param options - Additional options like cwd, env, etc.
 * @returns Command output
 */
export const executeCLICommand = async (
  command: string,
  options: { cwd?: string; env?: NodeJS.ProcessEnv; timeout?: number } = {},
): Promise<{
  stdout: string;
  stderr: string;
  success: boolean;
  exitCode?: number;
}> => {
  const cwd = options.cwd || PROJECT_ROOT;
  const env = { ...process.env, ...options.env };
  const timeout = options.timeout || 30000; // 30 seconds default timeout

  // Important: If PRIVATE_KEY is provided via env, clear ACCOUNT_FILE to avoid conflict
  // The CLI throws error if both are set: "You must provide only one of the following"
  if (env.PRIVATE_KEY) {
    env.ACCOUNT_FILE = '';
    env.ACCOUNT_FILE_PASSWORD = '';
  }

  // Debug: Log environment variables (only for debugging, remove in production)
  if (process.env.DEBUG_MCP) {
    console.error('[MCP DEBUG] PRIVATE_KEY present:', !!env.PRIVATE_KEY);
    console.error('[MCP DEBUG] ACCOUNT_FILE:', env.ACCOUNT_FILE);
    console.error('[MCP DEBUG] CHAIN_ID:', env.CHAIN_ID);
  }

  try {
    // Use compiled code directly instead of tsx
    const cliEntry = path.resolve(cwd, 'dist/index.js');
    // Use the same Node.js version that runs the MCP server
    const nodeExecutable = process.execPath;
    const { stdout, stderr } = await execAsync(
      `${nodeExecutable} ${cliEntry} ${command}`,
      {
        cwd,
        env,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      },
    );

    return { stdout, stderr, success: true, exitCode: 0 };
  } catch (error: any) {
    // Check if it's a timeout error
    if (error.killed && error.signal === 'SIGTERM') {
      return {
        stdout: error.stdout || '',
        stderr: `❌ Command timed out after ${timeout / 1000}s\n\nThis usually happens when a command requires interactive input.\nMake sure all required parameters are provided.\n\nCommand: ${command}`,
        success: false,
        exitCode: 124, // Standard timeout exit code
      };
    }

    // Command failed - return error output
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message || 'Command execution failed',
      success: false,
      exitCode: error.code || 1,
    };
  }
};

/**
 * Format CLI output for MCP response
 */
export const formatCLIOutput = (result: {
  stdout: string;
  stderr: string;
}): string => {
  let output = '';

  if (result.stdout) {
    output += result.stdout;
  }

  if (result.stderr) {
    if (output) output += '\n\n';
    output += `Warnings/Errors:\n${result.stderr}`;
  }

  return output || 'Command executed successfully with no output';
};
