import { createApp } from './app';
import { env } from './config/env';
import { testConnection } from './config/database';

async function main() {
  try {
    await testConnection();
    console.log('✓ Conectado ao MySQL');
  } catch (err) {
    console.error('✗ Falha ao conectar ao MySQL:', err);
    process.exit(1);
  }

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`✓ Backend rodando em http://localhost:${env.PORT}`);
    console.log(`  Ambiente: ${env.NODE_ENV}`);
  });
}

main();
