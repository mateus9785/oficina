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
// Mesmo id usado por authHeader() em testAuth.ts. As tabelas de negócio agora têm
// usuario_id NOT NULL + FK para usuarios(id): sem essa linha existir, qualquer INSERT
// feito com o token padrão dos testes quebraria com ER_NO_REFERENCED_ROW -- o CI roda
// só `db:migrate`, não `db:seed`, então não dá pra contar com o admin semeado existir.
const USUARIO_TESTE_ID = '00000000-0000-0000-0000-000000000001';

export async function resetDb(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of TABLES) {
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.query(
      `INSERT IGNORE INTO usuarios (id, nome, email, senha_hash, role) VALUES (?, 'Admin Teste', 'admin@teste.local', 'x', 'admin')`,
      [USUARIO_TESTE_ID]
    );
  } finally {
    conn.release();
  }
}

/** Garante que um segundo usuário de teste existe, para cenários de isolamento por conta. */
export async function criarUsuarioTeste(id: string, email: string): Promise<void> {
  await pool.query(
    `INSERT IGNORE INTO usuarios (id, nome, email, senha_hash, role) VALUES (?, 'Usuário Teste', ?, 'x', 'funcionario')`,
    [id, email]
  );
}
