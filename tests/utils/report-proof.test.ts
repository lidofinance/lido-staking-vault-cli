import { describe, test, expect } from '@jest/globals';
import {
  DOUBLE_HASH,
  hashNode,
  getReportLeaf,
} from '../../utils/proof/report-proof.js';

const leafData = {
  vault_address: '0x' + '11'.repeat(20),
  total_value_wei: '1',
  in_out_delta: '2',
  fee: '3',
  liability_shares: '4',
};

describe('report proof utils', () => {
  test('DOUBLE_HASH', () => {
    const data = '0x1234';
    const expected = DOUBLE_HASH(data);
    expect(expected).toBe(DOUBLE_HASH(data));
  });

  test('hashNode sorts inputs', () => {
    const a = '0xaa';
    const b = '0xbb';
    const res1 = hashNode(a, b);
    const res2 = hashNode(b, a);
    expect(res1).toBe(res2);
  });

  test('getReportLeaf produces hash', () => {
    const leaf = getReportLeaf(leafData);
    expect(typeof leaf).toBe('string');
    expect(leaf).toMatch(/^0x/);
  });
});
