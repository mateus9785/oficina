import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidPlaca,
  isValidCpf,
  isValidCnpj,
} from './validators';

describe('isValidEmail', () => {
  it.each(['a@b.com', 'first.last@sub.example.com'])('accepts %s', (v) => {
    expect(isValidEmail(v)).toBe(true);
  });

  it.each(['not-an-email', 'missing@domain', '@no-local.com', ''])(
    'rejects %s',
    (v) => {
      expect(isValidEmail(v)).toBe(false);
    }
  );
});

describe('isValidPhone', () => {
  it('accepts 10 or 11 digits after stripping formatting', () => {
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
    expect(isValidPhone('(11) 3265-4321')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('123456789012')).toBe(false);
  });
});

describe('isValidPlaca', () => {
  it('accepts the old format (ABC-1234 or ABC1234)', () => {
    expect(isValidPlaca('ABC-1234')).toBe(true);
    expect(isValidPlaca('abc1234')).toBe(true);
  });

  it('accepts the Mercosul format (ABC1D23)', () => {
    expect(isValidPlaca('abc1d23')).toBe(true);
  });

  it('rejects an invalid plate', () => {
    expect(isValidPlaca('12345')).toBe(false);
    expect(isValidPlaca('ABCD123')).toBe(false);
  });
});

describe('isValidCpf / isValidCnpj', () => {
  it('only checks digit count (11 for CPF, 14 for CNPJ), not check digits', () => {
    expect(isValidCpf('123.456.789-00')).toBe(true);
    expect(isValidCpf('123')).toBe(false);
    expect(isValidCnpj('12.345.678/0001-99')).toBe(true);
    expect(isValidCnpj('123')).toBe(false);
  });
});
