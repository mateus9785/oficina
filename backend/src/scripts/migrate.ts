import fs from 'fs';
import path from 'path';
import mysql, { RowDataPacket } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Column migrations to apply idempotently (checked via INFORMATION_SCHEMA)
const columnMigrations: { table: string; column: string; definition: string }[] = [
  { table: 'historico_precos', column: 'quantidade', definition: 'INT NOT NULL DEFAULT 0' },
  { table: 'historico_precos', column: 'valor_total', definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00' },
  { table: 'historico_precos', column: 'preco_venda', definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00' },
  { table: 'ordens_servico', column: 'arquivado', definition: 'TINYINT(1) NOT NULL DEFAULT 0' },
  // Isolamento por conta: rede de segurança para um banco de dev pré-existente que já tinha essas
  // tabelas sem dono. Adiciona a coluna como NULL (sem FK) -- não tenta virar NOT NULL/FK sozinho
  // porque isso exigiria um backfill de qual usuário é dono de cada linha, que só um humano decide.
  // Em produção essas tabelas foram recriadas do zero (estavam vazias), então schema.sql já aplica
  // a coluna correta via CREATE TABLE; este bloco nunca chega a rodar lá.
  { table: 'clientes', column: 'usuario_id', definition: 'CHAR(36) NULL' },
  { table: 'veiculos', column: 'usuario_id', definition: 'CHAR(36) NULL' },
  { table: 'pecas', column: 'usuario_id', definition: 'CHAR(36) NULL' },
  { table: 'ordens_servico', column: 'usuario_id', definition: 'CHAR(36) NULL' },
  { table: 'contas', column: 'usuario_id', definition: 'CHAR(36) NULL' },
  { table: 'despesas_recorrentes', column: 'usuario_id', definition: 'CHAR(36) NULL' },
];

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oficina',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.resolve(__dirname, '../../database/schema.sql'), 'utf-8');
  await conn.query(schema);
  console.log('✓ Schema aplicado com sucesso.');

  // Apply column migrations idempotently
  for (const { table, column, definition } of columnMigrations) {
    const [rows] = await conn.query<(RowDataPacket & { cnt: number })[]>(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    const exists = rows[0].cnt > 0;
    if (!exists) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`✓ Coluna ${table}.${column} adicionada.`);
    } else {
      console.log(`  Coluna ${table}.${column} já existe, ignorando.`);
    }
  }

  console.log('✓ Migration executada com sucesso.');
  await conn.end();
}

migrate().catch(err => {
  console.error('✗ Erro na migration:', err);
  process.exit(1);
});
