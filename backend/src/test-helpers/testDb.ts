import { pool } from '../config/database';

const TABLES = [
  'contas',
  'itens_os',
  'checklist_entrada',
  'ordens_servico',
  'historico_precos',
  'pecas',
  'veiculos',
  'clientes',
];

/**
 * Wipes every table touched by the clientes/ordens integration tests.
 * FK checks are disabled around the truncate so table order doesn't matter
 * -- simpler and less fragile than hand-ordering deletes around the FK
 * graph (contas -> ordens_servico, itens_os/checklist_entrada -> ordens_servico,
 * itens_os -> pecas, historico_precos -> pecas, veiculos -> clientes).
 *
 * SET FOREIGN_KEY_CHECKS is a session variable -- every statement here must
 * run on the same pooled connection, or the pool may hand the TRUNCATEs a
 * different connection than the one where checks were disabled.
 */
export async function resetDb(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    conn.release();
  }
}
