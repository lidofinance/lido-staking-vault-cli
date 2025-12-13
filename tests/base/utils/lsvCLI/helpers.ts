import { spawn } from 'child_process';

export const cleanAnsi = (str: string): string => {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001B\[[0-9;]*m/g, '');
};

export const runCLICommand = (
  args: string[],
  privateKey: string,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const cli = spawn('yarn', ['lsvCLI', ...args], {
      env: {
        ...process.env,
        PRIVATE_KEY: privateKey,
      },
    });

    let stderr = '';
    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    cli.on('close', (code) => {
      code !== 0
        ? reject(new Error(`CLI exited with code ${code}\n${stderr}`))
        : resolve();
    });
  });
