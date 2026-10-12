import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4176', viewport: { width: 1280, height: 900 } },
  webServer: { command: 'npm run dev -- --host 127.0.0.1 --port 4176', port: 4176, reuseExistingServer: true },
});
