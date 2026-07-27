const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'python3 -m http.server 8765',
    port: 8765,
    reuseExistingServer: true,
  },
});
