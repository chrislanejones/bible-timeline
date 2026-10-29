# Bible Timeline

An interactive Bible atlas from **1100 BC to 1 BC**, connecting Samuel, the kings and prophets, the exile and return, and the Second Temple world leading into the New Testament.

**Hosted site:** [bible-timeline-atlas.netlify.app](https://bible-timeline-atlas.netlify.app)

The app contains **159 stories and 86 people or political tracks**. It runs from one HTML file, with no framework, account, external fonts, or runtime dependencies. The timeline works offline; opening Scripture and historical sources requires an internet connection.

## Latest update · October 29, 2026

- Grouped event markers keep crowded dates and stories sharing a year individually selectable.
- Phones start with a readable list of turning points, with search results beneath the search field and a dedicated story reader.
- A compact timeline overview, larger labels, and a bounded desktop sidebar make the atlas easier to scan.
- Keyboard navigation preserves focus through story changes, and closing the phone reader returns to its original control.
- Related rulers, prophets, and stories help connect events across the timeline.
- Local bookmarks and shareable links preserve stories and the current view.
- Six sourced stories and Huldah’s prophet track bring the atlas to 245 entries; the source table below documents the additions.

## Explore

- **Timeline:** start with a compact overview of turning points and kingdoms. Choose an era or zoom in to reveal prophets, rulers, and more stories. Numbered circles open groups of nearby events so crowded marks do not select the wrong story.
- **Story list:** read events in chronological order, filter to turning points, and optionally include people. Phones start here with turning points enabled. Both views are available on every screen size.
- **Search:** find names, places, descriptions, or Scripture references. Results appear directly beneath the search field and include hidden layers and other eras. Selecting a result enables its layer and brings its date into view.
- **Read:** select a story or person for its summary, date, rating where applicable, and original source link. On smaller screens, a reading panel opens above the current view. Close it to return to your place.
- **Connections:** expand “Who lived at the same time?” for rulers, prophets, leaders, and nearby stories. These relationships are calculated from approximate date overlap; they do not imply that two people met.
- **Saved:** bookmark stories locally in your browser. Bookmarks survive reloads when browser storage is available. They do not sync between devices; clearing site data removes them.
- **Share:** copy a view or story link that preserves the selected entry, date range, view, search, layers, and list filters. The app provides a selectable link if clipboard permission is unavailable. Use the hosted site for links that others can open.

The desktop sidebar and story list have bounded scrolling areas. Mobile reading supports large controls, wrapped titles, visible search results, and focus returning to the original control.

## Navigation

Choose an era, use the zoom buttons, drag the timeline sideways, or drag the navigator window and its edges. The visible year fields provide a precise alternative. BC years run from larger numbers on the left to smaller numbers on the right; the minimum window is 30 years.

On touchscreens, use one finger to pan horizontally or two fingers to pinch the chart. Vertical swipes scroll the page. A mouse wheel scrolls normally; **Ctrl + wheel over the chart** zooms.

| Key | Action |
| --- | --- |
| `+` / `-` | Zoom in / out |
| Left / right arrow | Pan earlier / later |
| Shift + arrow | Pan farther |
| `[` / `]` | Select the previous / next matching story |
| `F` | Fit the full timeline |
| `/` | Focus search |
| `?` | Toggle help |
| `Esc` | Close the reading panel, search results, or open controls |
| Tab, then arrows on the chart | Move between chart marks with one chart tab stop |
| Enter / Space on a mark | Read a story or open a group |
| Left / right arrow on a navigator handle | Adjust its date; Shift changes by 25 years |

Search accepts Arrow Down to enter its results and Enter to open the first match. Previous/Next retains keyboard focus. Native reading dialogs support Escape and contain keyboard focus while open.

## Run locally

Use Node.js 20 or newer and pnpm (the repository pins its package manager in `package.json`).

```bash
pnpm install
pnpm dev
```

Open [localhost:5173](http://localhost:5173). To use another port:

```bash
pnpm dev --port 5180
```

You can also open `ot-timeline.html` directly from disk. Browser restrictions may limit clipboard, history updates, or persistent storage for `file://` pages. The app falls back to manual link copying and in-memory bookmarks when necessary.

## Check, test, and build

```bash
pnpm run check
pnpm exec playwright install chromium
pnpm test
pnpm run build
```

- `check` validates JavaScript syntax, unique HTML IDs, token consistency, unique entry IDs and share keys, chronology ordering, date bounds, and source fields.
- `test` runs 15 Chromium browser regressions covering event targets (including stories sharing a year), keyboard focus, phone search and reading, related stories, bookmarks, URL restoration, fallback states, responsive layouts, emulated touch pan/pinch, and standalone offline use. The tests start a local server on port 5174. Touch emulation does not replace testing on physical phones or in Safari.
- `build` runs checks and writes the standalone site to `dist/`. Browser tests are a separate step.

To use an existing Chromium installation instead of Playwright’s downloaded browser:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test
```

`netlify.toml` runs `pnpm run build` and publishes `dist/`. Local changes are not live until deployed.

## Dates, ratings, and sources

Dates follow a conventional chronology of the monarchy. Reigns and co-regencies are simplified, and prophet tracks show approximate activity rather than lifespans. Events with uncertain dates are marked **c.** for “circa.” Some narrative dates are illustrative placements rather than dates explicitly supplied by Scripture.

King ratings summarize the biblical assessment, with notes for mixed reigns and repentance. Blue indicates faithfulness, red indicates unfaithfulness, and amber indicates mixed conduct. A faithful rating does not imply a flawless life. Grouped rulers use a neutral color; select or zoom into the group to see individual ratings. Prophets use green; later historical tracks use purple without the king-rating scale.

The app distinguishes biblical narratives from later historical context. Biblical collections differ: 1–2 Maccabees and Sirach belong to Catholic and many Orthodox Old Testaments, but not the Jewish Tanakh or most Protestant Old Testaments. “Between the Testaments” does not mean Jewish history or writing stopped. Expand **Dates, sources & king ratings** in the app for more context and chronology references.

The latest additions fill narrative gaps and link to these passages:

| Added story | Illustrative placement | Source |
| --- | --- | --- |
| Samuel addresses Israel and its king | c. 1045 BC | [1 Samuel 12](https://bible.usccb.org/bible/1samuel/12) |
| Assyria resettles the cities of Samaria | c. 720 BC | [2 Kings 17:24–41](https://bible.usccb.org/bible/2kings/17) |
| Huldah speaks to Josiah’s officials | c. 622 BC | [2 Kings 22:14–20](https://bible.usccb.org/bible/2kings/22) |
| Jeremiah promises a new covenant | c. 587 BC | [Jeremiah 31:31–34](https://bible.usccb.org/bible/jeremiah/31) |
| Gedaliah is killed; survivors flee to Egypt | c. 586 BC | [2 Kings 25:22–26](https://bible.usccb.org/bible/2kings/25) |
| Jehoiachin is released from prison | c. 561 BC | [2 Kings 25:27–30](https://bible.usccb.org/bible/2kings/25) |

Huldah also appears among the prophetic voices. Her short track marks the recorded consultation, not her lifetime. The added passages support the narratives; the plotted years remain explicitly approximate.

## Project files

| File | Purpose |
| --- | --- |
| `ot-timeline.html` | Standalone markup, styling, data, and interactive code |
| `tokens.css` | Design tokens, also embedded in the HTML for offline use |
| `scripts/check.mjs` | Static and timeline data checks |
| `scripts/serve.mjs` | Local HTTP server |
| `scripts/build.mjs` | Copies the deployable site into `dist/` |
| `tests/timeline.spec.mjs` | Browser regression tests |
| `playwright.config.mjs` | Test server and browser configuration |
| `PRODUCT.md`, `DESIGN.md` | Product direction and visual conventions |
| `original/` | Preserved early version |

When editing colors or type tokens, update `tokens.css` and the identical embedded block in `ot-timeline.html`. Each new entry needs a name, dates, summary, and reference. URLs and bookmarks use keys derived from entry kind, lane, and name rather than array position: reordering data is safe, but renaming an entry changes its key. Run checks and browser tests before deploying.
