import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire("/Users/mike/Desktop/zovo-ext/engine/7-live-qa/");
const { chromium } = require("playwright");
const dist = new URL("../dist/", import.meta.url).pathname;
const profile = mkdtempSync(join(tmpdir(), "skiplist-runtime-"));
const executablePath = chromium.executablePath();
const context = await chromium.launchPersistentContext(profile, {
  headless: true,
  executablePath,
  args: [`--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
});

try {
  let worker;
  for (let i = 0; i < 30 && !worker; i += 1) {
    worker = context.serviceWorkers().find((item) => item.url().endsWith("/background.js"));
    if (!worker) await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert(worker, "MV3 service worker registered");
  const extensionId = new URL(worker.url()).host;
  const page = context.pages()[0] || await context.newPage();

  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.evaluate(async () => chrome.storage.sync.set({ minutesSaved: 12.5, skipCount: 7, disableSkipping: false }));
  await page.reload();
  await page.waitForSelector("#savedTime");
  assert.equal(await page.textContent("#savedTime"), "13 min");
  assert.match(await page.textContent("#savedDetail"), /7 personal skips/);
  await page.click(".slp-switch span");
  assert.equal(await page.evaluate(async () => (await chrome.storage.sync.get("disableSkipping")).disableSkipping), true);

  await page.goto(`chrome-extension://${extensionId}/options/options.html`);
  await page.click("#saveProfile");
  assert.equal(await page.evaluate(async () => Object.keys((await chrome.storage.local.get("skipProfiles")).skipProfiles).length), 1);
  await page.click("#savePodcast");
  assert.match(await page.textContent("#licenseMessage"), /Activate Pro/);
  await page.fill("#licenseKey", "NOT-A-KEY");
  await page.click("#activateLicense");
  assert.match(await page.textContent("#licenseMessage"), /four groups/);

  await page.route("https://zgubxqomnbmxgbdhvwja.supabase.co/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ valid: true, tier: "lifetime", exp: 0 }) });
  });
  await page.fill("#licenseKey", "ZOVO-ABCD-EFGH-IJKL-MNOP");
  await page.click("#activateLicense");
  await page.waitForFunction(() => document.querySelector("#licenseBadge")?.textContent === "PRO");
  assert.equal(await page.evaluate(async () => (await chrome.storage.local.get("slp_license_status")).slp_license_status), "pro");

  await page.check("#podcastEnabled");
  await page.fill("#podcastPattern", "podcast|episode");
  await page.fill("#podcastIntro", "60");
  await page.fill("#podcastOutro", "25");
  await page.click("#savePodcast");
  const podcast = await page.evaluate(async () => (await chrome.storage.local.get("podcastRules")).podcastRules);
  assert.deepEqual(podcast, { enabled: true, titlePattern: "podcast|episode", introSeconds: 60, outroSeconds: 25 });
  const categorySelections = await page.evaluate(async () => (await chrome.storage.sync.get("categorySelections")).categorySelections);
  assert.equal(categorySelections.find((item) => item.name === "intro").option, 2);
  assert.equal(categorySelections.find((item) => item.name === "outro").option, 2);

  await page.fill("#profileName", "Podcast mode");
  await page.click("#saveProfile");
  assert.equal(await page.evaluate(async () => Object.keys((await chrome.storage.local.get("skipProfiles")).skipProfiles).length), 2);
  console.log(`skiplist-runtime: PASS (extension ${extensionId})`);
} finally {
  await context.close();
}
