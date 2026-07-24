import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  webServer: {
    command: 'npm run dev -w examples/react-vite-crm',
    url: 'http://localhost:5173/login',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  use: {
    baseURL: 'http://localhost:5173',
  },
});
