import { describe, expect, test, vi, beforeEach } from 'vitest';

const mockLogResult = vi.fn();

vi.mock('utils', () => ({
  logResult: mockLogResult,
}));

const importSubject = async () => {
  const { getFirstValidatorGIndex } =
    await import('../../utils/proof/first-validator-gindex.js');
  return getFirstValidatorGIndex;
};

const rowsFor = async (forks: string[]) => {
  const getFirstValidatorGIndex = await importSubject();
  getFirstValidatorGIndex(forks);
  return mockLogResult.mock.calls[0]?.[0]?.data as string[][];
};

// Values the verifiers are deployed with, see deploy params in lidofinance/core
const CAPELLA_GINDEX =
  '0x0000000000000000000000000000000000000000000000000056000000000028';
const ELECTRA_GINDEX =
  '0x0000000000000000000000000000000000000000000000000096000000000028';
const GLOAS_GINDEX =
  '0x0000000000000000000000000000000000000000000000000000000000016600';

describe('getFirstValidatorGIndex', () => {
  beforeEach(() => {
    mockLogResult.mockClear();
  });

  test('packs first validator gindex with list depth before gloas', async () => {
    const rows = await rowsFor(['capella', 'deneb', 'electra', 'fulu']);

    expect(rows.map((row) => row[1])).toEqual([
      CAPELLA_GINDEX,
      CAPELLA_GINDEX,
      ELECTRA_GINDEX,
      ELECTRA_GINDEX,
    ]);
    expect(rows.map((row) => row[2])).toEqual([
      'gIFirstValidatorPreGloas',
      'gIFirstValidatorPreGloas',
      'gIFirstValidatorPreGloas',
      'gIFirstValidatorPreGloas',
    ]);
  });

  test('returns the validators field gindex with zero width for gloas', async () => {
    const rows = await rowsFor(['gloas']);

    expect(rows[0]).toEqual(['gloas', GLOAS_GINDEX, 'gIValidators']);
  });

  test('rejects an unknown fork instead of emitting a gindex', async () => {
    const getFirstValidatorGIndex = await importSubject();

    expect(() => getFirstValidatorGIndex(['notafork'])).toThrow(
      'Fork name [notafork] is not supported',
    );
    expect(mockLogResult).not.toHaveBeenCalled();
  });
});
