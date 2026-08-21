import { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';
import { AppError } from '../middleware/errorHandler';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

async function assertOwned(
  table: string,
  id: string,
  usuarioId: string,
  mensagem: string,
  conn?: PoolConnection
): Promise<void> {
  const [rows] = await exec(conn)(`SELECT id FROM ${table} WHERE id = ? AND usuario_id = ?`, [id, usuarioId]);
  if ((rows as unknown[]).length === 0) throw new AppError(404, mensagem);
}

export const assertClienteOwnedBy = (id: string, usuarioId: string, conn?: PoolConnection) =>
  assertOwned('clientes', id, usuarioId, 'Cliente não encontrado.', conn);

export const assertVeiculoOwnedBy = (id: string, usuarioId: string, conn?: PoolConnection) =>
  assertOwned('veiculos', id, usuarioId, 'Veículo não encontrado.', conn);

export const assertPecaOwnedBy = (id: string, usuarioId: string, conn?: PoolConnection) =>
  assertOwned('pecas', id, usuarioId, 'Peça não encontrada.', conn);

export const assertOrdemOwnedBy = (id: string, usuarioId: string, conn?: PoolConnection) =>
  assertOwned('ordens_servico', id, usuarioId, 'Ordem de serviço não encontrada.', conn);
