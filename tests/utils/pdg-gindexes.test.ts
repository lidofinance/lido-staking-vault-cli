import { describe, it, expect, vi } from 'vitest';
import { BaseError, ContractFunctionExecutionError } from 'viem';

vi.mock('utils', async () => {
  const logging = await vi.importActual<
    typeof import('utils/logging/console.js')
  >('../../utils/logging/console.js');
  const errorHandler = await vi.importActual<
    typeof import('utils/error-handler.js')
  >('../../utils/error-handler.js');

  return {
    ...logging,
    ...errorHandler,
    showSpinner: () => () => {},
    callReadMethodSilent: vi.fn(),
  };
});

vi.mock('contracts', () => ({ getPredepositGuaranteeContract: vi.fn() }));

const importSubject = async () => {
  const { readPdgGIndexes } = await import('../../features/pdg.js');
  return readPdgGIndexes;
};

type Contract = Parameters<Awaited<ReturnType<typeof importSubject>>>[0];

const PRE_GLOAS =
  '0x0000000000000000000000000000000000000000000000000096000000000028';
const VALIDATORS =
  '0x0000000000000000000000000000000000000000000000000000000000016600';

const missingGetter = (functionName: string) =>
  new ContractFunctionExecutionError(new BaseError('execution reverted'), {
    abi: [],
    functionName,
  });

const makeContract = (read: Record<string, () => Promise<unknown>>) =>
  ({
    read,
    address: '0x0000000000000000000000000000000000000001',
  }) as unknown as Contract;

describe('readPdgGIndexes', () => {
  it('reads the Gloas getters when the deployment exposes them', async () => {
    const readPdgGIndexes = await importSubject();
    const prev = vi.fn();
    const curr = vi.fn();

    const result = await readPdgGIndexes(
      makeContract({
        GI_FIRST_VALIDATOR_PRE_GLOAS: async () => PRE_GLOAS,
        GI_VALIDATORS: async () => VALIDATORS,
        GI_FIRST_VALIDATOR_PREV: prev,
        GI_FIRST_VALIDATOR_CURR: curr,
      }),
    );

    expect(result).toEqual({
      GI_FIRST_VALIDATOR_PRE_GLOAS: PRE_GLOAS,
      GI_VALIDATORS: VALIDATORS,
    });
    expect(prev).not.toHaveBeenCalled();
    expect(curr).not.toHaveBeenCalled();
  });

  it('falls back to the pre-Gloas getters when the Gloas ones are absent', async () => {
    const readPdgGIndexes = await importSubject();

    const result = await readPdgGIndexes(
      makeContract({
        GI_FIRST_VALIDATOR_PRE_GLOAS: async () => {
          throw missingGetter('GI_FIRST_VALIDATOR_PRE_GLOAS');
        },
        GI_VALIDATORS: async () => {
          throw missingGetter('GI_VALIDATORS');
        },
        GI_FIRST_VALIDATOR_PREV: async () => PRE_GLOAS,
        GI_FIRST_VALIDATOR_CURR: async () => PRE_GLOAS,
      }),
    );

    expect(result).toEqual({
      GI_FIRST_VALIDATOR_PREV: PRE_GLOAS,
      GI_FIRST_VALIDATOR_CURR: PRE_GLOAS,
    });
  });

  it('names both layouts when the ABI matches neither deployment', async () => {
    const readPdgGIndexes = await importSubject();
    const absent = (functionName: string) => async () => {
      throw missingGetter(functionName);
    };

    await expect(
      readPdgGIndexes(
        makeContract({
          GI_FIRST_VALIDATOR_PRE_GLOAS: absent('GI_FIRST_VALIDATOR_PRE_GLOAS'),
          GI_VALIDATORS: absent('GI_VALIDATORS'),
          GI_FIRST_VALIDATOR_PREV: absent('GI_FIRST_VALIDATOR_PREV'),
          GI_FIRST_VALIDATOR_CURR: absent('GI_FIRST_VALIDATOR_CURR'),
        }),
      ),
    ).rejects.toThrow(/exposes neither the Gloas gindex getters/);
  });

  it('rethrows transport failures instead of falling back', async () => {
    const readPdgGIndexes = await importSubject();
    const prev = vi.fn();

    await expect(
      readPdgGIndexes(
        makeContract({
          GI_FIRST_VALIDATOR_PRE_GLOAS: async () => {
            throw new Error('socket hang up');
          },
          GI_VALIDATORS: async () => VALIDATORS,
          GI_FIRST_VALIDATOR_PREV: prev,
          GI_FIRST_VALIDATOR_CURR: prev,
        }),
      ),
    ).rejects.toThrow('socket hang up');

    expect(prev).not.toHaveBeenCalled();
  });
});
