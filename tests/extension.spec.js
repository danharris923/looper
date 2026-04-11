const { test, expect, chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const extensionPath = path.resolve(__dirname, '..');
const scriptContent = fs.readFileSync(path.join(extensionPath, 'content.js'), 'utf-8');

// HTML page that mocks chrome APIs and provides a video element
const testHTML = `
<html>
<head>
  <script>
    window.chrome = {
      runtime: {
        getURL: (path) => 'chrome-extension://fake/' + path,
        onMessage: { addListener: (fn) => { window._messageListener = fn; } }
      }
    };
  </script>
</head>
<body>
  <video src="test.mp4"></video>
</body>
</html>
`;

test('content.js parses and loads without errors', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  // Navigate to a file URL so localStorage works
  await page.goto('about:blank');
  await page.setContent(testHTML, { waitUntil: 'domcontentloaded' });

  // Use addScriptTag to load the content in the page's main world
  // First write the script to a temp file
  const loadError = await page.evaluate((code) => {
    try {
      // Ensure localStorage is available (mock if not)
      try { localStorage.getItem('test'); } catch(e) {
        Object.defineProperty(window, 'localStorage', {
          value: {
            _data: {},
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; },
          }
        });
      }
      (0, eval)(code);
      return null;
    } catch (e) {
      return { message: e.message, stack: e.stack };
    }
  }, scriptContent);

  if (loadError) {
    console.log('LOAD ERROR:', loadError.message);
    console.log('Stack:', loadError.stack);
  }

  const fnCheck = await page.evaluate(() => ({
    injectStyles: typeof injectStyles,
    buildPedalUI: typeof buildPedalUI,
    createLoopStation: typeof createLoopStation,
    findVideoAndCreate: typeof findVideoAndCreate,
    knurledPath: typeof knurledPath,
    butterflyPaths: typeof butterflyPaths,
    applySkinToUI: typeof applySkinToUI,
  }));
  console.log('Functions:', fnCheck);
  console.log('Page errors:', errors);

  expect(loadError).toBeNull();
  expect(fnCheck.injectStyles).toBe('function');
  expect(fnCheck.buildPedalUI).toBe('function');
  expect(fnCheck.createLoopStation).toBe('function');
  expect(fnCheck.applySkinToUI).toBe('function');

  await browser.close();
});

test('pedal UI builds correctly with all elements', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('about:blank');
  await page.setContent(testHTML, { waitUntil: 'domcontentloaded' });

  // Load script with localStorage mock
  const loadError = await page.evaluate((code) => {
    try {
      try { localStorage.getItem('test'); } catch(e) {
        Object.defineProperty(window, 'localStorage', {
          value: {
            _data: {},
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; },
          }
        });
      }
      (0, eval)(code);
      return null;
    } catch (e) {
      return { message: e.message, stack: e.stack };
    }
  }, scriptContent);

  expect(loadError).toBeNull();

  // Create the loop station
  const result = await page.evaluate(() => {
    const video = document.querySelector('video');
    try {
      createLoopStation(video);
    } catch(e) {
      return { error: e.message, stack: e.stack };
    }

    const pedal = document.getElementById('yt-loop-station');
    if (!pedal) return { error: 'Pedal element not found' };

    return {
      error: null,
      pedalExists: true,
      hasSkinLayer: !!pedal.querySelector('.ytls-skin-layer'),
      hasSvgContainer: !!pedal.querySelector('.ytls-svg-container'),
      hasSvgInContainer: !!pedal.querySelector('.ytls-svg-container svg'),
      hasOverlay: !!pedal.querySelector('.ytls-overlay'),
      hasDragZone: !!pedal.querySelector('.ytls-drag-zone'),
      hasLCD: !!pedal.querySelector('.ytls-lcd'),
      hasLCDLine1: !!pedal.querySelector('.ytls-lcd-line1'),
      hasLCDLine2: !!pedal.querySelector('.ytls-lcd-line2'),
      hasLED: !!pedal.querySelector('.ytls-led'),
      knobCount: pedal.querySelectorAll('.ytls-knob').length,
      knobFaceCount: pedal.querySelectorAll('.ytls-knob-face').length,
      toggleCount: pedal.querySelectorAll('.ytls-toggle-track').length,
      hasFootswitch: !!pedal.querySelector('.ytls-footswitch'),
      footswitchText: pedal.querySelector('.ytls-footswitch')?.textContent,
      hasSettings: !!pedal.querySelector('.ytls-settings-panel'),
      hasCloseBtn: !!pedal.querySelector('.ytls-close-btn'),
      hasSettingsBtn: !!pedal.querySelector('.ytls-settings-btn'),
      skinSwatchCount: pedal.querySelectorAll('.ytls-skin-swatch').length,
      styleTag: !!document.getElementById('yt-loop-station-styles'),
      lcdLine1Text: pedal.querySelector('.ytls-lcd-line1')?.textContent,
      lcdLine2Text: pedal.querySelector('.ytls-lcd-line2')?.textContent,
      knobFaceColor: getComputedStyle(pedal).getPropertyValue('--knob-face').trim(),
    };
  });

  console.log('Build result:', JSON.stringify(result, null, 2));
  console.log('Page errors:', errors);

  expect(result.error).toBeNull();
  expect(result.pedalExists).toBe(true);
  expect(result.hasSkinLayer).toBe(true);
  expect(result.hasSvgContainer).toBe(true);
  expect(result.hasSvgInContainer).toBe(true); // actual Boss SVG artwork
  expect(result.hasOverlay).toBe(true);
  expect(result.hasDragZone).toBe(true);
  expect(result.hasLCD).toBe(true);
  expect(result.hasLCDLine1).toBe(true);
  expect(result.hasLCDLine2).toBe(true);
  expect(result.hasLED).toBe(true);
  expect(result.knobCount).toBe(2);
  expect(result.knobFaceCount).toBe(2);
  expect(result.toggleCount).toBe(4);
  expect(result.hasFootswitch).toBe(true);
  expect(result.footswitchText).toBe('REC');
  expect(result.hasSettings).toBe(true);
  expect(result.hasCloseBtn).toBe(true);
  expect(result.hasSettingsBtn).toBe(true);
  expect(result.skinSwatchCount).toBe(8);
  expect(result.styleTag).toBe(true);
  expect(result.lcdLine1Text).toBe('YT LOOP STATION');
  expect(result.lcdLine2Text).toBe('READY');
  expect(result.knobFaceColor).toBe('#E7EFF4'); // BD-2 default

  await browser.close();
});

test('knob SVG structure is correct', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('about:blank');
  await page.setContent(testHTML, { waitUntil: 'domcontentloaded' });

  await page.evaluate((code) => {
    try { localStorage.getItem('test'); } catch(e) {
      Object.defineProperty(window, 'localStorage', {
        value: { _data: {}, getItem(k) { return this._data[k] || null; }, setItem(k, v) { this._data[k] = String(v); }, removeItem(k) { delete this._data[k]; } }
      });
    }
    (0, eval)(code);
  }, scriptContent);

  const knobCheck = await page.evaluate(() => {
    const knob = buildKnob('TEST', 50);
    const svg = knob.svg;
    const circles = svg.querySelectorAll('circle');
    const paths = svg.querySelectorAll('path');
    const lines = svg.querySelectorAll('line');

    return {
      svgExists: !!svg,
      svgTagName: svg.tagName,
      viewBox: svg.getAttribute('viewBox'),
      circleCount: circles.length,
      pathCount: paths.length,
      lineCount: lines.length,
      hasKnobFace: !!svg.querySelector('.ytls-knob-face'),
      indicatorExists: !!knob.indicator,
      indicatorTransform: knob.indicator?.getAttribute('transform'),
      dataValue: svg.dataset.value,
      labelText: knob.label?.textContent,
    };
  });

  console.log('Knob structure:', JSON.stringify(knobCheck, null, 2));

  expect(knobCheck.svgExists).toBe(true);
  expect(knobCheck.svgTagName).toBe('svg');
  expect(knobCheck.viewBox).toBe('0 0 64 64');
  expect(knobCheck.circleCount).toBe(2); // outer dark ring + face
  expect(knobCheck.pathCount).toBe(3);  // knurled + 2 butterfly
  expect(knobCheck.lineCount).toBe(1);  // indicator
  expect(knobCheck.hasKnobFace).toBe(true);
  expect(knobCheck.indicatorExists).toBe(true);
  expect(knobCheck.indicatorTransform).toContain('rotate(0'); // 50% = 0 degrees
  expect(knobCheck.dataValue).toBe('50');
  expect(knobCheck.labelText).toBe('TEST');

  await browser.close();
});

test('skin switching works', async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('about:blank');
  await page.setContent(testHTML, { waitUntil: 'domcontentloaded' });

  await page.evaluate((code) => {
    try { localStorage.getItem('test'); } catch(e) {
      Object.defineProperty(window, 'localStorage', {
        value: { _data: {}, getItem(k) { return this._data[k] || null; }, setItem(k, v) { this._data[k] = String(v); }, removeItem(k) { delete this._data[k]; } }
      });
    }
    (0, eval)(code);
    createLoopStation(document.querySelector('video'));
  }, scriptContent);

  // Check default skin (BD-2 blue) - SVG body should contain BD-2 blue color
  const defaultSkin = await page.evaluate(() => {
    const pedal = document.getElementById('yt-loop-station');
    const svgHtml = pedal.querySelector('.ytls-svg-container').innerHTML;
    return {
      knobFace: getComputedStyle(pedal).getPropertyValue('--knob-face').trim(),
      containsBd2Blue: svgHtml.includes('#015077'),
    };
  });
  expect(defaultSkin.knobFace).toBe('#E7EFF4');
  expect(defaultSkin.containsBd2Blue).toBe(true);

  // Switch to DS-1 (orange) via applySkinToUI
  const afterSwitch = await page.evaluate(() => {
    const pedal = document.getElementById('yt-loop-station');
    const svgCont = pedal.querySelector('.ytls-svg-container');
    applySkinToUI(pedal, svgCont, 'ds1');
    const svgHtml = svgCont.innerHTML;
    return {
      containsOrange: svgHtml.includes('#FF720B'),
      knobFace: getComputedStyle(pedal).getPropertyValue('--knob-face').trim(),
    };
  });
  console.log('After DS-1 switch:', afterSwitch);
  expect(afterSwitch.containsOrange).toBe(true);
  expect(afterSwitch.knobFace).toBe('#E7EFF4');

  // Switch to DD-7 (white/gray with blue knobs)
  const dd7Skin = await page.evaluate(() => {
    const pedal = document.getElementById('yt-loop-station');
    const svgCont = pedal.querySelector('.ytls-svg-container');
    applySkinToUI(pedal, svgCont, 'dd7');
    const svgHtml = svgCont.innerHTML;
    return {
      containsGray: svgHtml.includes('#D8E1E5'),
      knobFace: getComputedStyle(pedal).getPropertyValue('--knob-face').trim(),
    };
  });
  expect(dd7Skin.containsGray).toBe(true);
  expect(dd7Skin.knobFace).toBe('#00A9D8');

  await browser.close();
});

test('extension loads in Chrome with real extension context', async () => {
  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-first-run',
      '--disable-gpu',
    ],
  });

  // Wait for service worker
  let sw = context.serviceWorkers()[0];
  if (!sw) sw = await context.waitForEvent('serviceworker', { timeout: 10000 });
  const extId = sw.url().split('/')[2];
  console.log('Extension loaded, ID:', extId);

  // Navigate to YouTube
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });
  await page.waitForTimeout(4000);

  // Check for extension-related errors
  const extErrors = consoleErrors.filter(e =>
    e.includes('Loop Station') || e.includes('ytls') || e.includes('content.js')
  );
  console.log('All console errors:', consoleErrors);
  console.log('Extension errors:', extErrors);

  // Trigger the pedal via the service worker (simulates clicking extension icon)
  const pageTarget = await page.evaluate(() => window.location.href);
  console.log('Page URL:', pageTarget);

  // Send the toggle message from service worker to tab
  const tabId = await sw.evaluate(async () => {
    const tabs = await chrome.tabs.query({ active: true });
    if (tabs.length > 0) {
      try {
        await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle_pedal' });
        return tabs[0].id;
      } catch(e) {
        return 'error: ' + e.message;
      }
    }
    return 'no tabs';
  });
  console.log('Sent toggle to tab:', tabId);

  await page.waitForTimeout(3000);

  const pedalState = await page.evaluate(() => {
    const pedal = document.getElementById('yt-loop-station');
    if (!pedal) return { visible: false, bodyChildCount: document.body.children.length };
    const styles = getComputedStyle(pedal);
    return {
      visible: true,
      hasSkinLayer: !!pedal.querySelector('.ytls-skin-layer'),
      hasSvgArt: !!pedal.querySelector('.ytls-svg-container svg'),
      hasLCD: !!pedal.querySelector('.ytls-lcd'),
      hasKnobs: pedal.querySelectorAll('.ytls-knob').length,
      hasFootswitch: !!pedal.querySelector('.ytls-footswitch'),
      lcdText: pedal.querySelector('.ytls-lcd-line1')?.textContent,
      hasLED: !!pedal.querySelector('.ytls-led'),
      hasSkinSwatches: pedal.querySelectorAll('.ytls-skin-swatch').length,
      display: styles.display,
      width: styles.width,
      position: styles.position,
      zIndex: styles.zIndex,
    };
  });
  console.log('Pedal state after toggle:', JSON.stringify(pedalState, null, 2));

  // Also check console for any errors that happened during creation
  const creationErrors = consoleErrors.filter(e =>
    e.includes('Loop Station') || e.includes('ytls') || e.includes('content.js') ||
    e.includes('Uncaught') || e.includes('TypeError') || e.includes('ReferenceError')
  );
  console.log('Errors during creation:', creationErrors);
  console.log('All console errors:', consoleErrors);

  expect(creationErrors.length).toBe(0);
  expect(pedalState.visible).toBe(true);
  expect(pedalState.hasSkinLayer).toBe(true);
  expect(pedalState.hasSvgArt).toBe(true);
  expect(pedalState.hasLCD).toBe(true);
  expect(pedalState.hasKnobs).toBe(2);

  await context.close();
});
