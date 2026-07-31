import { describe, test, expect } from 'vitest';
import type { AbiFunction, AbiParameter } from 'viem';

import { parseAbiArguments } from '../../utils/parse-abi-arguments.js';

const fn = (inputs: AbiParameter[]): AbiFunction => ({
  type: 'function',
  name: 'test',
  inputs,
  outputs: [],
  stateMutability: 'nonpayable',
});

const ADDR = '0x0000000000000000000000000000000000000001';

// --- parseAbiArguments (top-level) ---

describe('parseAbiArguments', () => {
  test('throws on argument count mismatch (too few)', () => {
    const abi = fn([{ name: 'a', type: 'uint256' }]);
    expect(() => parseAbiArguments(abi, [])).toThrow(
      /argument count mismatch/i,
    );
  });

  test('throws on argument count mismatch (too many)', () => {
    const abi = fn([]);
    expect(() => parseAbiArguments(abi, ['1'])).toThrow(
      /argument count mismatch/i,
    );
  });

  test('returns empty array for zero-arg function', () => {
    expect(parseAbiArguments(fn([]), [])).toEqual([]);
  });

  test('parses multiple inputs of different types', () => {
    const abi = fn([
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'flag', type: 'bool' },
    ]);
    expect(parseAbiArguments(abi, [ADDR, '1000', 'true'])).toEqual([
      ADDR,
      1000n,
      true,
    ]);
  });
});

// --- address ---

describe('address', () => {
  test('valid address passes through', () => {
    const abi = fn([{ name: 'x', type: 'address' }]);
    expect(parseAbiArguments(abi, [ADDR])).toEqual([ADDR]);
  });

  test('invalid address throws', () => {
    const abi = fn([{ name: 'x', type: 'address' }]);
    expect(() => parseAbiArguments(abi, ['0x123'])).toThrow(/invalid address/i);
  });

  test('non-hex string throws', () => {
    const abi = fn([{ name: 'x', type: 'address' }]);
    expect(() => parseAbiArguments(abi, ['notanaddress'])).toThrow();
  });
});

// --- bool ---

describe('bool', () => {
  test('"true" parses to boolean true', () => {
    const abi = fn([{ name: 'x', type: 'bool' }]);
    expect(parseAbiArguments(abi, ['true'])).toEqual([true]);
  });

  test('"false" parses to boolean false', () => {
    const abi = fn([{ name: 'x', type: 'bool' }]);
    expect(parseAbiArguments(abi, ['false'])).toEqual([false]);
  });

  test('invalid bool value throws', () => {
    const abi = fn([{ name: 'x', type: 'bool' }]);
    expect(() => parseAbiArguments(abi, ['yes'])).toThrow(/invalid bool/i);
  });

  test('"1" is not accepted as bool', () => {
    const abi = fn([{ name: 'x', type: 'bool' }]);
    expect(() => parseAbiArguments(abi, ['1'])).toThrow();
  });
});

// --- uint / int ---

describe('uint / int', () => {
  test('uint256: positive integer', () => {
    const abi = fn([{ name: 'x', type: 'uint256' }]);
    expect(parseAbiArguments(abi, ['42'])).toEqual([42n]);
  });

  test('uint256: zero is valid', () => {
    const abi = fn([{ name: 'x', type: 'uint256' }]);
    expect(parseAbiArguments(abi, ['0'])).toEqual([0n]);
  });

  test('uint256: large value stays precise', () => {
    const abi = fn([{ name: 'x', type: 'uint256' }]);
    const big = '1000000000000000000';
    expect(parseAbiArguments(abi, [big])).toEqual([1000000000000000000n]);
  });

  test('uint256: negative value throws', () => {
    const abi = fn([{ name: 'x', type: 'uint256' }]);
    expect(() => parseAbiArguments(abi, ['-1'])).toThrow(
      /unsigned integer cannot be negative/i,
    );
  });

  test('uint8: alias works (startsWith uint)', () => {
    const abi = fn([{ name: 'x', type: 'uint8' }]);
    expect(parseAbiArguments(abi, ['255'])).toEqual([255n]);
  });

  test('int256: negative value is valid', () => {
    const abi = fn([{ name: 'x', type: 'int256' }]);
    expect(parseAbiArguments(abi, ['-1000'])).toEqual([-1000n]);
  });

  test('int8: positive and negative', () => {
    const abi = fn([{ name: 'x', type: 'int8' }]);
    expect(parseAbiArguments(abi, ['-128'])).toEqual([-128n]);
  });

  test('non-numeric string throws', () => {
    const abi = fn([{ name: 'x', type: 'uint256' }]);
    expect(() => parseAbiArguments(abi, ['abc'])).toThrow();
  });
});

// --- bytesN (fixed-size) ---

describe('bytesN', () => {
  test('bytes32: correct-size hex passes', () => {
    const value = `0x${'aa'.repeat(32)}`;
    const abi = fn([{ name: 'x', type: 'bytes32' }]);
    expect(parseAbiArguments(abi, [value])).toEqual([value]);
  });

  test('bytes1: single byte passes', () => {
    const abi = fn([{ name: 'x', type: 'bytes1' }]);
    expect(parseAbiArguments(abi, ['0xff'])).toEqual(['0xff']);
  });

  test('bytes32: wrong size throws', () => {
    const abi = fn([{ name: 'x', type: 'bytes32' }]);
    expect(() => parseAbiArguments(abi, ['0xdead'])).toThrow(
      /expected 32 bytes/i,
    );
  });

  test('bytes32: non-hex throws', () => {
    const abi = fn([{ name: 'x', type: 'bytes32' }]);
    expect(() => parseAbiArguments(abi, ['notahex'])).toThrow(/invalid hex/i);
  });

  test('bytes4: correct size', () => {
    const abi = fn([{ name: 'x', type: 'bytes4' }]);
    expect(parseAbiArguments(abi, ['0xdeadbeef'])).toEqual(['0xdeadbeef']);
  });
});

// --- bytes (dynamic) ---

describe('bytes', () => {
  test('valid hex passes', () => {
    const abi = fn([{ name: 'x', type: 'bytes' }]);
    expect(parseAbiArguments(abi, ['0xdeadbeef'])).toEqual(['0xdeadbeef']);
  });

  test('empty bytes (0x) is valid', () => {
    const abi = fn([{ name: 'x', type: 'bytes' }]);
    expect(parseAbiArguments(abi, ['0x'])).toEqual(['0x']);
  });

  test('non-hex string throws', () => {
    const abi = fn([{ name: 'x', type: 'bytes' }]);
    expect(() => parseAbiArguments(abi, ['hello'])).toThrow(/invalid hex/i);
  });
});

// --- string ---

describe('string', () => {
  test('any string passes through unchanged', () => {
    const abi = fn([{ name: 'x', type: 'string' }]);
    expect(parseAbiArguments(abi, ['hello world'])).toEqual(['hello world']);
  });

  test('empty string is valid', () => {
    const abi = fn([{ name: 'x', type: 'string' }]);
    expect(parseAbiArguments(abi, [''])).toEqual(['']);
  });
});

// --- fixed-size arrays ---

describe('fixed-size array', () => {
  test('uint256[3]: correct elements parsed as bigints', () => {
    const abi = fn([{ name: 'x', type: 'uint256[3]' }]);
    expect(parseAbiArguments(abi, ['[1,2,3]'])).toEqual([[1n, 2n, 3n]]);
  });

  test('uint256[3]: wrong length throws', () => {
    const abi = fn([{ name: 'x', type: 'uint256[3]' }]);
    expect(() => parseAbiArguments(abi, ['[1,2]'])).toThrow(/length/i);
  });

  test('address[2]: elements parsed as addresses', () => {
    const abi = fn([{ name: 'x', type: 'address[2]' }]);
    expect(
      parseAbiArguments(abi, [
        `[${JSON.stringify(ADDR)},${JSON.stringify(ADDR)}]`,
      ]),
    ).toEqual([[ADDR, ADDR]]);
  });

  test('bool[2]: elements parsed as booleans', () => {
    const abi = fn([{ name: 'x', type: 'bool[2]' }]);
    expect(parseAbiArguments(abi, ['[true,false]'])).toEqual([[true, false]]);
  });

  // Acceptance test — exposes String([]) bug
  test('uint256[2][2]: nested fixed array parsed correctly', () => {
    const abi = fn([{ name: 'x', type: 'uint256[2][2]' }]);
    expect(parseAbiArguments(abi, ['[[1,2],[3,4]]'])).toEqual([
      [
        [1n, 2n],
        [3n, 4n],
      ],
    ]);
  });

  test('non-array JSON value throws (line 78)', () => {
    const abi = fn([{ name: 'x', type: 'uint256[3]' }]);
    expect(() => parseAbiArguments(abi, ['42'])).toThrow(
      /expected a json array/i,
    );
  });
});

// --- dynamic arrays ---

describe('dynamic array', () => {
  test('uint256[]: empty array', () => {
    const abi = fn([{ name: 'x', type: 'uint256[]' }]);
    expect(parseAbiArguments(abi, ['[]'])).toEqual([[]]);
  });

  test('uint256[]: multiple elements', () => {
    const abi = fn([{ name: 'x', type: 'uint256[]' }]);
    expect(parseAbiArguments(abi, ['[10,20,30]'])).toEqual([[10n, 20n, 30n]]);
  });

  test('address[]: array of addresses', () => {
    const abi = fn([{ name: 'x', type: 'address[]' }]);
    expect(parseAbiArguments(abi, [`[${JSON.stringify(ADDR)}]`])).toEqual([
      [ADDR],
    ]);
  });

  test('string[]: array of strings', () => {
    const abi = fn([{ name: 'x', type: 'string[]' }]);
    expect(parseAbiArguments(abi, ['["foo","bar"]'])).toEqual([['foo', 'bar']]);
  });

  test('non-array JSON value throws (line 101)', () => {
    const abi = fn([{ name: 'x', type: 'uint256[]' }]);
    expect(() => parseAbiArguments(abi, ['"notanarray"'])).toThrow(
      /expected a json array/i,
    );
  });

  // Acceptance test — exposes String([]) bug
  test('uint256[][]: nested dynamic array parsed correctly', () => {
    const abi = fn([{ name: 'x', type: 'uint256[][]' }]);
    expect(parseAbiArguments(abi, ['[[1,2],[3,4,5]]'])).toEqual([
      [
        [1n, 2n],
        [3n, 4n, 5n],
      ],
    ]);
  });

  // Acceptance test — exposes String([]) bug
  test('uint256[2][]: mixed fixed/dynamic nested array', () => {
    const abi = fn([{ name: 'x', type: 'uint256[2][]' }]);
    expect(parseAbiArguments(abi, ['[[1,2],[3,4]]'])).toEqual([
      [
        [1n, 2n],
        [3n, 4n],
      ],
    ]);
  });
});

// --- tuple ---

describe('tuple (struct)', () => {
  const tupleParam: AbiParameter = {
    name: 'data',
    type: 'tuple',
    components: [
      { name: 'addr', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'flag', type: 'bool' },
    ],
  } as AbiParameter;

  test('object representation: all fields parsed', () => {
    const abi = fn([tupleParam]);
    const input = JSON.stringify({ addr: ADDR, amount: '999', flag: 'true' });
    expect(parseAbiArguments(abi, [input])).toEqual([
      { addr: ADDR, amount: 999n, flag: true },
    ]);
  });

  test('array representation: positional fields parsed', () => {
    const abi = fn([tupleParam]);
    const input = JSON.stringify([ADDR, '50', 'false']);
    expect(parseAbiArguments(abi, [input])).toEqual([
      { addr: ADDR, amount: 50n, flag: false },
    ]);
  });

  test('array representation: wrong field count throws', () => {
    const abi = fn([tupleParam]);
    expect(() => parseAbiArguments(abi, [`[${JSON.stringify(ADDR)}]`])).toThrow(
      /expects.*fields/i,
    );
  });

  test('object representation: missing field throws', () => {
    const abi = fn([tupleParam]);
    const input = JSON.stringify({ addr: ADDR, amount: '1' });
    expect(() => parseAbiArguments(abi, [input])).toThrow(/missing field/i);
  });

  test('invalid JSON throws', () => {
    const abi = fn([tupleParam]);
    expect(() => parseAbiArguments(abi, ['{not json'])).toThrow(
      /invalid json/i,
    );
  });

  test('non-array non-object value throws', () => {
    const abi = fn([tupleParam]);
    expect(() => parseAbiArguments(abi, ['42'])).toThrow(
      /expected json object or array/i,
    );
  });

  test('array representation with unnamed component uses numeric index key (line 140)', () => {
    const param: AbiParameter = {
      name: 'data',
      type: 'tuple',
      components: [{ type: 'uint256' }, { type: 'bool' }],
    } as AbiParameter;
    const abi = fn([param]);
    // Component has no name — array form should use index as key
    expect(parseAbiArguments(abi, ['[42, true]'])).toEqual([
      { 0: 42n, 1: true },
    ]);
  });

  test('tuple with no components throws', () => {
    const bare: AbiParameter = { name: 'x', type: 'tuple' } as AbiParameter;
    const abi = fn([bare]);
    expect(() => parseAbiArguments(abi, ['{}'])).toThrow(/no components/i);
  });

  test('tuple component with no name throws when using object form (line 153)', () => {
    const param: AbiParameter = {
      name: 'data',
      type: 'tuple',
      components: [{ type: 'uint256' }],
    } as AbiParameter;
    const abi = fn([param]);
    expect(() => parseAbiArguments(abi, ['{"": 1}'])).toThrow(
      /tuple component has no name/i,
    );
  });

  // Acceptance test — exposes String({}) bug
  test('tuple[]: array of tuples parsed correctly', () => {
    const param: AbiParameter = {
      name: 'items',
      type: 'tuple[]',
      components: [
        { name: 'id', type: 'uint256' },
        { name: 'owner', type: 'address' },
      ],
    } as AbiParameter;
    const abi = fn([param]);
    const input = JSON.stringify([
      { id: '1', owner: ADDR },
      { id: '2', owner: ADDR },
    ]);
    expect(parseAbiArguments(abi, [input])).toEqual([
      [
        { id: 1n, owner: ADDR },
        { id: 2n, owner: ADDR },
      ],
    ]);
  });

  // Acceptance test — exposes String({}) bug on nested tuple
  test('nested tuple (tuple within tuple) parsed correctly', () => {
    const param: AbiParameter = {
      name: 'outer',
      type: 'tuple',
      components: [
        { name: 'value', type: 'uint256' },
        {
          name: 'inner',
          type: 'tuple',
          components: [
            { name: 'x', type: 'uint256' },
            { name: 'y', type: 'uint256' },
          ],
        },
      ],
    } as AbiParameter;
    const abi = fn([param]);
    const input = JSON.stringify({ value: '10', inner: { x: '1', y: '2' } });
    expect(parseAbiArguments(abi, [input])).toEqual([
      { value: 10n, inner: { x: 1n, y: 2n } },
    ]);
  });
});

// --- unsupported type ---

describe('unsupported type', () => {
  test('unknown type throws', () => {
    const abi = fn([{ name: 'x', type: 'function' }]);
    expect(() => parseAbiArguments(abi, ['0x'])).toThrow(
      /unsupported abi type/i,
    );
  });
});

// --- error message format ---

describe('error message wrapping', () => {
  test('error includes param name and type', () => {
    const abi = fn([{ name: 'myParam', type: 'uint256' }]);
    let caught: Error | undefined;
    try {
      parseAbiArguments(abi, ['notanumber']);
    } catch (e) {
      caught = e as Error;
    }
    expect(caught?.message).toMatch(/param.*myParam/i);
    expect(caught?.message).toMatch(/type.*uint256/i);
  });

  test('unnamed param falls back to <unnamed> in error message (line 179)', () => {
    // Directly exercise the unnamed-param branch by passing a nameless input
    const abi: AbiFunction = {
      type: 'function',
      name: 'test',
      inputs: [{ type: 'uint256' } as AbiParameter],
      outputs: [],
      stateMutability: 'nonpayable',
    };
    expect(() => parseAbiArguments(abi, ['abc'])).toThrow(/<unnamed>/);
  });

  test('already-wrapped error is re-thrown without double-wrapping (line 182)', () => {
    // uint256[][] with an invalid leaf value: the innermost error gets wrapped once,
    // then re-thrown (not re-wrapped) by each outer level.
    const abi = fn([{ name: 'x', type: 'uint256[][]' }]);
    let caught: Error | undefined;
    try {
      parseAbiArguments(abi, ['[["abc"]]']);
    } catch (e) {
      caught = e as Error;
    }
    // Should contain exactly one [param: block, not nested duplicates
    const matches = caught?.message.match(/\[param:/g);
    expect(matches).toHaveLength(1);
  });
});
