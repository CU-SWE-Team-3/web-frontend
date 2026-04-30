import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['**/node_modules/**', '**/src/features/player/tests/**'],
    server: {
      deps: {
        inline: ['lucide-react'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'text-summary'],
      reportsDirectory: './coverage',
      all: false,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/tests/**',
        'src/test/**',
        'src/**/*.module.scss',
        'node_modules/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
