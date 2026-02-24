import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Column migrations to apply idempotently (checked via INFORMATION_SCHEMA)
const columnMigrations: { table: string; column: string; definition: string }[] = [
  { table: 'historico_precos', column: 'quantidade', definition: 'INT NOT NULL DEFAULT 0' },
  { table: 'historico_precos', column: 'valor_total', definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00' },
  { table: 'historico_precos', column: 'preco_venda', definition: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00' },
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
    const [rows] = await conn.query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    const exists = (rows as any[])[0].cnt > 0;
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
