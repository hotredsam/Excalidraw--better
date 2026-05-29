import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@excalibur/shared': path.resolve(__dirname, '../shared/src/index.ts'),
      '@excalibur/ipc': path.resolve(__dirname, '../ipc/src/index.ts'),
      '@excalibur/api-contract': path.resolve(__dirname, '../api-contract/src/index.ts'),
    },
  },
});
