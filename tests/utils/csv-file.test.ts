import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import { exportCsv } from 'utils/csv-file.js';

vi.mock('fs-extra');

describe('exportCsv', () => {
  const mockEnsureFileSync = vi.mocked(fs.ensureFileSync);
  const mockWriteFileSync = vi.mocked(fs.writeFileSync);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should export CSV with array data', () => {
    const head = ['Name', 'Age', 'City'];
    const data = [
      ['Alice', '30', 'New York'],
      ['Bob', '25', 'Los Angeles'],
    ];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockEnsureFileSync).toHaveBeenCalledWith('/test/output.csv');
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Age,City\nAlice,30,New York\nBob,25,Los Angeles\n',
    );
  });

  it('should export CSV with object data', () => {
    const head = ['Name', 'Age'];
    const data = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Age\nAlice,30\nBob,25\n',
    );
  });

  it('should handle bigint values', () => {
    const head = ['Address', 'Balance'];
    const data = [['0x123', 1000000000000000000n]];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Address,Balance\n0x123,1000000000000000000\n',
    );
  });

  it('should handle null and undefined values', () => {
    const head = ['Name', 'Value1', 'Value2'];
    const data = [
      ['Alice', null, undefined],
      ['Bob', undefined, null],
    ];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Value1,Value2\nAlice,,\nBob,,\n',
    );
  });

  it('should escape commas in values', () => {
    const head = ['Name', 'Description'];
    const data = [['Alice', 'Works in tech, loves coding']];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Description\nAlice,"Works in tech, loves coding"\n',
    );
  });

  it('should escape quotes in values', () => {
    const head = ['Name', 'Quote'];
    const data = [['Alice', 'She said "Hello"']];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Quote\nAlice,"She said ""Hello"""\n',
    );
  });

  it('should escape newlines in values', () => {
    const head = ['Name', 'Address'];
    const data = [['Alice', '123 Main St\nApt 4']];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Address\nAlice,"123 Main St\nApt 4"\n',
    );
  });

  it('should use custom delimiter', () => {
    const head = ['Name', 'Age'];
    const data = [['Alice', '30']];

    exportCsv({ head, data, delimiter: ';', csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name;Age\nAlice;30\n',
    );
  });

  it('should escape custom delimiter in values', () => {
    const head = ['Name', 'Description'];
    const data = [['Alice', 'Value1;Value2']];

    exportCsv({ head, data, delimiter: ';', csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name;Description\nAlice;"Value1;Value2"\n',
    );
  });

  it('should throw error when csvPath is missing', () => {
    const head = ['Name'];
    const data = [['Alice']];

    expect(() => {
      exportCsv({ head, data, csvPath: '' });
    }).toThrow('CSV export error');
  });

  it('should wrap error with CSV export error', () => {
    const head = ['Name'];
    const data = [['Alice']];

    mockWriteFileSync.mockImplementationOnce(() => {
      throw new Error('Write failed');
    });

    expect(() => {
      exportCsv({ head, data, csvPath: '/test/output.csv' });
    }).toThrow('CSV export error');
  });

  it('should handle empty data array', () => {
    const head = ['Name', 'Age'];
    const data: string[][] = [];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Age\n',
    );
  });

  it('should handle mixed array and object data', () => {
    const head = ['Name', 'Value'];
    const data: (string[] | { name: string; value: number })[] = [
      ['Alice', '100'],
      { name: 'Bob', value: 200 },
    ];

    exportCsv({ head, data, csvPath: '/test/output.csv' });

    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/test/output.csv',
      'Name,Value\nAlice,100\nBob,200\n',
    );
  });
});
