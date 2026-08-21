import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pool } from '../config/database';
import * as ordemRepository from './ordemRepository';

vi.mock('../config/database', () => ({
  pool: { execute: vi.fn() },
}));

const mockExecute = vi.mocked(pool.execute);

describe('ordemRepository', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue([[{ total: 0 }], []] as never);
  });

  describe('findAll / count -- dynamic WHERE building', () => {
    it('filters by arquivado = 0 with no other filters', async () => {
      await ordemRepository.count({
        status: '',
        clienteId: '',
        somenteArquivadas: false,
      });

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM ordens_servico WHERE arquivado = 0',
        []
      );
    });

    it('filters by arquivado = 1 when somenteArquivadas is true', async () => {
      await ordemRepository.count({
        status: '',
        clienteId: '',
        somenteArquivadas: true,
      });

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), []);
      expect(mockExecute.mock.calls[0][0]).toContain('WHERE arquivado = 1');
    });

    it('appends status and clienteId filters with their params, in order', async () => {
      await ordemRepository.count({
        status: 'finalizado',
        clienteId: 'cliente-1',
        somenteArquivadas: false,
      });

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM ordens_servico WHERE arquivado = 0 AND status = ? AND cliente_id = ?',
        ['finalizado', 'cliente-1']
      );
    });

    it('findAll appends LIMIT/OFFSET after the filter params', async () => {
      await ordemRepository.findAll(
        { status: 'finalizado', clienteId: '', somenteArquivadas: false },
        { sqlLimit: 10n, sqlOffset: 5n }
      );

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [
        'finalizado',
        10n,
        5n,
      ]);
    });
  });

  describe('setArquivado', () => {
    it('sets arquivado = 1 unconditionally when arquivando', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);
      await ordemRepository.setArquivado('id-1', true);

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE ordens_servico SET arquivado = 1 WHERE id = ?',
        ['id-1']
      );
    });

    it('only clears arquivado when it was set (guards the WHERE clause)', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);
      await ordemRepository.setArquivado('id-1', false);

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE ordens_servico SET arquivado = 0 WHERE id = ? AND arquivado = 1',
        ['id-1']
      );
    });
  });
});
