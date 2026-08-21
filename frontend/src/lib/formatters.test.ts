import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPhone,
  formatPlaca,
  formatCpfCnpj,
  formatKm,
} from './formatters';

// Intl.NumberFormat('pt-BR') separates the currency symbol from the amount
// with a non-breaking space (U+00A0), not a regular space.
const NBSP = ' ';

describe('formatCurrency', () => {
  it('formats a positive number as BRL', () => {
    expect(formatCurrency(1234.5)).toBe(`R$${NBSP}1.234,50`);
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe(`R$${NBSP}0,00`);
  });
});

describe('formatDate', () => {
  it('formats an ISO date as dd/MM/yyyy', () => {
    expect(formatDate('2026-03-05')).toBe('05/03/2026');
  });

  it('truncates a full ISO datetime to just the date part', () => {
    expect(formatDate('2026-03-05T10:30:00.000Z')).toBe('05/03/2026');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO datetime with time', () => {
    // parseISO parses in local time for a date without a Z/offset suffix
    expect(formatDateTime('2026-03-05T10:30:00')).toBe('05/03/2026 às 10:30');
  });
});

describe('formatPhone', () => {
  it('formats an 11-digit mobile number', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321');
  });

  it('formats a 10-digit landline number', () => {
    expect(formatPhone('1132654321')).toBe('(11) 3265-4321');
  });

  it('returns the original string for an unrecognized length', () => {
    expect(formatPhone('123')).toBe('123');
  });

  it('returns an em dash for null/undefined/empty', () => {
    expect(formatPhone(null)).toBe('—');
    expect(formatPhone(undefined)).toBe('—');
    expect(formatPhone('')).toBe('—');
  });
});

describe('formatPlaca', () => {
  it('uppercases the plate', () => {
    expect(formatPlaca('abc1d23')).toBe('ABC1D23');
  });
});

describe('formatCpfCnpj', () => {
  it('formats an 11-digit value as CPF', () => {
    expect(formatCpfCnpj('12345678900')).toBe('123.456.789-00');
  });

  it('formats a 14-digit value as CNPJ', () => {
    expect(formatCpfCnpj('12345678000199')).toBe('12.345.678/0001-99');
  });

  it('returns the original string for an unrecognized length', () => {
    expect(formatCpfCnpj('123')).toBe('123');
  });

  it('returns an em dash for null/undefined', () => {
    expect(formatCpfCnpj(null)).toBe('—');
    expect(formatCpfCnpj(undefined)).toBe('—');
  });
});

describe('formatKm', () => {
  it('formats with a pt-BR thousands separator and a km suffix', () => {
    expect(formatKm(50000)).toBe('50.000 km');
  });
});
