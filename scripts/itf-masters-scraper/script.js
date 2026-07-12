// Scrape the Denmark vs Germany tie (Fred Perry Cup / Men's 50, play-off for
// 5th/6th place) from the ITF Masters World Team Championships 2026 (Rome,
// Italy, 5-10 July 2026) on itfmasters.tournamentsoftware.com.
//
// Usage:
//   npm install
//   node script.js
//
// Optional env vars:
//   PW_EXECUTABLE_PATH  - path to a Chromium binary (skips Playwright's download)
//   HTTPS_PROXY         - proxy server to route browser traffic through
const { chromium } = require('playwright');

const START_URL =
  'https://itfmasters.tournamentsoftware.com/find/tournament?q=World%20Team%20Championships';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PW_EXECUTABLE_PATH || undefined,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });
  const page = await (await browser.newContext()).newPage();

  try {
    // 1. Tournament search on the ITF Masters portal. The site is client-side
    //    rendered, so wait for the network to go idle before querying the DOM.
    await page.goto(START_URL, { waitUntil: 'networkidle', timeout: 45000 });

    // 2. Open the 2026 tournament (Rome, Italy).
    const tournament = page
      .locator('a', { hasText: /World Team Championships/i })
      .filter({ hasText: /2026|50/ })
      .first();
    await tournament.waitFor({ timeout: 20000 });
    await tournament.click();
    await page.waitForLoadState('networkidle');

    // 3. Navigate to Draws and select the Fred Perry Cup (Men's 50) event.
    await page.locator('a', { hasText: /^Draws$/i }).first().click();
    await page.waitForLoadState('networkidle');
    const event = page
      .locator('a', { hasText: /Fred Perry Cup|Men'?s 50/i })
      .first();
    await event.waitFor({ timeout: 20000 });
    await event.click();
    await page.waitForLoadState('networkidle');

    // 4. Open the 5th-8th place play-off draw if it is a separate page.
    const playoff = page.locator('a', { hasText: /5th|play.?off/i }).first();
    if (await playoff.count()) {
      await playoff.click();
      await page.waitForLoadState('networkidle');
    }

    // 5. Find the Denmark vs Germany tie and print the team score.
    const tie = page
      .locator('a, tr', { hasText: /Denmark/ })
      .filter({ hasText: /Germany/ })
      .first();
    await tie.waitFor({ timeout: 20000 });
    console.log('=== Denmark vs Germany (5th/6th place play-off) ===');
    console.log((await tie.innerText()).trim());

    // 6. Drill into the tie for the individual rubbers (singles + doubles).
    if ((await tie.evaluate((el) => el.tagName)) === 'A') {
      await tie.click();
      await page.waitForLoadState('networkidle');
      console.log('\n=== Individual match breakdown ===');
      console.log(await page.locator('main, body').first().innerText());
    }
  } catch (err) {
    console.error('SCRAPE FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
