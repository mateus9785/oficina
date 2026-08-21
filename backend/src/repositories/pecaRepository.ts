import { PoolConnection } from 'mysql2/promise';

/**
 * Adjusts stock by a signed delta of units consumed: quantidade -= delta,
 * uso_total += delta. delta > 0 for a new/increased item (consumes stock),
 * delta < 0 for a decreased item quantity during an edit (returns stock).
 * No floor on uso_total here -- matches the original inline SQL, which
 * never clamped this path either.
 */
export async function ajustarConsumo(
  pecaId: string,
  delta: number,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(
    'UPDATE pecas SET quantidade = quantidade - ?, uso_total = uso_total + ? WHERE id = ?',
    [delta, delta, pecaId]
  );
}

/**
 * Restores `quantidade` units of stock (item removed / order deleted):
 * quantidade += quantidade, uso_total floored at 0 when decreasing --
 * matches the original inline SQL's GREATEST(0, ...) guard.
 */
export async function restaurarEstoque(
  pecaId: string,
  quantidade: number,
  conn: PoolConnection
): Promise<void> {
  await conn.execute(
    'UPDATE pecas SET quantidade = quantidade + ?, uso_total = GREATEST(0, uso_total - ?) WHERE id = ?',
    [quantidade, quantidade, pecaId]
  );
}
