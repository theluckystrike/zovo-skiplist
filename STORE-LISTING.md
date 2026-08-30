# Chrome Web Store listing

## Metadata

- Title: **Zovo SkipList**
- Category: **Media & Video**
- Language: English
- Version: 1.0.0
- Homepage: https://zovo.one
- Support: https://zovo.one
- Privacy policy: https://zovo.one/privacy-policy
- Complete GPL source: https://github.com/theluckystrike/zovo-skiplist

## Short description

Save personal video skip points, apply category profiles, and track listening time saved.

## Detailed description

Build a private skip list for the videos you watch.

Zovo SkipList lets you mark the start and end of a section on supported YouTube videos, keep that bookmark in Chrome storage, and use it again without sending the mark to a community database.

Features:

- Personal skip bookmarks for intros, outros, sponsor reads, reminders, and self-promotion
- Category profiles with auto skip, ask first, or ignore behavior
- Podcast rules that trim a configurable intro and outro when a title or description matches
- Listening-time, skipped-section, and bookmark statistics
- JSON export and import for personal settings
- Light and dark interfaces

Privacy and scope:

- Runs only on supported YouTube pages
- Stores bookmarks, profiles, rules, and statistics in extension storage
- Does not read from or write to the SponsorBlock community API/database
- Makes a network request only when you choose to activate a Zovo license; that request contains the entered license key, not video or bookmark data

One category profile and personal bookmarks are free. A valid Zovo license unlocks multiple profiles and podcast rules. The complete extension source is GPL-3.0-or-later, so the paid interface is a distribution convenience rather than a restriction on your GPL rights.

Zovo SkipList is an independent modified fork of SponsorBlock. It is not affiliated with or endorsed by SponsorBlock or its maintainers. Upstream copyright and license notices are retained in the public source.

## Permission justifications

- **Storage:** saves personal bookmarks, profiles, podcast rules, statistics, and the local license cache.
- **YouTube host access:** loads the playback scheduler and personal bookmark controls on supported YouTube videos.
- **youtube-nocookie.com host access:** supports embedded privacy-enhanced YouTube playback.
- **zgubxqomnbmxgbdhvwja.supabase.co host access:** verifies a license only after the user presses Activate.

## Privacy questionnaire

- Personally identifiable information: No
- Health information: No
- Financial/payment information: No
- Authentication information: License key only, sent solely for user-triggered verification
- Personal communications: No
- Location: No
- Web history: No collection or transmission
- User activity: Personal skip/bookmark activity stays in Chrome extension storage
- Website content: Video metadata is examined locally only to match a podcast rule; it is not transmitted
- Remote code: No
- Data sale or advertising: No
- Single purpose: Create and apply personal skip points on supported videos

## Publication state

Local package and listing assets are ready. No Chrome Web Store draft was created or submitted because the launcher records all four developer accounts at their publish cap; a slot must be freed first.
