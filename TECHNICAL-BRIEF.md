# Technical brief

## Product boundary

Zovo SkipList has one purpose: create and apply personal skip points while playing supported YouTube videos. It does not discover or share community segments.

## Architecture

- Manifest V3 service worker and static YouTube content scripts.
- SponsorBlock's proven content scheduler handles seeks, notices, segment timing, and time-saved accounting.
- Personal segments remain in `chrome.storage.local` through the upstream `unsubmittedSegments` structure and are never submitted.
- Category profiles use the upstream `categorySelections` model; temporary activation uses the unique `slp-profile-*` namespace.
- Podcast rules synthesize local `intro` and `outro` segments after title/description matching, then pass them into the same scheduler.
- Popup and options are CSP-safe local HTML/CSS/TypeScript bundles with no remote code.

## Network behavior

Only the license activation button can make an extension-origin request, to Zovo's Supabase Edge Function. Playback, bookmarks, profiles, podcast rules, statistics, export, and import work locally. YouTube remains the supported content-script host. No SponsorBlock host permission or API endpoint is present.

## License verification

The UI shape-checks `ZOVO-XXXX-XXXX-XXXX-XXXX`, sends the key to the verifier with a build-injected public anonymous key, and grants when `valid === true && tier !== "free"`. Successful verification is cached for seven days for offline use. Secret/service-role credentials are prohibited by build and compliance gates.

## Permissions

- `storage`: bookmarks, profiles, podcast rules, statistics, and license cache.
- `https://*.youtube.com/*` and `https://www.youtube-nocookie.com/*`: playback content scripts.
- `https://zgubxqomnbmxgbdhvwja.supabase.co/*`: user-triggered license verification only.

## Verification

- Unmodified upstream build and Chrome load: pass.
- Fork production build and MV3 Chrome load: pass.
- Runtime integration: service worker, popup, toggle, profile limit, lifetime-license grant, podcast rules, and multiple-profile unlock pass.
- Upstream Jest regression suite: 3 suites / 27 tests pass; 1 suite/test remains upstream-skipped.
- Compliance scan: CLEAN, 0 violations.
- Fleet divergence: `ready: true`, no blocks/warnings/fixes.
- Independent final design score: 9.2/10 after light/dark popup/options iteration.
