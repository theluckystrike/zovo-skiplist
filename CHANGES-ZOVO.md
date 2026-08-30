# Zovo SkipList changes

Copyright (C) 2026 Zovo.one contributors. Released under GPL-3.0-or-later.

This branch begins at SponsorBlock commit `16dd5604c989a3ee8eab86416cc5ad35ee4fd746` and retains its history, copyright notices, GPL license, scheduler, local segment editor, category model, and statistics core.

## Version 1.0.0 — 2026-08-30

- Rebranded the Chromium distribution as Zovo SkipList with original icon artwork and a distinct `slp-` UI/storage namespace.
- Replaced the upstream popup/options surfaces with accessible light/dark SkipList interfaces.
- Removed all SponsorBlock API/database reads, submissions, voting, and skip telemetry. Community lookups now resolve locally with no segments.
- Made the existing segment editor save personal bookmarks only in browser storage.
- Added named category auto-skip profiles, with one free profile and multiple profiles available after a valid license response.
- Added local podcast title/description matching with generated intro/outro segments routed through the upstream playback scheduler.
- Added listening-time, skip-count, bookmark-count, export, and import interfaces.
- Added `ZOVO-XXXX-XXXX-XXXX-XXXX` shape validation and Supabase verification. Any response with `valid: true` and a non-free tier grants access, including lifetime licenses; the client never requires `tier === "pro"`.
- Added a seven-day offline grace period after successful verification.
- Added mandatory build-time injection of the public Supabase anonymous key and rejection of secret/service-role key patterns.
- Narrowed MV3 permissions to `storage` and host access to YouTube playback plus the license verifier.
- Added runtime integration and source-policy gate tests.

No SponsorBlock community data or server code is distributed with this fork.
