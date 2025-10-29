import { defineConfig, devices } from '@playwright/test';
import type { } from 'node';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'api-tests',
      testMatch: '**/*.api.spec.ts',
    },
    {
      name: 'health-checks',
      testMatch: '**/api-health.spec.ts',
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3001/health',
    cwd: '../',
    reuseExistingServer: !process.env['CI'],
    timeout: 60 * 1000,
  },
});