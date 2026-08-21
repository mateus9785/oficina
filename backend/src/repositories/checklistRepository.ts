import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export interface ChecklistItemData {
  zona: string;
  temDano: boolean;
  descricao: string;
}

export async function findByOrdemId(
  ordemId: string,
  conn?: PoolConnection
): Promise<RowDataPacket[]> {
  const [rows] = await exec(conn)<RowDataPacket[]>(
    'SELECT * FROM checklist_entrada WHERE ordem_id = ? ORDER BY id',
    [ordemId]
  );
  return rows;
}

export async function deleteByOrdemId(
  ordemId: string,
  conn?: PoolConnection
): Promise<void> {
  await exec(conn)('DELETE FROM checklist_entrada WHERE ordem_id = ?', [ordemId]);
}

export async function insertMany(
  ordemId: string,
  itens: ChecklistItemData[],
  conn?: PoolConnection
): Promise<void> {
  for (const item of itens) {
    await exec(conn)(
      'INSERT INTO checklist_entrada (ordem_id, zona, tem_dano, descricao) VALUES (?,?,?,?)',
      [ordemId, item.zona, item.temDano ? 1 : 0, item.descricao ?? '']
    );
  }
}
