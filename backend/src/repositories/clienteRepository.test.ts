import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pool } from '../config/database';
import * as clienteRepository from './clienteRepository';

vi.mock('../config/database', () => ({
  pool: { execute: vi.fn() },
}));

const mockExecute = vi.mocked(pool.execute);

describe('clienteRepository', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  describe('findAll', () => {
    it('queries with a LIKE filter and pagination', async () => {
      mockExecute.mockResolvedValue([[{ id: '1', nome: 'Ana' }], []] as never);

      const rows = await clienteRepository.findAll(
        { search: 'ana' },
        { sqlLimit: 20n, sqlOffset: 0n }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM clientes WHERE nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ? ORDER BY nome LIMIT ? OFFSET ?',
        ['%ana%', '%ana%', '%ana%', 20n, 0n]
      );
      expect(rows).toEqual([{ id: '1', nome: 'Ana' }]);
    });
  });

  describe('count', () => {
    it('returns the total as a number', async () => {
      mockExecute.mockResolvedValue([[{ total: '3' }], []] as never);

      const total = await clienteRepository.count({ search: '' });

      expect(total).toBe(3);
    });
  });

  describe('findByCpf', () => {
    it('excludes the given id from the search', async () => {
      mockExecute.mockResolvedValue([[], []] as never);

      await clienteRepository.findByCpf('123', 'self-id');

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id FROM clientes WHERE cpf_cnpj = ? AND id != ?',
        ['123', 'self-id']
      );
    });

    it('defaults excludeId to an empty string', async () => {
      mockExecute.mockResolvedValue([[], []] as never);

      await clienteRepository.findByCpf('123');

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [
        '123',
        '',
      ]);
    });

    it('returns null when nothing matches', async () => {
      mockExecute.mockResolvedValue([[], []] as never);
      expect(await clienteRepository.findByCpf('999')).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the row when found', async () => {
      mockExecute.mockResolvedValue([[{ id: 'abc' }], []] as never);
      expect(await clienteRepository.findById('abc')).toEqual({ id: 'abc' });
    });

    it('returns null when not found', async () => {
      mockExecute.mockResolvedValue([[], []] as never);
      expect(await clienteRepository.findById('missing')).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts every field in order', async () => {
      mockExecute.mockResolvedValue([{}, []] as never);

      await clienteRepository.create('id-1', {
        nome: 'Ana',
        cpfCnpj: '111',
        telefone: '999',
        email: 'a@b.com',
        dataNascimento: null,
        cep: '',
        cidade: '',
        estado: '',
        rua: '',
        numero: '',
        complemento: '',
      });

      expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO clientes'), [
        'id-1',
        'Ana',
        '111',
        '999',
        'a@b.com',
        null,
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
    });
  });

  describe('update', () => {
    it('returns true when a row was affected', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);

      const updated = await clienteRepository.update('id-1', {
        nome: 'Ana',
        cpfCnpj: null,
        telefone: '',
        email: '',
        dataNascimento: null,
        cep: '',
        cidade: '',
        estado: '',
        rua: '',
        numero: '',
        complemento: '',
      });

      expect(updated).toBe(true);
    });

    it('returns false when no row was affected', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 0 }, []] as never);

      const updated = await clienteRepository.update('missing', {
        nome: 'Ana',
        cpfCnpj: null,
        telefone: '',
        email: '',
        dataNascimento: null,
        cep: '',
        cidade: '',
        estado: '',
        rua: '',
        numero: '',
        complemento: '',
      });

      expect(updated).toBe(false);
    });
  });

  describe('remove', () => {
    it('returns true/false based on affectedRows', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);
      expect(await clienteRepository.remove('id-1')).toBe(true);

      mockExecute.mockResolvedValue([{ affectedRows: 0 }, []] as never);
      expect(await clienteRepository.remove('missing')).toBe(false);
    });
  });
});
