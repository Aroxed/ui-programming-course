import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:4179',
    viewport: { width: 520, height: 980 },
    geolocation: { latitude: 50.45466, longitude: 30.5238 },
    permissions: ['geolocation'],
  },
  webServer: {
    command: 'CI=1 npx expo start --web --port 4179',
    port: 4179,
    reuseExistingServer: true,
    timeout: 120000,
  },
});
