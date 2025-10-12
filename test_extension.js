const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const extensionPath = path.join(__dirname, 'dist');

  const browser = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });

  const page = await browser.newPage();
  await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  // Wait for video to load
  await page.waitForTimeout(3000);

  // Take screenshot before opening extension
  await page.screenshot({ path: 'before_extension.png' });
  console.log('Navigated to YouTube, waiting for you to click extension icon...');

  // Wait for extension to be activated
  await page.waitForTimeout(30000);

  // Take screenshot after extension is open
  await page.screenshot({ path: 'after_extension.png' });

  console.log('Screenshots saved. Check before_extension.png and after_extension.png');

  await browser.close();
})();
