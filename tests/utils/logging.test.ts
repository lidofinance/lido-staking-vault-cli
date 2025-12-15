import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createConsole,
  logResult,
  logTable,
  logInfo,
  logError,
  logBold,
  logCancel,
  logResultSimple,
} from '../../utils/logging/console.js';
import { program } from '../../command/index.js';

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'table').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createConsole', () => {
  describe('basic logging types', () => {
    test('logs info by default', () => {
      const log = createConsole('LOG');
      log('hello');
      expect(console.info).toHaveBeenCalled();
    });

    test('logs error with error type', () => {
      const err = createConsole('Error', 'error');
      err('oops');
      expect(console.error).toHaveBeenCalled();
    });

    test('logs with table type', () => {
      const tableLog = createConsole('Result', 'table');
      tableLog({ key: 'value' });
      expect(console.info).toHaveBeenCalled();
      expect(console.table).toHaveBeenCalled();
    });

    test('logs with bold type', () => {
      const boldLog = createConsole('Bold', 'bold');
      boldLog('important');
      expect(console.info).toHaveBeenCalled();
    });
  });

  describe('multiple arguments', () => {
    test('handles multiple arguments for info', () => {
      const log = createConsole('LOG');
      log('hello', 'world', 123);
      expect(console.info).toHaveBeenCalled();
    });

    test('handles multiple arguments for error', () => {
      const err = createConsole('Error', 'error');
      err('error1', 'error2');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('JSON mode', () => {
    beforeEach(() => {
      vi.spyOn(program, 'opts').mockReturnValue({ json: true });
    });

    test('outputs JSON format for info type', () => {
      const log = createConsole('LOG', 'info');
      log('test data');

      const calls = vi.mocked(console.info).mock.calls;
      const jsonOutput = calls.find((call) => call[0] === '<JSON>');
      expect(jsonOutput).toBeDefined();
    });

    test('outputs JSON format for table type', () => {
      const tableLog = createConsole('Result', 'table');
      tableLog({ key: 'value' });

      const calls = vi.mocked(console.info).mock.calls;
      const jsonOutput = calls.find((call) => call[0] === '<JSON>');
      expect(jsonOutput).toBeDefined();
      expect(console.table).not.toHaveBeenCalled();
    });

    test('outputs JSON format for bold type', () => {
      const boldLog = createConsole('Bold', 'bold');
      boldLog('important');

      const calls = vi.mocked(console.info).mock.calls;
      const jsonOutput = calls.find((call) => call[0] === '<JSON>');
      expect(jsonOutput).toBeDefined();
    });

    test('serializes bigint values in JSON mode', () => {
      const log = createConsole('LOG');
      const bigIntValue = 1234567890123456789012345678901234567890n;
      log({ value: bigIntValue });

      const calls = vi.mocked(console.info).mock.calls;
      // Check that bigint was converted to string in JSON output
      const allCalls = calls.flat().join('');
      expect(allCalls).toContain(bigIntValue.toString());
    });
  });

  describe('exported helper functions', () => {
    test('logInfo works correctly', () => {
      logInfo('test');
      expect(console.info).toHaveBeenCalled();
    });

    test('logError works correctly', () => {
      logError('error message');
      expect(console.error).toHaveBeenCalled();
    });

    test('logBold works correctly', () => {
      logBold('bold text');
      expect(console.info).toHaveBeenCalled();
    });

    test('logCancel works correctly', () => {
      logCancel('cancelled');
      expect(console.info).toHaveBeenCalled();
    });

    test('logResultSimple works correctly', () => {
      logResultSimple('result');
      expect(console.info).toHaveBeenCalled();
      expect(console.table).toHaveBeenCalled();
    });
  });
});

describe('logResult and logTable', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  test('logResult displays table with data', () => {
    const data = [
      ['key1', 'value1'],
      ['key2', 'value2'],
    ];
    logResult({ data, params: { head: ['Key', 'Value'] } });
    expect(console.info).toHaveBeenCalled();
  });

  test('logResult handles empty data', () => {
    logResult({ data: undefined });
    expect(console.info).toHaveBeenCalled();
  });

  test('logTable displays table without header message', () => {
    const data = [['row1', 'data1']];
    logTable({ data });
    expect(console.info).toHaveBeenCalled();
  });

  test('logResult outputs JSON when json flag is set', () => {
    vi.spyOn(program, 'opts').mockReturnValue({ json: true });
    const data = [['key', 'value']];
    logResult({ data });

    const calls = vi.mocked(console.info).mock.calls;
    const jsonOutput = calls.find((call) => call[0] === '<JSON>');
    expect(jsonOutput).toBeDefined();
  });

  test('handles bigint in table data', () => {
    const data = [['amount', 1000000000000000000n]];
    logResult({ data });
    expect(console.info).toHaveBeenCalled();
  });
});
