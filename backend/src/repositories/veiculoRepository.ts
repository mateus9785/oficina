import { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';
import { VeiculoRow } from '../types/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export async function findByClienteId(
  clienteId: string,
  usuarioId: string,
  conn?: PoolConnection
): Promise<VeiculoRow[]> {
  const [rows] = await exec(conn)<VeiculoRow[]>(
    'SELECT * FROM veiculos WHERE cliente_id = ? AND usuario_id = ? ORDER BY modelo',
    [clienteId, usuarioId]
  );
  return rows;
}
