# Bible Timeline

An interactive Bible atlas from **Genesis to the eve of Matthew**. It connects the beginnings, the patriarchs, the exodus and conquest, the judges, Samuel, the kings and prophets, the exile and return, and the Second Temple world leading into the New Testament.

**Hosted site:** [bible-timeline-atlas.netlify.app](https://bible-timeline-atlas.netlify.app)

The app contains **213 stories and 105 people or political tracks** on an axis from 2200 BC to 1 BC. It runs from one HTML file, with no framework, account, external fonts, or runtime dependencies. The timeline works offline; opening Scripture and historical sources requires an internet connection.

## Latest update · November 13, 2026

- The timeline now starts at Genesis. Fifty-four new stories and nineteen new tracks cover the beginnings, the patriarchs, the exodus, the conquest, and the judges.
- Genesis 1–11 and Job appear as one **undated** group at the start of the axis. They are never given a year.
- A **Kings** toggle shows all rulers, or only the good, mixed, or bad ones.
- The sidebar and its “Stories in this view” list are gone, so the chart uses the full width. The selected story opens in a **floating card** beside its mark.
- Hovering a mark previews its name, date, and rating.
- The navigator stays pinned to the bottom of wide screens.
- Egypt, Assyria, and Babylon fill the earlier gaps in the ruling-powers lane.

## Explore

- **Timeline:** start with a compact overview of turning points, the people before the kings, the kingdoms, and the ruling powers. Choose an era or zoom in to reveal prophets, individual rulers, and more stories. Numbered circles open groups of nearby events so crowded marks do not select the wrong story.
- **Undated beginnings:** the dashed circle at the left edge holds Genesis 1–11 and Job in the Bible’s own order. It is visible whenever the view includes the start of the timeline.
- **Kings toggle:** choose All, Good, Mixed, or Bad to filter the kings of the united kingdom, Israel, and Judah. Prophets, stories, and other tracks are unchanged. Choosing a hidden king from search switches back to All.
- **Story card:** on a wide screen, selecting a mark opens its summary, date, rating, and source link in a card beside the mark. Drag the card’s top bar to move it. Hide it with its button or with Esc while focus is inside it. When the selected story leaves the view, the card is replaced by a button that brings the story back.
- **Hover preview:** resting the mouse on a mark shows its name and date without selecting it.
- **Story list:** read events in chronological order, filter to turning points, and optionally include people. Phones start here with turning points enabled. Both views are available on every screen size. The list opens stories in a reading panel.
- **Search:** find names, places, descriptions, or Scripture references. Results appear directly beneath the search field and include hidden layers and other eras. Selecting a result enables its layer and brings its date into view.
- **Read:** on smaller screens, and from the story list or saved view, a reading panel opens above the current view. Close it to return to your place.
- **Connections:** expand “Who lived at the same time?” for rulers, prophets, patriarchs, judges, and nearby stories. These relationships are calculated from approximate date overlap; they do not imply that two people met.
- **Saved:** bookmark stories locally in your browser. Bookmarks survive reloads when browser storage is available. They do not sync between devices; clearing site data removes them.
- **Share:** copy a view or story link that preserves the selected entry, date range, view, search, layers, kings filter, and list filters. The app provides a selectable link if clipboard permission is unavailable. Use the hosted site for links that others can open. Links made before the timeline reached Genesis still open at the range they recorded.

## Navigation

Choose an era, use the zoom buttons, drag the timeline sideways, or drag the navigator window and its edges. The visible year fields provide a precise alternative. BC years run from larger numbers on the left to smaller numbers on the right; the minimum window is 30 years. On wide screens the navigator stays pinned to the bottom of the window.

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
| `Esc` | Close the reading panel, search results, or open controls; inside the story card, hide it |
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

- `check` validates JavaScript syntax, unique HTML IDs, element lookups, token consistency, unique entry IDs and share keys, chronology ordering, date bounds, lanes, ratings, era buttons and their ranges, default stories, undated placement, and source fields.
- `test` runs 20 Chromium browser regressions covering event targets (including stories sharing a year), keyboard focus, phone search and reading, related stories, bookmarks, URL restoration, fallback states, responsive layouts, emulated touch pan/pinch, standalone offline use, the Genesis-to-Matthew range and undated group, the kings toggle, the floating card, and hover previews. The tests start a local server on port 5174. Touch emulation does not replace testing on physical phones or in Safari.
- `build` runs checks and writes the standalone site to `dist/`. Browser tests are a separate step.

To use an existing Chromium installation instead of Playwright’s downloaded browser:

```bash
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium pnpm test
```

`netlify.toml` runs `pnpm run build` and publishes `dist/`. Local changes are not live until deployed.

## Dates, ratings, and sources

Genesis 1–11 and Job give no dates, so the atlas shows them as an undated group and never assigns them a year. Dates from Abraham to the judges follow the conventional “early” chronology: the exodus about 1446 BC, 430 years in Egypt before it, and the ages Genesis gives for the patriarchs. Many historians place the exodus later, about 1260 BC, or regard the patriarchal dates as unrecoverable. The judges’ tracks follow the years of rest and rule stated in Judges, placed illustratively. These dates organize the stories; they do not settle those debates.

From Samuel onward, dates follow a conventional chronology of the monarchy. Reigns and co-regencies are simplified, and prophet tracks show approximate activity rather than lifespans. Events with uncertain dates are marked **c.** for “circa.” Some narrative dates are illustrative placements rather than dates explicitly supplied by Scripture.

King ratings summarize the biblical assessment, with notes for mixed reigns and repentance. Blue indicates faithfulness, red indicates unfaithfulness, and amber indicates mixed conduct. A faithful rating does not imply a flawless life. Grouped rulers use a neutral color; select or zoom into the group to see individual ratings. Prophets use green; ruling powers and later historical tracks use purple without the king-rating scale. The Kings toggle groups the seven rating levels into good (above mixed), mixed, and bad (below mixed).

The app distinguishes biblical narratives from later historical context. Biblical collections differ: 1–2 Maccabees and Sirach belong to Catholic and many Orthodox Old Testaments, but not the Jewish Tanakh or most Protestant Old Testaments. “Between the Testaments” does not mean Jewish history or writing stopped. Expand **Dates, sources & king ratings** in the app for more context and chronology references.

Every Genesis-to-Judges entry cites its Scripture passage and opens it through the same passage link as the earlier entries. No new external sources were added for them.

An earlier update filled narrative gaps and links to these passages:

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

When editing colors or type tokens, update `tokens.css` and the identical embedded block in `ot-timeline.html`. Each new entry needs a name, dates, summary, and reference. An undated story belongs in `undatedEvents`, in canonical order; `check` rejects a dated story placed on the first year of the axis. URLs and bookmarks use keys derived from entry kind, lane, and name rather than array position: reordering data is safe, but renaming an entry changes its key. Run checks and browser tests before deploying.
