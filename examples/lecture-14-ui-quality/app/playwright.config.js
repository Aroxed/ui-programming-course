import { defineConfig } from '@playwright/test';

const port = Number(process.env.LECTURE14_TEST_PORT || 4174);
const baseURL = 'http://127.0.0.1:' + port;

export default defineConfig({
  testDir: './tests',
  workers: 1,
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --port ' + port + ' --strictPort',
    url: baseURL,
    reuseExistingServer: false,
  },
});
