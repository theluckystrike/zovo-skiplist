# Chrome Web Store listing

## Metadata

- Title: **Zovo SkipList**
- Category: **Entertainment**
- Language: English
- Version: 1.0.1
- Homepage: https://zovo.one
- Support: https://zovo.one
- Privacy policy: https://github.com/theluckystrike/zovo-skiplist/blob/main/PRIVACY.md
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
- Stores bookmarks, profiles, rules, and the license cache in local extension storage; category settings and aggregate skip/time counters may sync through the user's Chrome profile
- Does not read from or write to the SponsorBlock community API/database
- Reads video and channel metadata already available on the open YouTube page; it does not make separate metadata lookup requests
- Sends the license key to Zovo's Supabase verifier when you press Activate and periodically after six days to maintain an activated entitlement; no video, bookmark, profile, rule, or listening statistic is included

One category profile and personal bookmarks are free. A valid Zovo license unlocks multiple profiles and podcast rules. The complete extension source is GPL-3.0-or-later, so the paid interface is a distribution convenience rather than a restriction on your GPL rights.

Zovo SkipList is an independent modified fork of SponsorBlock. It is not affiliated with or endorsed by SponsorBlock or its maintainers. Upstream copyright and license notices are retained in the public source.

## Permission justifications

- **Storage:** saves personal bookmarks, profiles, podcast rules, and the license cache locally; category settings and aggregate statistics may use Chrome Sync.
- **YouTube host access:** loads the playback scheduler and personal bookmark controls on supported YouTube videos.
- **youtube-nocookie.com host access:** supports embedded privacy-enhanced YouTube playback.
- **zgubxqomnbmxgbdhvwja.supabase.co host access:** verifies a license after activation and periodically maintains its seven-day cached entitlement.

## Privacy questionnaire

- Personally identifiable information: No
- Health information: No
- Financial/payment information: No
- Authentication information: Yes — the license key is sent to Zovo's Supabase verifier after activation and periodically to maintain the cached entitlement
- Personal communications: No
- Location: No
- Web history: Yes — YouTube video IDs are associated with personal bookmarks and stored in local Chrome extension storage; they are not sent to Zovo
- User activity: Yes — personal skip marks are stored locally; aggregate skip/time counters may use Chrome Sync. Neither is sent to Zovo
- Website content: Yes — video title, description, and channel metadata already present on the open page are processed locally for podcast rules
- Remote code: No
- Data sale or advertising: No
- Single purpose: Create and apply personal skip points on supported videos
