import { spawn } from 'child_process';
import type { PDGInfo } from '../types';
import { cleanAnsi } from '../helpers';

export const getPDGInfo = async (privateKey: string): Promise<PDGInfo> => {
  return new Promise((resolve, reject) => {
    const cli = spawn(
      'yarn',
      ['lsvCLI', 'contracts', 'pdg', 'r', 'info', '--yes'],
      {
        env: {
          ...process.env,
          PRIVATE_KEY: privateKey,
        },
      },
    );

    let stdout = '';
    let stderr = '';

    cli.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    cli.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    cli.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with code ${code}\n${stderr}`));
      }

      const raw = cleanAnsi(stdout + stderr);
      const lines = raw.split('\n');
      const rowRegex = /^\s*│\s*(.+?)\s*│\s*(.+?)\s*│?$/;

      let CONTRACT_ADDRESS: string | undefined;
      let DEFAULT_ADMIN_ROLE: string | undefined;
      let RESUME_ROLE: string | undefined;
      let PAUSE_ROLE: string | undefined;
      let BEACON_ROOTS: string | undefined;
      let GI_FIRST_VALIDATOR_CURR: string | undefined;
      let GI_FIRST_VALIDATOR_PREV: string | undefined;
      let GI_PUBKEY_WC_PARENT: string | undefined;
      let GI_STATE_ROOT: string | undefined;
      let MAX_SUPPORTED_WC_VERSION: number | undefined;
      let MIN_SUPPORTED_WC_VERSION: number | undefined;
      let PREDEPOSIT_AMOUNT: string | undefined;
      let PIVOT_SLOT: string | undefined;
      let isPaused: boolean | undefined;
      let resumeSinceTimestamp: string | undefined;

      for (const line of lines) {
        const match = line.match(rowRegex);
        if (!match) continue;

        const key = String(match[1]?.trim());
        const value = String(match[2]?.trim());

        switch (key) {
          case 'CONTRACT_ADDRESS':
            CONTRACT_ADDRESS = value;
            break;
          case 'DEFAULT_ADMIN_ROLE':
            DEFAULT_ADMIN_ROLE = value;
            break;
          case 'RESUME_ROLE':
            RESUME_ROLE = value;
            break;
          case 'PAUSE_ROLE':
            PAUSE_ROLE = value;
            break;
          case 'BEACON_ROOTS':
            BEACON_ROOTS = value;
            break;
          case 'GI_FIRST_VALIDATOR_CURR':
            GI_FIRST_VALIDATOR_CURR = value;
            break;
          case 'GI_FIRST_VALIDATOR_PREV':
            GI_FIRST_VALIDATOR_PREV = value;
            break;
          case 'GI_PUBKEY_WC_PARENT':
            GI_PUBKEY_WC_PARENT = value;
            break;
          case 'GI_STATE_ROOT':
            GI_STATE_ROOT = value;
            break;
          case 'MAX_SUPPORTED_WC_VERSION':
            MAX_SUPPORTED_WC_VERSION = Number(value);
            break;
          case 'MIN_SUPPORTED_WC_VERSION':
            MIN_SUPPORTED_WC_VERSION = Number(value);
            break;
          case 'PREDEPOSIT_AMOUNT':
            PREDEPOSIT_AMOUNT = value;
            break;
          case 'PIVOT_SLOT':
            PIVOT_SLOT = value;
            break;
          case 'isPaused':
            isPaused =
              value.toLowerCase() === 'true' ||
              value === '1' ||
              value === 'True';
            break;
          case 'resumeSinceTimestamp':
            resumeSinceTimestamp = value;
            break;
          default:
            break;
        }
      }

      if (
        CONTRACT_ADDRESS === undefined ||
        DEFAULT_ADMIN_ROLE === undefined ||
        RESUME_ROLE === undefined ||
        PAUSE_ROLE === undefined ||
        BEACON_ROOTS === undefined ||
        GI_FIRST_VALIDATOR_CURR === undefined ||
        GI_FIRST_VALIDATOR_PREV === undefined ||
        GI_PUBKEY_WC_PARENT === undefined ||
        GI_STATE_ROOT === undefined ||
        MAX_SUPPORTED_WC_VERSION === undefined ||
        MIN_SUPPORTED_WC_VERSION === undefined ||
        PREDEPOSIT_AMOUNT === undefined ||
        PIVOT_SLOT === undefined ||
        isPaused === undefined ||
        resumeSinceTimestamp === undefined
      ) {
        return reject(
          new Error('Failed to parse PDG info from CLI output:\n' + raw),
        );
      }

      resolve({
        CONTRACT_ADDRESS: CONTRACT_ADDRESS as `0x${string}`,
        DEFAULT_ADMIN_ROLE: DEFAULT_ADMIN_ROLE as `0x${string}`,
        RESUME_ROLE: RESUME_ROLE as `0x${string}`,
        PAUSE_ROLE: PAUSE_ROLE as `0x${string}`,
        BEACON_ROOTS: BEACON_ROOTS as `0x${string}`,
        GI_FIRST_VALIDATOR_CURR: BigInt(GI_FIRST_VALIDATOR_CURR),
        GI_FIRST_VALIDATOR_PREV: BigInt(GI_FIRST_VALIDATOR_PREV),
        GI_PUBKEY_WC_PARENT: BigInt(GI_PUBKEY_WC_PARENT),
        GI_STATE_ROOT,
        MAX_SUPPORTED_WC_VERSION,
        MIN_SUPPORTED_WC_VERSION,
        PREDEPOSIT_AMOUNT: BigInt(PREDEPOSIT_AMOUNT),
        PIVOT_SLOT: BigInt(PIVOT_SLOT),
        isPaused,
        resumeSinceTimestamp: BigInt(resumeSinceTimestamp),
      });
    });
  });
};
