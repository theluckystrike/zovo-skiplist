import strictAssert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
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
const manifest = JSON.parse(read("dist/manifest.json"));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.background.service_worker, "./js/background.js");
assert.equal(manifest.version, "1.0.1");
assert.deepEqual(manifest.permissions, ["storage"]);
assert(manifest.host_permissions.some((host) => host.includes("youtube.com")));
assert(manifest.host_permissions.some((host) => host.includes("supabase.co")));
assert(!manifest.host_permissions.some((host) => host.includes("sponsor.ajay.app")));
assert.equal(read("dist/LICENSE").includes("GNU GENERAL PUBLIC LICENSE"), true);

const segmentData = read("src/utils/segmentData.ts");
assert(!segmentData.includes("/api/"));
assert.match(segmentData, /segments:\s*null/);

const content = read("src/content.ts");
assert.match(content, /applyPodcastRules/);
assert.match(content, /slp-podcast-intro/);
assert.match(content, /await waitFor\(\(\) => \{[\s\S]{0,300}getVideoDuration\(\)[\s\S]{0,300}3000, 20\)/);
assert.match(content, /podcastPattern\.test\(title\) \|\| podcastPattern\.test\(description\)/);
assert.match(content, /Config\.local\.unsubmittedSegments\[getVideoID\(\)\] = sponsorTimesSubmitting/);
assert(!content.includes("data-zsl-podcast-debug"));
assert(!content.includes("asyncRequestToServer"));
assert(!content.includes("/api/"));
const shouldAutoBlock = content.slice(
    content.indexOf("function shouldAutoSkip"),
    content.indexOf("function shouldSkip"),
);
assert(!shouldAutoBlock.includes("sponsorTimesSubmitting"));
assert(!content.includes("if ((shouldSkip(currentSkip)"));
assert.match(content, /if \(autoSkip\) sendTelemetryAndCount/);
assert.match(content, /countedSegmentKeys/);
assert.match(content, /openNotice: true/);

const background = read("src/background.ts");
assert(!background.includes("setupBackgroundRequestProxy"));
assert(!background.includes("sendRealRequestToCustomServer"));
assert(!background.includes("submitVote"));
assert(!background.includes("injectUpdatedScripts"));
assert(!background.includes("chrome.scripting"));
assert(!background.includes("onMessageExternal"));
assert(!background.includes("generateUserID"));
assert.match(background, /chrome\.tabs\.sendMessage[\s\S]{0,500}void chrome\.runtime\.lastError/);

const video = read("maze-utils/src/video.ts");
assert(!video.includes("getUcidFromVideo"));
assert(!video.includes("getChannelNameFromVideo"));
assert(!video.includes("setupMetadataOnRecieve"));
assert.match(video, /event\.source !== window/);
assert.match(video, /data\.videoID !== urlVideoID/);

const options = read("src/skiplist-ui/options.ts");
assert.match(options, /isProLicenseResponse\(response\.ok, data\)/);
assert.match(options, /KEY_PATTERN/);
assert.match(options, /profileSelfpromo/);
assert(!options.includes("Authorization:"));
assert.match(options, /sanitizeBackup\(JSON\.parse/);
assert.match(options, /set\(chrome\.storage\.sync, data\.sync\)/);
assert.match(options, /set\(chrome\.storage\.local, data\.local\)/);

const profiles = read("src/utils/skipProfiles.ts");
assert(!profiles.includes("Date.now() - 60 * 60 * 1000"));
assert.match(profiles, /isProfileEntitled/);

const config = read("src/config.ts");
for (const category of ["selfpromo", "interaction", "intro", "outro"]) {
    assert.match(config, new RegExp(`name: "${category}"[\\s\\S]{0,100}CategorySkipOption.AutoSkip`));
}

const license = read("src/skiplist/license.ts");
assert.match(license, /record\.valid === true/);
assert.match(license, /PRO_TIERS\.includes/);
assert.match(license, /verifiedAt <= now/);
assert.match(license, /expiry >= now/);

const backup = read("src/skiplist/backup.ts");
assert.match(backup, /sanitizeBackup/);
assert.match(backup, /Number\.isFinite/);
assert.match(backup, /Object\.getPrototypeOf/);

assert.match(background, /LICENSE_RETRY_DELAY_MS/);
assert.match(background, /lastRefreshAttemptAt/);

const help = read("public/help/index.html");
assert.match(help, /Your private video skip list is ready/);
assert(!help.includes("sponsor.ajay.app"));
assert(!help.includes("discord"));
assert(!help.includes("donat"));
assert(!help.includes("only when you press Activate"));
assert(!help.includes("metadata may be requested"));
assert.match(help, /periodically[\s\S]{0,80}six days/);

const webpack = read("webpack/webpack.common.js");
assert.match(webpack, /SUPABASE_ANON_KEY must be set at build time/);
assert(!webpack.includes("srcDir + 'options.ts'"));
assert(!webpack.includes("srcDir + 'help.ts'"));
assert(!webpack.includes("srcDir + 'permissions.ts'"));
console.log(`skiplist-source-gates: PASS (assertions=${assertionCount})`);
