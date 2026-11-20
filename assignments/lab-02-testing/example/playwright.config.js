import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORT || 4182);
const baseURL = 'http://127.0.0.1:' + port;

export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run start:test',
    env: { PORT: String(port) },
    url: baseURL + '/api/tasks',
    reuseExistingServer: false,
  },
});
