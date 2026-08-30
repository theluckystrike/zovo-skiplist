# Technical brief

## Product boundary

Zovo SkipList has one purpose: create and apply personal skip points while playing supported YouTube videos. It does not discover or share community segments.

## Architecture

- Manifest V3 service worker and static YouTube content scripts.
- SponsorBlock's proven content scheduler handles seeks, notices, segment timing, and time-saved accounting.
- Personal segments remain in `chrome.storage.local` through the upstream `unsubmittedSegments` structure and are never submitted. Category settings and aggregate skip/time counters use `chrome.storage.sync`, which Chrome may synchronize through the user's signed-in Chrome profile.
- Category profiles use the upstream `categorySelections` model; temporary activation uses the unique `slp-profile-*` namespace.
- Podcast rules synthesize local `intro` and `outro` segments after title/description matching, then pass them into the same scheduler.
- Popup and options are CSP-safe local HTML/CSS/TypeScript bundles with no remote code.

## Network behavior

License activation and periodic entitlement maintenance can make an extension-origin request to Zovo's Supabase Edge Function. Video and channel metadata are read from the current YouTube page; SkipList does not make a separate metadata lookup. Playback, bookmarks, profiles, podcast rules, statistics, export, and import otherwise work locally. No SponsorBlock host permission or community API endpoint is present.

## License verification

The UI shape-checks `ZOVO-XXXX-XXXX-XXXX-XXXX`, sends the key to the verifier with a build-injected public anonymous key, and grants only for a successful HTTP response where `valid === true` and `tier` is exactly `pro` or `lifetime`. Successful verification is cached for seven days for offline use and refresh is attempted after six days. An `exp` value of zero means the verifier supplied no separate server expiry; it does not bypass the seven-day verification window. Missing, expired, or future-dated cache fields fail closed. Authoritative invalid-key responses clear the cache, while timeouts, malformed responses, 429s, and server failures preserve only an otherwise-current cache. Secret/service-role credentials are prohibited by build and compliance gates.

## Permissions

- `storage`: bookmarks, profiles, podcast rules, statistics, and license cache.
- `https://*.youtube.com/*` and `https://www.youtube-nocookie.com/*`: playback content scripts.
- `https://zgubxqomnbmxgbdhvwja.supabase.co/*`: activation and periodic maintenance of a cached license entitlement.

## Verification

- Unmodified upstream build and Chrome load: pass.
- Fork production build and MV3 Chrome load: pass.
- Runtime integration: service worker, popup, toggle, profile limit, lifetime-license grant, podcast rules, and multiple-profile unlock pass.
- Upstream Jest regression suite: 4 suites / 42 tests pass; 1 suite/test remains upstream-skipped.
- Compliance scan: CLEAN, 0 violations.
- Fleet divergence: `ready: true`, no blocks/warnings/fixes.
- Independent final design score: 9.2/10 after light/dark popup/options iteration.
