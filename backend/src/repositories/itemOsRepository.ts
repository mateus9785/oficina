import { PoolConnection } from 'mysql2/promise';
import { pool } from '../config/database';
import { ItemOsRow } from '../types/database';

function exec(conn?: PoolConnection) {
  return conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
}

export interface NovoItemData {
  tipo: string;
  pecaId: string | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export async function findByOrdemId(
  ordemId: string,
  conn?: PoolConnection
): Promise<ItemOsRow[]> {
  const [rows] = await exec(conn)<ItemOsRow[]>(
    'SELECT * FROM itens_os WHERE ordem_id = ? ORDER BY criado_em',
    [ordemId]
  );
  return rows;
}

export async function findByOrdemIdETipo(
  ordemId: string,
  tipo: string,
  conn?: PoolConnection
): Promise<ItemOsRow[]> {
  const [rows] = await exec(conn)<ItemOsRow[]>(
    'SELECT * FROM itens_os WHERE ordem_id = ? AND tipo = ?',
    [ordemId, tipo]
  );
  return rows;
}

export async function findById(
  itemId: string,
  conn?: PoolConnection
): Promise<ItemOsRow | null> {
  const [rows] = await exec(conn)<ItemOsRow[]>(
    'SELECT * FROM itens_os WHERE id = ?',
    [itemId]
  );
  return rows[0] ?? null;
}

export async function create(
  itemId: string,
  ordemId: string,
  data: NovoItemData,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(
    'INSERT INTO itens_os (id, ordem_id, tipo, peca_id, descricao, quantidade, valor_unitario) VALUES (?,?,?,?,?,?,?)',
    [
      itemId,
      ordemId,
      data.tipo,
      data.pecaId,
      data.descricao,
      data.quantidade,
      data.valorUnitario,
    ]
  );
}

export async function update(
  itemId: string,
  sets: string[],
  vals: unknown[],
  conn: PoolConnection
): Promise<void> {
  await conn.execute(`UPDATE itens_os SET ${sets.join(',')} WHERE id=?`, [
    ...vals,
    itemId,
  ]);
}

export async function remove(itemId: string, conn: PoolConnection): Promise<void> {
  await conn.execute('DELETE FROM itens_os WHERE id = ?', [itemId]);
}
