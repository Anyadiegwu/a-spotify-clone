// eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  // Ignore build output
  { ignores: ['dist/**', 'node_modules/**'] },

  // ==================== REACT / FRONTEND FILES (src/, *.jsx) ====================
  {
    files: ['**/*.{jsx,tsx}', 'src/**/*.js'], // Frontend React files first
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.recommended.rules,
      'react-refresh/only-export-components': 'warn',
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // ==================== NODE.JS / BACKEND FILES (index.js, server.js) ====================
  {
    files: ['index.js', 'server.js', 'api.js'], // Your root index.js + common server names
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,  // ✅ process, Buffer, __dirname, module, etc.
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',           // ✅ Allow console.log()
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // ✅ Ignore _error params
    },
  },
];