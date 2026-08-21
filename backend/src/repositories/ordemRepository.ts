import { PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { pool } from '../config/database';
import { OrdemServicoRow } from '../types/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export interface OrdemFilter {
  usuarioId: string;
  status: string;
  clienteId: string;
  somenteArquivadas: boolean;
}

export interface OrdemPagination {
  sqlLimit: bigint;
  sqlOffset: bigint;
}

export interface NovaOrdemData {
  usuarioId: string;
  clienteId: string | null;
  veiculoId: string | null;
  nomeCliente: string;
  descricaoVeiculo: string;
  descricao: string;
  kmEntrada: number;
  previsaoEntrega: string | null;
  descontoPercentual: number;
}

function whereClause(filter: OrdemFilter): { where: string; params: unknown[] } {
  let where = filter.somenteArquivadas ? 'WHERE arquivado = 1' : 'WHERE arquivado = 0';
  const params: unknown[] = [];
  where += ' AND usuario_id = ?';
  params.push(filter.usuarioId);
  if (filter.status) {
    where += ' AND status = ?';
    params.push(filter.status);
  }
  if (filter.clienteId) {
    where += ' AND cliente_id = ?';
    params.push(filter.clienteId);
  }
  return { where, params };
}

export async function findAll(
  filter: OrdemFilter,
  pagination: OrdemPagination,
  conn?: PoolConnection
): Promise<OrdemServicoRow[]> {
  const { where, params } = whereClause(filter);
  const [rows] = await exec(conn)<OrdemServicoRow[]>(
    `SELECT * FROM ordens_servico ${where} ORDER BY data_abertura DESC LIMIT ? OFFSET ?`,
    [...params, pagination.sqlLimit, pagination.sqlOffset]
  );
  return rows;
}

export async function count(
  filter: OrdemFilter,
  conn?: PoolConnection
): Promise<number> {
  const { where, params } = whereClause(filter);
  const [rows] = await exec(conn)<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) as total FROM ordens_servico ${where}`,
    params
  );
  return Number(rows[0].total);
}

export async function findById(
  id: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<OrdemServicoRow | null> {
  const [rows] = await exec(conn)<OrdemServicoRow[]>(
    'SELECT * FROM ordens_servico WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return rows[0] ?? null;
}

export async function create(
  id: string,
  data: NovaOrdemData,
  conn?: PoolConnection
): Promise<void> {
  await exec(conn)(
    `INSERT INTO ordens_servico
       (id, usuario_id, cliente_id, veiculo_id, nome_cliente, descricao_veiculo, descricao, km_entrada, previsao_entrega, desconto_percentual)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      data.usuarioId,
      data.clienteId,
      data.veiculoId,
      data.nomeCliente,
      data.descricaoVeiculo,
      data.descricao,
      data.kmEntrada,
      data.previsaoEntrega,
      data.descontoPercentual,
    ]
  );
}

export async function update(
  id: string,
  sets: string[],
  vals: unknown[],
  usuarioId: string,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = await exec(conn)<ResultSetHeader>(
    `UPDATE ordens_servico SET ${sets.join(',')} WHERE id=? AND usuario_id=?`,
    [...vals, id, usuarioId]
  );
  return result.affectedRows > 0;
}

export async function remove(
  id: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = await exec(conn)<ResultSetHeader>(
    'DELETE FROM ordens_servico WHERE id = ? AND usuario_id = ?',
    [id, usuarioId]
  );
  return result.affectedRows > 0;
}

export async function updateStatus(
  id: string,
  status: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<void> {
  await exec(conn)('UPDATE ordens_servico SET status=? WHERE id=? AND usuario_id=?', [status, id, usuarioId]);
}

export async function finalizar(id: string, usuarioId: string, conn: PoolConnection): Promise<void> {
  await conn.execute(
    "UPDATE ordens_servico SET status='finalizado', data_finalizacao=NOW() WHERE id=? AND usuario_id=?",
    [id, usuarioId]
  );
}

export async function setArquivado(
  id: string,
  arquivado: boolean,
  usuarioId: string,
  conn?: PoolConnection
): Promise<boolean> {
  const [result] = arquivado
    ? await exec(conn)<ResultSetHeader>(
        'UPDATE ordens_servico SET arquivado = 1 WHERE id = ? AND usuario_id = ?',
        [id, usuarioId]
      )
    : await exec(conn)<ResultSetHeader>(
        'UPDATE ordens_servico SET arquivado = 0 WHERE id = ? AND usuario_id = ? AND arquivado = 1',
        [id, usuarioId]
      );
  return result.affectedRows > 0;
}
