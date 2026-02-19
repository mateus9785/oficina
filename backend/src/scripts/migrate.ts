import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const schema = fs.readFileSync(path.resolve(__dirname, '../../database/schema.sql'), 'utf-8');
  await conn.query(schema);
  console.log('✓ Migration executada com sucesso.');
  await conn.end();
}

migrate().catch(err => {
  console.error('✗ Erro na migration:', err);
  process.exit(1);
});
