import type { AbiFunction, AbiParameter } from 'viem';
import { isAddress, isHex, size as hexSize } from 'viem';

/**
 * Parses a single string value into a typed value based on its Solidity ABI type.
 * Uses viem's `isAddress` and `isHex` for validation.
 * Throws a descriptive error if parsing fails.
 */
const toArgString = (v: unknown): string =>
  typeof v === 'string' ? v : (JSON.stringify(v) as string);

const parseAbiArgument = (param: AbiParameter, value: string): unknown => {
  const { type } = param;

  try {
    // --- address ---
    if (type === 'address') {
      if (!isAddress(value)) {
        throw new Error(`Invalid address: "${value}"`);
      }
      return value as `0x${string}`;
    }

    // --- bool ---
    if (type === 'bool') {
      if (value === 'true') return true;
      if (value === 'false') return false;
      throw new Error(
        `Invalid bool value: "${value}". Expected "true" or "false"`,
      );
    }

    // --- uint / int ---
    if (/^(uint|int)\d*$/.test(type)) {
      const n = BigInt(value);
      if (type.startsWith('uint') && n < 0n) {
        throw new Error(`Unsigned integer cannot be negative: "${value}"`);
      }
      return n;
    }

    // --- bytes1 … bytes32 (fixed-size) ---
    const fixedBytesMatch = type.match(/^bytes(\d+)$/);
    if (fixedBytesMatch) {
      const expectedSize = Number.parseInt(fixedBytesMatch[1] as string, 10);
      if (!isHex(value)) {
        throw new Error(`Invalid hex for ${type}: "${value}"`);
      }
      const actualSize = hexSize(value as `0x${string}`);
      if (actualSize !== expectedSize) {
        throw new Error(
          `Expected ${expectedSize} bytes for ${type}, got ${actualSize}`,
        );
      }
      return value as `0x${string}`;
    }

    // --- bytes (dynamic) ---
    if (type === 'bytes') {
      if (!isHex(value)) {
        throw new Error(`Invalid hex for bytes: "${value}"`);
      }
      return value as `0x${string}`;
    }

    // --- string ---
    if (type === 'string') {
      return value;
    }

    // --- fixed-size array, e.g. uint256[3] ---
    const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
    if (fixedArrayMatch) {
      const innerType = fixedArrayMatch[1] as string;
      const expectedLength = Number.parseInt(fixedArrayMatch[2] as string, 10);
      const parsed: unknown[] = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new TypeError(
          `Expected a JSON array for ${type}, got: "${value}"`,
        );
      }
      if (parsed.length !== expectedLength) {
        throw new Error(
          `Expected array of length ${expectedLength} for ${type}, got length ${parsed.length}`,
        );
      }
      return parsed.map((item, i) =>
        parseAbiArgument(
          { ...param, type: innerType, name: `${param.name}[${i}]` },
          toArgString(item),
        ),
      );
    }

    // --- dynamic array, e.g. uint256[] ---
    const dynamicArrayMatch = type.match(/^(.+)\[\]$/);
    if (dynamicArrayMatch) {
      const innerType = dynamicArrayMatch[1] as string;
      const parsed: unknown[] = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        throw new TypeError(
          `Expected a JSON array for ${type}, got: "${value}"`,
        );
      }
      return parsed.map((item, i) =>
        parseAbiArgument(
          { ...param, type: innerType, name: `${param.name}[${i}]` },
          toArgString(item),
        ),
      );
    }

    // --- tuple (struct) ---
    if (type === 'tuple') {
      const tupleParam = param as AbiParameter & {
        components: AbiParameter[];
      };
      if (!tupleParam.components || tupleParam.components.length === 0) {
        throw new Error(
          `Tuple parameter "${param.name}" has no components defined in ABI`,
        );
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON for tuple "${param.name}": "${value}"`);
      }

      // Accept array representation
      if (Array.isArray(parsed)) {
        if (parsed.length !== tupleParam.components.length) {
          throw new Error(
            `Tuple "${param.name}" expects ${tupleParam.components.length} fields, got ${parsed.length}`,
          );
        }
        return tupleParam.components.reduce<Record<string, unknown>>(
          (acc, comp, i) => {
            acc[comp.name ?? i] = parseAbiArgument(
              comp,
              toArgString(parsed[i]),
            );
            return acc;
          },
          {},
        );
      }

      // Accept object representation
      if (typeof parsed === 'object' && parsed !== null) {
        return tupleParam.components.reduce<Record<string, unknown>>(
          (acc, comp) => {
            const key = comp.name;
            if (!key) {
              throw new Error(`Tuple component has no name`);
            }
            if (!(key in (parsed as Record<string, unknown>))) {
              throw new Error(
                `Missing field "${key}" in tuple "${param.name}"`,
              );
            }
            acc[key] = parseAbiArgument(
              comp,
              toArgString((parsed as Record<string, unknown>)[key]),
            );
            return acc;
          },
          {},
        );
      }

      throw new Error(
        `Invalid value for tuple "${param.name}": expected JSON object or array`,
      );
    }

    throw new Error(`Unsupported ABI type: "${type}"`);
  } catch (err) {
    if (err instanceof Error && !err.message.startsWith(`[param:`)) {
      throw new Error(
        `[param: "${param.name ?? '<unnamed>'}", type: "${type}"] ${err.message}`,
      );
    }
    throw err;
  }
};

/**
 * Parses an array of raw string arguments into typed values
 * according to the given ABI function definition.
 *
 * @param methodAbi - The viem `AbiFunction` describing the target method.
 * @param args      - Raw string arguments in the same order as `methodAbi.inputs`.
 * @returns         Typed argument array ready to pass to viem's `encodeFunctionData`.
 * @throws          If the argument count doesn't match or any value fails to parse.
 *
 * @example
 * ```ts
 * import { parseAbi } from "viem";
 * import { parseAbiArguments } from "./parseAbiArguments";
 *
 * const [method] = parseAbi(["function transfer(address to, uint256 amount)"]);
 * const args = parseAbiArguments(method, [
 *   "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
 *   "1000000000000000000",
 * ]);
 * // => ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", 1000000000000000000n]
 * ```
 */
export const parseAbiArguments = (
  methodAbi: AbiFunction,
  args: string[],
): unknown[] => {
  const { inputs } = methodAbi;

  if (args.length !== inputs.length) {
    throw new Error(
      `Argument count mismatch for "${methodAbi.name}": expected ${inputs.length}, got ${args.length}`,
    );
  }

  return inputs.map((input, i) => parseAbiArgument(input, args[i] as string));
};
