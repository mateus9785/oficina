import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pool } from '../config/database';
import * as ordemRepository from './ordemRepository';

vi.mock('../config/database', () => ({
  pool: { execute: vi.fn() },
}));

const mockExecute = vi.mocked(pool.execute);
const USUARIO_ID = 'usuario-1';

describe('ordemRepository', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    mockExecute.mockResolvedValue([[{ total: 0 }], []] as never);
  });

  describe('findAll / count -- dynamic WHERE building', () => {
    it('filters by arquivado = 0 and usuario_id with no other filters', async () => {
      await ordemRepository.count({
        usuarioId: USUARIO_ID,
        status: '',
        clienteId: '',
        somenteArquivadas: false,
      });

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM ordens_servico WHERE arquivado = 0 AND usuario_id = ?',
        [USUARIO_ID]
      );
    });

    it('filters by arquivado = 1 when somenteArquivadas is true', async () => {
      await ordemRepository.count({
        usuarioId: USUARIO_ID,
        status: '',
        clienteId: '',
        somenteArquivadas: true,
      });

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [USUARIO_ID]);
      expect(mockExecute.mock.calls[0][0]).toContain('WHERE arquivado = 1');
    });

    it('appends status and clienteId filters with their params, in order', async () => {
      await ordemRepository.count({
        usuarioId: USUARIO_ID,
        status: 'finalizado',
        clienteId: 'cliente-1',
        somenteArquivadas: false,
      });

      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT COUNT(*) as total FROM ordens_servico WHERE arquivado = 0 AND usuario_id = ? AND status = ? AND cliente_id = ?',
        [USUARIO_ID, 'finalizado', 'cliente-1']
      );
    });

    it('findAll appends LIMIT/OFFSET after the filter params', async () => {
      await ordemRepository.findAll(
        { usuarioId: USUARIO_ID, status: 'finalizado', clienteId: '', somenteArquivadas: false },
        { sqlLimit: 10n, sqlOffset: 5n }
      );

      expect(mockExecute).toHaveBeenCalledWith(expect.any(String), [
        USUARIO_ID,
        'finalizado',
        10n,
        5n,
      ]);
    });
  });

  describe('setArquivado', () => {
    it('sets arquivado = 1 unconditionally when arquivando', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);
      await ordemRepository.setArquivado('id-1', true, USUARIO_ID);

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE ordens_servico SET arquivado = 1 WHERE id = ? AND usuario_id = ?',
        ['id-1', USUARIO_ID]
      );
    });

    it('only clears arquivado when it was set (guards the WHERE clause)', async () => {
      mockExecute.mockResolvedValue([{ affectedRows: 1 }, []] as never);
      await ordemRepository.setArquivado('id-1', false, USUARIO_ID);

      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE ordens_servico SET arquivado = 0 WHERE id = ? AND usuario_id = ? AND arquivado = 1',
        ['id-1', USUARIO_ID]
      );
    });
  });
});
