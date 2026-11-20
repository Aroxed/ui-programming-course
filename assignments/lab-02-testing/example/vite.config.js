import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/component/**/*.test.jsx'],
    environment: 'jsdom',
    setupFiles: './tests/component/setup.js',
  },
});
