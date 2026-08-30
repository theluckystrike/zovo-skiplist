# Upstream baseline and gate report

Date: 2026-08-30  
Upstream: `ajayyy/SponsorBlock`  
Commit: `16dd5604c989a3ee8eab86416cc5ad35ee4fd746`

## Unmodified build

The originally staged iCloud clone contained dataless files, so it could not provide a trustworthy build. A fresh clone of the official repository at the same current `master` commit was created at `zovo-skiplist-upstream-baseline`, including submodules.

Commands:

```sh
cp config.json.example config.json
npm install
npm run build
```

Result: PASS. Webpack produced `dist/`. npm reported 39 dependency advisories (2 low, 14 moderate, 20 high, 3 critical); these are recorded upstream dependency debt rather than a hidden baseline patch.

Chrome-for-Testing loaded the unmodified MV3 output successfully with extension ID `blfneendagbpmghhcamcbpfmplicbnae`. Popup/options captures were recorded under `engine/7-design/shots/zovo-skiplist-upstream-baseline/baseline/` in light and dark modes.

## MV3 gate

The launcher description was stale: current upstream is already Manifest V3. Its Chromium manifest declares `manifest_version: 3`, an MV3 service worker, static content scripts, and the scripting API. Port cost at current HEAD was therefore zero. The fork further removed the unused scripting permission.

## Database/API license gate

SponsorBlock's official database/API license is CC BY-NC-SA 4.0 unless separate written permission is granted. A paid Zovo-packaged fork cannot safely use that noncommercial resource as scored.

**Verdict: DO-NOT-BUILD-AS-SCORED.** The shipped result is the explicitly permitted fallback: a personal-bookmarks-only product independent of the SponsorBlock community database and API.

The upstream client identifies itself to the API using `${chrome.runtime.id}/v${version}` as `X-CLIENT-NAME`, and submission payloads include a user-agent value. Zovo SkipList makes none of those community requests.

Authoritative references:

- https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License
- https://github.com/ajayyy/SponsorBlock/wiki/API-Docs
- https://github.com/ajayyy/SponsorBlockServer
