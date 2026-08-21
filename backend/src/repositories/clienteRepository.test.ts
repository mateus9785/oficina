import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pool } from '../config/database';
import * as clienteRepository from './clienteRepository';

vi.mock('../config/database', () => ({
  pool: { execute: vi.fn() },
}));

const mockExecute = vi.mocked(pool.execute);
const USUARIO_ID = 'usuario-1';

describe('clienteRepository', () => {
  beforeEach(() => {
    mockExecute.mockReset();
  });

  describe('findAll', () => {
    it('queries with a LIKE filter, tenant scope, and pagination', async () => {
      mockExecute.mockResolvedValue([[{ id: '1', nome: 'Ana' }], []] as never);

      const rows = await clienteRepository.findAll(
        { usuarioId: USUARIO_ID, search: 'ana' },
        { sqlLimit: 20n, sqlOffset: 0n }
      );

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM clientes WHERE usuario_id = ? AND (nome LIKE ? OR cpf_cnpj LIKE ? OR email LIKE ?) ORDER BY nome LIMIT ? OFFSET ?',
        [USUARIO_ID, '%ana%', '%ana%', '%ana%', 20n, 0n]
      );
      expect(rows).toEqual([{ id: '1', nome: 'Ana' }]);
    });
  });

  describe('count', () => {
    it('returns the total as a number', async () => {
      mockExecute.mockResolvedValue([[{ total: '3' }], []] as never);

      const total = await clienteRepository.count({ usuarioId: USUARIO_ID, search: '' });

      expect(total).toBe(3);
    });
  });

  describe('findByCpf', () => {
    it('excludes the given id from the search, scoped to the tenant', async () => {
      mockExecute.mockResolvedValue([[], []] as never);

      await clienteRepository.findByCpf('123', USUARIO_ID, 'self-id');

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id FROM clientes WHERE cpf_cnpj = ? AND usuario_id = ? AND id != ?',
        ['123', USUARIO_ID, 'self-id']
      );
    });

    it('defaults excludeId to an empty string', async () => {
      mockExecute.mockResolvedValue([[], []] as never);

      await clienteRepository.findByCpf('123', USUARIO_ID);

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [
        '123',
        USUARIO_ID,
        '',
      ]);
    });

    it('returns null when nothing matches', async () => {
      mockExecute.mockResolvedValue([[], []] as never);
      expect(await clienteRepository.findByCpf('999', USUARIO_ID)).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the row when found', async () => {
      mockExecute.mockResolvedValue([[{ id: 'abc' }], []] as never);
      expect(await clienteRepository.findById('abc', USUARIO_ID)).toEqual({ id: 'abc' });
    });

    it('returns null when not found', async () => {
      mockExecute.mockResolvedValue([[], []] as never);
      expect(await clienteRepository.findById('missing', USUARIO_ID)).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts every field in order, including usuario_id', async () => {
      mockExecute.mockResolvedValue([{}, []] as never);

      await clienteRepository.create('id-1', {
        usuarioId: USUARIO_ID,
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
        USUARIO_ID,
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
        usuarioId: USUARIO_ID,
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
        usuarioId: USUARIO_ID,
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
      expect(await clienteRepository.remove('id-1', USUARIO_ID)).toBe(true);

      mockExecute.mockResolvedValue([{ affectedRows: 0 }, []] as never);
      expect(await clienteRepository.remove('missing', USUARIO_ID)).toBe(false);
    });
  });
});
