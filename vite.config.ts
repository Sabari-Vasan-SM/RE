import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    watch: {
      ignored: ['**/reference/**']
    }
  },
  optimizeDeps: {
    entries: ['src/**/*.{ts,tsx}']
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    exclude: ['reference/**', 'node_modules/**']
  }
} as any);
