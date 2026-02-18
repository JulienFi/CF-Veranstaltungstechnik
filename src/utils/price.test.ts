import { describe, expect, it } from 'vitest';
import { formatCentsEUR, netToGrossCents, normalizeVatRate, parseMoneyToCents } from './price';

describe('parseMoneyToCents', () => {
  const cases: Array<[string | number | null | undefined, number | null]> = [
    [null, null],
    [undefined, null],
    ['', null],
    ['   ', null],
    ['abc', null],
    ['€ 49,00', 4900],
    ['49', 4900],
    ['49,0', 4900],
    ['49,00', 4900],
    ['49.00', 4900],
    ['1.234,56', 123456],
    ['1234,56', 123456],
    ['1234.56', 123456],
    // Thousand separator without decimals should be treated as integer.
    ['1.234', 123400],
    ['12,3', 1230],
    ['-12,30', -1230],
  ];

  it.each(cases)('parses %j -> %j', (input, expected) => {
    expect(parseMoneyToCents(input)).toBe(expected);
  });

  it('handles number input', () => {
    expect(parseMoneyToCents(49)).toBe(4900);
    expect(parseMoneyToCents(Number.NaN)).toBeNull();
    expect(parseMoneyToCents(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('normalizeVatRate', () => {
  const cases: Array<[number | null | undefined, number]> = [
    [null, 0.19],
    [undefined, 0.19],
    [19, 0.19],
    [7, 0.07],
    [1900, 0.19],
    [0.19, 0.19],
    // Clamps to 30%
    [0.5, 0.3],
    // Negative clamps to 0
    [-1, 0],
  ];

  it.each(cases)('normalizes %j -> %j', (input, expected) => {
    expect(normalizeVatRate(input)).toBeCloseTo(expected, 5);
  });
});

describe('netToGrossCents', () => {
  it('rounds to cents', () => {
    expect(netToGrossCents(10000, 0.19)).toBe(11900);
    expect(netToGrossCents(1, 0.19)).toBe(1);
    expect(netToGrossCents(2, 0.19)).toBe(2);
  });
});

describe('formatCentsEUR', () => {
  it('formats EUR in de-DE', () => {
    expect(formatCentsEUR(4900)).toBe('49,00 €');
  });
});
