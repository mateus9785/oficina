import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    // src/controllers/** still has raw SQL and `as any` casts everywhere;
    // clientes/ordens get cleaned up (and un-ignored) in the
    // refactor/backend-services-repositories and refactor/type-mysql-rows
    // phases, the other 10 controllers stay out of scope for this pass.
    ignores: ['dist/**', 'node_modules/**', 'src/controllers/**'],
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
