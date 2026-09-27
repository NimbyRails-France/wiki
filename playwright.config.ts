import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    channel: process.env.WIKI_BROWSER_CHANNEL || undefined,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node scripts/preview-static.mjs',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
})
