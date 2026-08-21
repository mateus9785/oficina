import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    // The remaining 10 controllers still inline raw SQL and `as any` casts;
    // clientes/ordens were cleaned up in refactor/backend-services-repositories
    // and refactor/type-mysql-rows. The other 10 stay out of scope for this
    // portfolio pass.
    ignores: [
      'dist/**',
      'node_modules/**',
      'src/controllers/anexos.controller.ts',
      'src/controllers/auth.controller.ts',
      'src/controllers/configuracoes.controller.ts',
      'src/controllers/estoque.controller.ts',
      'src/controllers/financeiro.controller.ts',
      'src/controllers/notificacoes.controller.ts',
      'src/controllers/recorrentes.controller.ts',
      'src/controllers/relatorios.controller.ts',
      'src/controllers/usuarios.controller.ts',
      'src/controllers/veiculos.controller.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // declare global { namespace Express { ... } } is the standard way to
      // augment Express's Request type -- there's no ES module equivalent.
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
  eslintConfigPrettier
);
