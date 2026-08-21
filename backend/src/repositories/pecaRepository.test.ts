import { describe, it, expect, vi } from 'vitest';
import { PoolConnection } from 'mysql2/promise';
import * as pecaRepository from './pecaRepository';

function fakeConn() {
  return { execute: vi.fn().mockResolvedValue([{}, []]) } as unknown as PoolConnection;
}

describe('pecaRepository', () => {
  describe('ajustarConsumo', () => {
    it('subtracts quantidade and adds the same delta to uso_total', async () => {
      const conn = fakeConn();
      await pecaRepository.ajustarConsumo('peca-1', 3, conn);

      expect(conn.execute).toHaveBeenCalledWith(
        'UPDATE pecas SET quantidade = quantidade - ?, uso_total = uso_total + ? WHERE id = ?',
        [3, 3, 'peca-1']
      );
    });

    it('supports a negative delta (quantity decreased on an edit)', async () => {
      const conn = fakeConn();
      await pecaRepository.ajustarConsumo('peca-1', -2, conn);

      expect(conn.execute).toHaveBeenCalledWith(expect.any(String), [
        -2,
        -2,
        'peca-1',
      ]);
    });
  });

  describe('restaurarEstoque', () => {
    it('adds quantidade back and floors uso_total at 0', async () => {
      const conn = fakeConn();
      await pecaRepository.restaurarEstoque('peca-1', 5, conn);

      expect(conn.execute).toHaveBeenCalledWith(
        'UPDATE pecas SET quantidade = quantidade + ?, uso_total = GREATEST(0, uso_total - ?) WHERE id = ?',
        [5, 5, 'peca-1']
      );
    });
  });
});
