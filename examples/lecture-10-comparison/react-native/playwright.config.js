import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4181',
    viewport: { width: 430, height: 900 },
  },
  webServer: {
    command: 'CI=1 npx expo start --web --port 4181',
    port: 4181,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
