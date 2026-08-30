# Zovo SkipList

Zovo SkipList is a GPL-3.0-or-later personal video-skip tool for Chromium. It preserves SponsorBlock's proven playback scheduler and segment editor, but deliberately does **not** connect to SponsorBlock's community API or database. Personal skip bookmarks, category profiles, podcast intro/outro rules, and listening-time statistics remain in browser storage.

This is a modified fork of [ajayyy/SponsorBlock](https://github.com/ajayyy/SponsorBlock) at upstream commit `16dd5604c989a3ee8eab86416cc5ad35ee4fd746`. SponsorBlock's API/database is separately licensed CC BY-NC-SA 4.0; that noncommercial dataset is not included or used. See [CHANGES-ZOVO.md](CHANGES-ZOVO.md), [BASELINE-REPORT.md](BASELINE-REPORT.md), and [TECHNICAL-BRIEF.md](TECHNICAL-BRIEF.md).

Build with Node.js 20+:

```sh
npm install
npm run build
```

The extension output is `dist/`. The build requires a Supabase publishable anonymous key and the checked-in build script supplies Zovo's public verifier key. No secret/service-role key belongs in the extension.

The complete fork, including paid-feature UI, is licensed GPL-3.0-or-later. The Pro gate is a distribution convenience, not a technical restriction: anyone may modify and rebuild the source under the GPL.

---

## Upstream SponsorBlock README (preserved)

<p align="center">
  <a href="https://sponsor.ajay.app"><img src="public/icons/LogoSponsorBlocker256px.png" alt="Logo"></img></a>

  <br/>
  <sub>Logo by <a href="https://github.com/munadikieh">@munadikieh</a></sub>
</p>

<h1 align="center">SponsorBlock</h1>

<p align="center">
  <b>Download:</b>
  <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone">Chrome/Chromium</a> |
  <a href="https://addons.mozilla.org/addon/sponsorblock/?src=external-github">Firefox</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/Android">Android</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/Edge">Edge</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/Safari">Safari for MacOS and iOS</a> |
  <a href="https://sponsor.ajay.app">Website</a> |
  <a href="https://sponsor.ajay.app/stats">Stats</a>
</p>

<p align="center">
  <b>3rd-Party Ports:</b>
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/3rd-Party-Ports#mpv-media-player">MPV</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/3rd-Party-Ports#kodi">Kodi</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/3rd-Party-Ports#Chromecast">Chromecast</a> |
  <a href="https://github.com/ajayyy/SponsorBlock/wiki/3rd-Party-Ports#ios">iOS</a>
</p>

<p align="center">
    <a href="https://addons.mozilla.org/addon/sponsorblock/?src=external-github"><img src="https://img.shields.io/amo/users/sponsorblock?label=Firefox%20Users" alt="Badge"></img></a>
    <a href="https://chrome.google.com/webstore/detail/mnjggcdmjocbbbhaepdhchncahnbgone"><img src="https://img.shields.io/chrome-web-store/users/mnjggcdmjocbbbhaepdhchncahnbgone?label=Chrome%20Users" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Submissions&query=totalSubmissions&suffix=%20segments&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkred" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Active%20Users&query=apiUsers&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetTotalStats&color=darkblue" alt="Badge"></img></a>
    <a href="https://sponsor.ajay.app/stats"><img src="https://img.shields.io/badge/dynamic/json?label=Time%20Saved%20From%20Skips&query=daysSaved&url=http%3A%2F%2Fsponsor.ajay.app%2Fapi%2FgetDaysSavedFormatted&color=darkgreen&suffix=%20days" alt="Badge"></img></a>
</p>



SponsorBlock is an open-source crowdsourced browser extension to skip sponsor segments in YouTube videos. Users submit when a sponsor happens from the extension, and the extension automatically skips sponsors it knows about. It also supports skipping other categories, such as intros, outros and reminders to subscribe.

It also supports Invidious.

**Translate:** [![Crowdin](https://badges.crowdin.net/sponsorblock/localized.svg)](https://crowdin.com/project/sponsorblock)

# Important Links

See the [Wiki](https://github.com/ajayyy/SponsorBlock/wiki) for important links.

# Server

The backend server code is available here: https://github.com/ajayyy/SponsorBlockServer

To make sure that this project doesn't die, I have made the database publicly downloadable at https://sponsor.ajay.app/database ([License](https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License)). If you are planning on using the database in another project, please read the [API Docs](https://wiki.sponsor.ajay.app/index.php/API_Docs) page for more information.

The dataset and API are now being used in some [ports](https://github.com/ajayyy/SponsorBlock/wiki/3rd-Party-Ports) as well as a [neural network](https://github.com/andrewzlee/NeuralBlock).

# API

You can read the API docs [here](https://wiki.sponsor.ajay.app/w/API_Docs).

# Building
See [CONTRIBUTING.md](CONTRIBUTING.md)

# Credit

The awesome [Invidious API](https://docs.invidious.io/) was previously used, and the server is now using [NewLeaf](https://git.sr.ht/~cadence/NewLeaf) to get video info from YouTube.

Originally forked from [YTSponsorSkip](https://github.com/NDevTK/YTSponsorSkip), but very little code remains.

Icons made by:
* <a href="https://www.flaticon.com/authors/gregor-cresnar" title="Gregor Cresnar">Gregor Cresnar</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="https://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
* <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> and are licensed by <a href="https://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
* <a href="https://iconmonstr.com/about/#creator">Alexander Kahlkopf</a> from <a href="https://iconmonstr.com/">iconmonstr.com</a> and are licensed by <a href="https://iconmonstr.com/license/">iconmonstr License</a>


### License

This project is licensed under GNU GPL v3 or any later version
