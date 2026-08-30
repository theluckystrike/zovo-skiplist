import strictAssert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire("/Users/mike/Desktop/zovo-ext/engine/7-live-qa/");
const { chromium } = require("playwright");
let assertionCount = 0;
const assert = new Proxy((...args) => {
  assertionCount += 1;
  return strictAssert(...args);
}, {
  get: (_target, property) => (...args) => {
    assertionCount += 1;
    return strictAssert[property](...args);
  },
});
const dist = process.argv[2] || new URL("../dist/", import.meta.url).pathname;
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
  const firstProfiles = await page.evaluate(async () => (await chrome.storage.local.get("skipProfiles")).skipProfiles);
  assert.equal(Object.keys(firstProfiles).length, 1);
  assert.equal(Object.values(firstProfiles)[0].categorySelections.find((item) => item.name === "selfpromo").option, 2);
  await page.click("#savePodcast");
  assert.match(await page.textContent("#licenseMessage"), /Activate Pro/);
  await page.fill("#licenseKey", "NOT-A-KEY");
  await page.click("#activateLicense");
  assert.match(await page.textContent("#licenseMessage"), /four groups/);

  let licenseReply = { status: 200, body: { valid: true, tier: "lifetime", exp: 0 } };
  // Context-level routing covers both the options page and MV3 service-worker
  // refreshes; page.route() cannot reliably intercept the latter.
  await context.route("https://zgubxqomnbmxgbdhvwja.supabase.co/**", async (route) => {
    if (licenseReply.abort) return route.abort("timedout");
    await route.fulfill({
      status: licenseReply.status,
      contentType: "application/json",
      body: licenseReply.raw ?? JSON.stringify(licenseReply.body),
    });
  });

  const resetFree = async () => {
    await page.evaluate(async () => chrome.storage.local.set({
      slp_license_status: "free",
      slp_license_key: "",
      slp_license_verified_at: 0,
      slp_license_exp: 0,
    }));
    await page.reload();
  };
  const activateAndRead = async () => {
    await page.fill("#licenseKey", "ZOVO-ABCD-EFGH-IJKL-MNOP");
    await page.click("#activateLicense");
    await page.waitForTimeout(50);
    return page.evaluate(async () => chrome.storage.local.get([
      "slp_license_status",
      "slp_license_key",
      "slp_license_verified_at",
      "slp_license_exp",
    ]));
  };

  const rejectedReplies = [
    { status: 200, body: { valid: false, tier: "supporter" } },
    { status: 200, body: { valid: true, tier: "free" } },
    { status: 200, body: { valid: true } },
    { status: 401, body: { valid: true, tier: "supporter" } },
    { status: 404, body: { valid: true, tier: "supporter" } },
    { status: 429, body: { valid: false } },
    { status: 500, body: { valid: true, tier: "supporter" } },
    { status: 200, raw: "{" },
    { status: 0, abort: true },
  ];
  for (const reply of rejectedReplies) {
    licenseReply = reply;
    await resetFree();
    const state = await activateAndRead();
    assert.equal(state.slp_license_status, "free");
    assert.equal(await page.textContent("#licenseBadge"), "FREE");
  }

  const now = Date.now();
  await page.evaluate(async ({ now }) => chrome.storage.local.set({
    slp_license_status: "pro",
    slp_license_key: "ZOVO-ABCD-EFGH-IJKL-MNOP",
    slp_license_verified_at: now - 60_000,
    slp_license_exp: now + 60_000,
  }), { now });
  licenseReply = { status: 0, abort: true };
  await page.reload();
  assert.equal(await page.textContent("#licenseBadge"), "PRO");
  await activateAndRead();
  assert.equal(await page.textContent("#licenseBadge"), "PRO");

  for (const reply of [
    { status: 429, body: { valid: false } },
    { status: 500, body: { valid: false } },
    { status: 200, raw: "{" },
    { status: 0, abort: true },
  ]) {
    await page.evaluate(async ({ now }) => chrome.storage.local.set({
      slp_license_status: "pro",
      slp_license_key: "ZOVO-ABCD-EFGH-IJKL-MNOP",
      slp_license_verified_at: now - 60_000,
      slp_license_exp: now + 60_000,
    }), { now });
    licenseReply = reply;
    const state = await activateAndRead();
    assert.equal(state.slp_license_status, "pro");
    assert.equal(await page.textContent("#licenseBadge"), "PRO");
  }

  await page.evaluate(async ({ now }) => chrome.storage.local.set({
    slp_license_status: "pro",
    slp_license_key: "ZOVO-ABCD-EFGH-IJKL-MNOP",
    slp_license_verified_at: now - 60_000,
    slp_license_exp: now + 60_000,
  }), { now });
  licenseReply = { status: 404, body: { valid: false, error: "License key not found" } };
  assert.equal((await activateAndRead()).slp_license_status, "free");

  for (const verifiedAt of [now - 8 * 24 * 60 * 60 * 1000, now + 60_000]) {
    await page.evaluate(async ({ verifiedAt }) => chrome.storage.local.set({
      slp_license_status: "pro",
      slp_license_key: "ZOVO-ABCD-EFGH-IJKL-MNOP",
      slp_license_verified_at: verifiedAt,
      slp_license_exp: 0,
    }), { verifiedAt });
    await page.reload();
    assert.equal(await page.textContent("#licenseBadge"), "FREE");
  }

  licenseReply = { status: 200, body: { valid: true, tier: "lifetime", exp: 0 } };
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

  await page.evaluate(async () => chrome.storage.local.set({
    slp_license_status: "free",
    slp_license_key: "",
    slp_license_verified_at: 0,
    slp_license_exp: 0,
  }));
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.waitForSelector("#profileSelect");
  assert.equal(await page.locator("#profileSelect option").count(), 2);
  assert.equal(await page.locator("#profileSelect option", { hasText: "Podcast mode" }).count(), 0);

  await page.goto(`chrome-extension://${extensionId}/options/options.html`);
  const importCategorySelections = await page.evaluate(async () =>
    (await chrome.storage.sync.get("categorySelections")).categorySelections,
  );
  await page.setInputFiles("#importData", {
    name: "hostile-skiplist-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      format: "skiplist-personal-1",
      sync: { minutesSaved: 3, skipCount: 2, categorySelections: importCategorySelections },
      local: {
        slp_license_status: "pro",
        slp_license_key: "ZOVO-EVIL-EVIL-EVIL-EVIL",
        slp_license_verified_at: Date.now(),
        slp_license_exp: 0,
        unsubmittedSegments: {},
        skipProfiles: firstProfiles,
        podcastRules: podcast,
      },
    })),
  });
  await page.waitForFunction(() => document.querySelector("#licenseMessage")?.textContent === "Backup imported.");
  const importState = await page.evaluate(async () => ({
    local: await chrome.storage.local.get(["slp_license_status", "slp_license_key", "slp_license_verified_at"]),
    sync: await chrome.storage.sync.get(["minutesSaved", "skipCount"]),
  }));
  assert.equal(importState.local.slp_license_status, "free");
  assert.equal(importState.local.slp_license_key, "");
  assert.equal(importState.local.slp_license_verified_at, 0);
  assert.equal(importState.sync.minutesSaved, 3);
  assert.equal(importState.sync.skipCount, 2);

  await page.evaluate(async () => {
    await chrome.storage.sync.set({ minutesSaved: 91, skipCount: 92 });
    await chrome.storage.local.set({ podcastRules: {
      enabled: false,
      titlePattern: "sentinel",
      introSeconds: 1,
      outroSeconds: 2,
    } });
  });
  await page.setInputFiles("#importData", {
    name: "malformed-skiplist-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      format: "skiplist-personal-1",
      sync: { minutesSaved: 1, skipCount: 2, categorySelections: [] },
      local: {
        unsubmittedSegments: {},
        skipProfiles: { broken: null },
        podcastRules: { enabled: true, titlePattern: "x", introSeconds: 4, outroSeconds: 5 },
      },
    })),
  });
  await page.waitForFunction(() => document.querySelector("#licenseMessage")?.textContent === "That file is not a SkipList backup.");
  const rejectedImportState = await page.evaluate(async () => ({
    sync: await chrome.storage.sync.get(["minutesSaved", "skipCount"]),
    local: await chrome.storage.local.get("podcastRules"),
  }));
  assert.deepEqual(rejectedImportState.sync, { minutesSaved: 91, skipCount: 92 });
  assert.equal(rejectedImportState.local.podcastRules.titlePattern, "sentinel");

  const youtubeFixture = readFileSync(new URL("./fixtures/zsl-youtube.html", import.meta.url), "utf8");
  await page.route("https://www.youtube.com/**", async (route) => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: youtubeFixture,
  }));
  await page.evaluate(async () => chrome.storage.local.set({
    unsubmittedSegments: {
      qaSecret001: [{
        segment: [0.4, 1.2],
        UUID: "qa-cross-world-secret",
        category: "selfpromo",
        actionType: "skip",
        source: 1,
      }],
    },
  }));
  await page.goto("https://www.youtube.com/watch?v=qaActual001&case=bookmark");
  await page.waitForSelector("#startSegmentButton", { timeout: 12000 });
  await page.evaluate(() => window.postMessage({
    source: "sponsorblock",
    type: "data",
    videoID: "qaSecret001",
    isInline: false,
    isLive: false,
    isPremiere: false,
  }, "*"));
  await page.waitForTimeout(500);
  assert.equal(await page.locator('li.previewbar[sponsorblock-category="preview-selfpromo"]').count(), 0);

  console.log(`skiplist-runtime: PASS (extension ${extensionId}; assertions=${assertionCount})`);
} finally {
  await context.close();
}
