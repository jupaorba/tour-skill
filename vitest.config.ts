import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.test.ts', 'packages/**/test/**/*.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/runtime/src/core/**', 'packages/runtime/src/anchor/**'],
      thresholds: { lines: 70, statements: 70 },
    },
  },
});
