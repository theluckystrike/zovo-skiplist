# Privacy disclosure

Zovo SkipList stores personal bookmarks, the associated YouTube video IDs, category profiles, podcast rules, listening-time statistics, and a cached license result in Chrome extension storage. Bookmarks, profiles, podcast rules, and the cached license are kept in local extension storage. Category settings and aggregate skip/time counters use Chrome synchronized extension storage and may be synchronized by Chrome through the user's signed-in browser profile. Zovo does not receive that Chrome Sync data. A successfully activated license key is retained in local extension storage so the extension can apply the verified entitlement.

The extension reads video title, description, channel, duration, and playback state already available on supported YouTube pages to create bookmarks and apply podcast rules. Zovo SkipList does not make separate oEmbed or youtubei metadata requests.

SkipList does not sell data, use analytics, transmit bookmark or listening history to Zovo, or read from or write to the SponsorBlock community database. When the user presses Activate, and periodically after six days to maintain an activated entitlement, the extension sends the retained license key and the product identifier `skiplist` to Zovo's Supabase verification function over HTTPS. It does not include a video URL, video ID, title, bookmark, profile, podcast rule, or listening statistic. Like ordinary HTTPS services, the verifier's infrastructure may receive network metadata such as IP address and user agent. A cached entitlement fails closed after seven days without successful verification.

Users can export or import their personal settings and remove all stored data by uninstalling the extension or clearing its extension storage.
