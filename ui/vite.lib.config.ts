import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// Library build: emits @excalibur/ui as an ESM package consumable by other apps.
// React, the Excalidraw canvas and the @excalibur/* packages stay external so
// the host dedupes them. The app's own SPA build (vite.config.ts -> dist/) is
// untouched.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'lib',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.tsx'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@excalidraw/excalidraw',
        /^@excalibur\//,
      ],
      output: {
        assetFileNames: (asset) => (asset.name === 'style.css' ? 'styles.css' : asset.name ?? '[name][extname]'),
      },
    },
  },
});
