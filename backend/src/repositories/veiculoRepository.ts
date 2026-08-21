import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export async function findByClienteId(
  clienteId: string,
  conn?: PoolConnection
): Promise<RowDataPacket[]> {
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT * FROM veiculos WHERE cliente_id = ? ORDER BY modelo',
    [clienteId]
  );
  return rows;
}
