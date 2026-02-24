import cron from 'node-cron';
import { createApp } from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import { processarRecorrentes } from './controllers/recorrentes.controller';

async function main() {
  try {
    await testConnection();
    console.log('✓ Conectado ao MySQL');
  } catch (err) {
    console.error('✗ Falha ao conectar ao MySQL:', err);
    process.exit(1);
  }

  // Processa recorrentes na inicialização (recupera dias perdidos)
  await processarRecorrentes();

  // Agenda processamento diário às 8h00
  cron.schedule('0 8 * * *', processarRecorrentes);

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`✓ Backend rodando em http://localhost:${env.PORT}`);
    console.log(`  Ambiente: ${env.NODE_ENV}`);
  });
}

main();
