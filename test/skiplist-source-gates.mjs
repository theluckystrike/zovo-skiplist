import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const manifest = JSON.parse(read("dist/manifest.json"));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.background.service_worker, "./js/background.js");
assert(manifest.host_permissions.some((host) => host.includes("youtube.com")));
assert(manifest.host_permissions.some((host) => host.includes("supabase.co")));
assert(!manifest.host_permissions.some((host) => host.includes("sponsor.ajay.app")));

const segmentData = read("src/utils/segmentData.ts");
assert(!segmentData.includes("/api/"));
assert.match(segmentData, /segments:\s*null/);

const content = read("src/content.ts");
assert.match(content, /applyPodcastRules/);
assert.match(content, /slp-podcast-intro/);
assert.match(content, /Config\.local\.unsubmittedSegments\[getVideoID\(\)\] = sponsorTimesSubmitting/);
assert(!content.includes('"POST", "/api/viewedVideoSponsorTime'));
assert(!content.includes('"POST", "/api/skipSegments"'));

const options = read("src/skiplist-ui/options.ts");
assert.match(options, /data\.valid === true && data\.tier !== "free"/);
assert(!options.includes('data.tier === "pro"'));
assert.match(options, /KEY_PATTERN/);

const webpack = read("webpack/webpack.common.js");
assert.match(webpack, /SUPABASE_ANON_KEY must be set at build time/);
console.log("skiplist-source-gates: PASS");
