import { describe, it, expect } from 'vitest';
import { formatTimestamp } from 'utils/timestamp.js';

describe('formatTimestamp', () => {
  it('should format timestamp with default format and UTC timezone', () => {
    // 2024-01-15 12:30:00 UTC
    const timestamp = 1705321800;
    const result = formatTimestamp(timestamp);
    expect(result).toBe('15.01.2024 12:30 UTC');
  });

  it('should format timestamp with custom format', () => {
    const timestamp = 1705321800; // 2024-01-15 12:30:00 UTC
    const result = formatTimestamp(timestamp, 'yyyy-mm-dd hh:mm');
    expect(result).toBe('2024-01-15 12:30 UTC');
  });

  it('should format timestamp with custom timezone label', () => {
    const timestamp = 1705321800;
    const result = formatTimestamp(timestamp, 'dd.mm.yyyy hh:mm', 'EST');
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2} EST$/);
  });

  it('should pad single digit days and months with zeros', () => {
    // 2024-03-05 09:05:00 UTC
    const timestamp = 1709629500;
    const result = formatTimestamp(timestamp);
    expect(result).toBe('05.03.2024 09:05 UTC');
  });

  it('should handle midnight timestamps', () => {
    // 2024-01-01 00:00:00 UTC
    const timestamp = 1704067200;
    const result = formatTimestamp(timestamp);
    expect(result).toBe('01.01.2024 00:00 UTC');
  });

  it('should handle end of day timestamps', () => {
    // 2024-12-31 23:59:00 UTC
    const timestamp = 1735689540;
    const result = formatTimestamp(timestamp);
    expect(result).toBe('31.12.2024 23:59 UTC');
  });

  it('should format epoch timestamp (0)', () => {
    const timestamp = 0;
    const result = formatTimestamp(timestamp);
    // Epoch is 1970-01-01 00:00:00 UTC
    expect(result).toMatch(/^01\.01\.1970 \d{2}:\d{2} UTC$/);
  });

  it('should handle year 2000 timestamp', () => {
    // 2000-01-01 00:00:00 UTC
    const timestamp = 946684800;
    const result = formatTimestamp(timestamp);
    expect(result).toBe('01.01.2000 00:00 UTC');
  });
});
