import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oficina',
    multipleStatements: true,
  });

  const sql = fs.readFileSync(path.resolve(__dirname, '../../database/seed.sql'), 'utf-8');
  await conn.query(sql);
  console.log('✓ Seed executado com sucesso.');
  await conn.end();
}

seed().catch(err => {
  console.error('✗ Erro no seed:', err);
  process.exit(1);
});
