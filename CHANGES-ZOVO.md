# Zovo SkipList changes

Copyright (C) 2026 Zovo.one contributors. Released under GPL-3.0-or-later.

This branch begins at SponsorBlock commit `16dd5604c989a3ee8eab86416cc5ad35ee4fd746` and retains its history, copyright notices, GPL license, scheduler, local segment editor, category model, and statistics core.

## Version 1.0.1 — 2026-08-30

- Made personal bookmarks obey category-profile Auto, Ask first, and Ignore selections instead of always auto-skipping.
- Counted personal skips exactly once per video by stable segment UUID and credited only the playback time actually avoided.
- Restarted active schedules when profile or entitlement state changes.
- Enforced podcast-rule entitlement in the content runtime and made invalid regular expressions fail closed.
- Hardened license verification against non-2xx responses, missing tiers, malformed/future caches, and expired grace periods.
- Removed executable community proxy, vote, locked-category, promotion, and update-injection paths.
- Replaced upstream first-install help with local Zovo onboarding and limited it to fresh installs.
- Added the GPL license to the binary package, reduced packaged locale/bundle residue, and repaired the complete-source archive process.
- Corrected Chrome Web Store category and privacy disclosures, including local video-ID storage and YouTube metadata fallbacks.

## Version 1.0.0 — 2026-08-30

- Rebranded the Chromium distribution as Zovo SkipList with original icon artwork and a distinct `slp-` UI/storage namespace.
- Replaced the upstream popup/options surfaces with accessible light/dark SkipList interfaces.
- Removed all SponsorBlock API/database reads, submissions, voting, and skip telemetry. Community lookups now resolve locally with no segments.
- Made the existing segment editor save personal bookmarks only in browser storage.
- Added named category auto-skip profiles, with one free profile and multiple profiles available after a valid license response.
- Added local podcast title/description matching with generated intro/outro segments routed through the upstream playback scheduler.
- Added listening-time, skip-count, bookmark-count, export, and import interfaces.
- Added `ZOVO-XXXX-XXXX-XXXX-XXXX` shape validation and Supabase verification. A successful response grants access only when `valid: true` and `tier` is exactly `pro` or `lifetime`.
- Added a seven-day fail-closed offline grace period with periodic refresh after six days; transient verifier failures preserve only a current cache.
- Added mandatory build-time injection of the public Supabase anonymous key and rejection of secret/service-role key patterns.
- Narrowed MV3 permissions to `storage` and host access to YouTube playback plus the license verifier.
- Added runtime integration and source-policy gate tests.

No SponsorBlock community data or server code is distributed with this fork.
