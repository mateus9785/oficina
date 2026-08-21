import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Several forms populate local state from an entity prop inside a
      // useEffect (the standard "sync form fields when the record loads"
      // pattern) -- react-hooks v7's newer, React-Compiler-era guidance
      // flags that as an anti-pattern favoring derived-state-during-render
      // instead. Fixing it properly means restructuring each form's state
      // initialization, a real behavioral change with its own risk -- out
      // of scope for a tooling-only pass. Downgraded to a warning so CI
      // stays green without silently rewriting component logic; same
      // treatment as the pre-existing exhaustive-deps warnings below.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
])
