import { describe, it, expect } from 'vitest';
import {
  fromHex,
  toHex,
  sha256Pair,
  sha256Concat,
  pubkeyRoot,
  uint64To32LE,
  encodeGweiAsLittleEndian8,
} from '../../utils/proof/merkle-utils.js';

describe('merkle-utils', () => {
  describe('fromHex', () => {
    it('should convert hex string with 0x prefix to Uint8Array', () => {
      const hex = '0x1234';
      const result = fromHex(hex);
      expect(result).toEqual(new Uint8Array([0x12, 0x34]));
    });

    it('should convert hex string without 0x prefix to Uint8Array', () => {
      const hex = '1234';
      const result = fromHex(hex);
      expect(result).toEqual(new Uint8Array([0x12, 0x34]));
    });

    it('should handle empty string', () => {
      const hex = '0x';
      const result = fromHex(hex);
      expect(result).toEqual(new Uint8Array([]));
    });

    it('should handle longer hex strings', () => {
      const hex = '0xabcdef123456';
      const result = fromHex(hex);
      expect(result).toEqual(
        new Uint8Array([0xab, 0xcd, 0xef, 0x12, 0x34, 0x56]),
      );
    });
  });

  describe('toHex', () => {
    it('should convert string without 0x to hex with prefix', () => {
      const value = '1234';
      const result = toHex(value);
      expect(result).toBe('0x1234');
    });

    it('should keep string with 0x prefix as is', () => {
      const value = '0x1234';
      const result = toHex(value);
      expect(result).toBe('0x1234');
    });

    it('should convert number to hex', () => {
      const value = 255;
      const result = toHex(value);
      expect(result).toBe('0xff');
    });

    it('should convert bigint to hex', () => {
      const value = 1000000n;
      const result = toHex(value);
      expect(result).toBe('0xf4240');
    });

    it('should convert Uint8Array to hex', () => {
      const value = new Uint8Array([0x12, 0x34, 0xab, 0xcd]);
      const result = toHex(value);
      expect(result).toBe('0x1234abcd');
    });

    it('should throw error for unsupported types', () => {
      expect(() => toHex({})).toThrow('Unsupported value type');
      expect(() => toHex(null)).toThrow('Unsupported value type');
      expect(() => toHex(undefined)).toThrow('Unsupported value type');
    });
  });

  describe('sha256Pair', () => {
    it('should hash two 32-byte arrays', () => {
      const left = new Uint8Array(32).fill(0);
      const right = new Uint8Array(32).fill(1);
      const result = sha256Pair(left, right);

      expect(result.length).toBe(32);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should produce consistent results for same inputs', () => {
      const left = new Uint8Array(32).fill(0xaa);
      const right = new Uint8Array(32).fill(0xbb);
      const result1 = sha256Pair(left, right);
      const result2 = sha256Pair(left, right);

      expect(result1).toEqual(result2);
    });

    it('should produce different results for different inputs', () => {
      const left1 = new Uint8Array(32).fill(0);
      const right1 = new Uint8Array(32).fill(1);
      const left2 = new Uint8Array(32).fill(2);
      const right2 = new Uint8Array(32).fill(3);

      const result1 = sha256Pair(left1, right1);
      const result2 = sha256Pair(left2, right2);

      expect(result1).not.toEqual(result2);
    });

    it('should throw error for non-32-byte left input', () => {
      const left = new Uint8Array(31).fill(0);
      const right = new Uint8Array(32).fill(0);

      expect(() => sha256Pair(left, right)).toThrow(
        'sha256Pair expects 2 x 32-byte inputs',
      );
    });

    it('should throw error for non-32-byte right input', () => {
      const left = new Uint8Array(32).fill(0);
      const right = new Uint8Array(33).fill(0);

      expect(() => sha256Pair(left, right)).toThrow(
        'sha256Pair expects 2 x 32-byte inputs',
      );
    });
  });

  describe('sha256Concat', () => {
    it('should hash single chunk', () => {
      const chunk = new Uint8Array([1, 2, 3, 4]);
      const result = sha256Concat(chunk);

      expect(result.length).toBe(32);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should hash multiple chunks', () => {
      const chunk1 = new Uint8Array([1, 2, 3, 4]);
      const chunk2 = new Uint8Array([5, 6, 7, 8]);
      const chunk3 = new Uint8Array([9, 10, 11, 12]);
      const result = sha256Concat(chunk1, chunk2, chunk3);

      expect(result.length).toBe(32);
    });

    it('should produce same result as single concatenated chunk', () => {
      const chunk1 = new Uint8Array([1, 2, 3, 4]);
      const chunk2 = new Uint8Array([5, 6, 7, 8]);

      const result1 = sha256Concat(chunk1, chunk2);
      const combined = new Uint8Array([...chunk1, ...chunk2]);
      const result2 = sha256Concat(combined);

      expect(result1).toEqual(result2);
    });

    it('should handle empty chunks array', () => {
      const result = sha256Concat();
      expect(result.length).toBe(32);
    });
  });

  describe('pubkeyRoot', () => {
    it('should hash 48-byte pubkey and pad to 64 bytes', () => {
      const pubkey = new Uint8Array(48).fill(0xaa);
      const result = pubkeyRoot(pubkey);

      expect(result.length).toBe(32);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should produce consistent results', () => {
      const pubkey = new Uint8Array(48).fill(0x12);
      const result1 = pubkeyRoot(pubkey);
      const result2 = pubkeyRoot(pubkey);

      expect(result1).toEqual(result2);
    });

    it('should throw error for non-48-byte input', () => {
      const pubkey47 = new Uint8Array(47).fill(0);
      const pubkey49 = new Uint8Array(49).fill(0);

      expect(() => pubkeyRoot(pubkey47)).toThrow(
        'pubkey must be 48 bytes, got=47',
      );
      expect(() => pubkeyRoot(pubkey49)).toThrow(
        'pubkey must be 48 bytes, got=49',
      );
    });
  });

  describe('uint64To32LE', () => {
    it('should convert bigint to 32-byte little-endian', () => {
      const value = 1000n;
      const result = uint64To32LE(value);

      expect(result.length).toBe(32);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should encode zero correctly', () => {
      const value = 0n;
      const result = uint64To32LE(value);

      expect(result.length).toBe(32);
      expect(result.every((byte) => byte === 0)).toBe(true);
    });

    it('should encode 1 as little-endian', () => {
      const value = 1n;
      const result = uint64To32LE(value);

      expect(result[0]).toBe(1);
      expect(result[1]).toBe(0);
      // Rest should be zeros
      for (let i = 2; i < 32; i++) {
        expect(result[i]).toBe(0);
      }
    });

    it('should encode 256 as little-endian', () => {
      const value = 256n;
      const result = uint64To32LE(value);

      expect(result[0]).toBe(0);
      expect(result[1]).toBe(1);
      // Rest should be zeros
      for (let i = 2; i < 32; i++) {
        expect(result[i]).toBe(0);
      }
    });

    it('should handle large uint64 values', () => {
      const value = 18446744073709551615n; // Max uint64
      const result = uint64To32LE(value);

      expect(result.length).toBe(32);
      // First 8 bytes should be all 0xff
      for (let i = 0; i < 8; i++) {
        expect(result[i]).toBe(0xff);
      }
      // Remaining 24 bytes should be zeros
      for (let i = 8; i < 32; i++) {
        expect(result[i]).toBe(0);
      }
    });
  });

  describe('encodeGweiAsLittleEndian8', () => {
    it('should encode gwei amount to 8-byte little-endian', () => {
      const amount = 32000000000n; // 32 ETH in gwei
      const result = encodeGweiAsLittleEndian8(amount);

      expect(result.length).toBe(8);
      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should encode zero correctly', () => {
      const amount = 0n;
      const result = encodeGweiAsLittleEndian8(amount);

      expect(result.length).toBe(8);
      expect(result.every((byte) => byte === 0)).toBe(true);
    });

    it('should encode 1 gwei as little-endian', () => {
      const amount = 1n;
      const result = encodeGweiAsLittleEndian8(amount);

      expect(result[0]).toBe(1);
      for (let i = 1; i < 8; i++) {
        expect(result[i]).toBe(0);
      }
    });

    it('should encode 32 ETH (32000000000 gwei) correctly', () => {
      const amount = 32000000000n;
      const result = encodeGweiAsLittleEndian8(amount);

      expect(result.length).toBe(8);
      // 32000000000 = 0x0000000773594000
      // Little-endian: 00 40 59 73 07 00 00 00
      expect(result[0]).toBe(0x00);
      expect(result[1]).toBe(0x40);
      expect(result[2]).toBe(0x59);
      expect(result[3]).toBe(0x73);
      expect(result[4]).toBe(0x07);
      expect(result[5]).toBe(0x00);
      expect(result[6]).toBe(0x00);
      expect(result[7]).toBe(0x00);
    });

    it('should produce consistent results', () => {
      const amount = 1000000000n; // 1 ETH in gwei
      const result1 = encodeGweiAsLittleEndian8(amount);
      const result2 = encodeGweiAsLittleEndian8(amount);

      expect(result1).toEqual(result2);
    });
  });
});
