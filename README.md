# Bible Timeline

**Live:** https://bible-timeline-atlas.netlify.app

An interactive timeline of the Old Testament, from Samuel through the Second Temple period to the New Testament. Kings, prophets, and key events sit on one chart, and you can zoom and pan through about 1,100 years.

It's a single HTML file. No framework, no build step to run it, and it works offline.

## What you can do

- Zoom and pan from 1100 BC to 1 BC, or jump to an era.
- Tap or click any king, prophet, or event to read the story and its Scripture reference.
- Search by name, place, or source.
- Turn layers on and off (kings, prophets, events, later rulers).
- Read the king ratings by color, blue for faithful and red for unfaithful.

On a phone: drag with one finger to pan, pinch to zoom, tap a mark to read it.

On a keyboard: `+` and `-` zoom, arrow keys pan, `[` and `]` step through events, `F` fits the whole story, `/` searches.

## Run it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5173. You can also open `ot-timeline.html` straight from disk.

## Build

```bash
pnpm build
```

This checks the HTML, scripts, IDs, and design tokens, then copies the site into `dist/`. That folder is what gets deployed.

## Files

| File | What it is |
|---|---|
| `ot-timeline.html` | The whole app: markup, styles, data, and script |
| `tokens.css` | Design tokens |
| `scripts/` | Dev server, checks, and build |
| `original/` | The first version, before the mobile pass |

## About the dates

Dates are approximate and follow a conventional chronology of the monarchy. Stories without a secure date are marked "c." The methodology note at the bottom of the page covers the details.
