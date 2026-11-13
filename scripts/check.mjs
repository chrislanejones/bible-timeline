import { readFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import assert from 'node:assert/strict';
const html = await readFile(new URL('../ot-timeline.html', import.meta.url), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'Expected one standalone timeline script');
for (const [, script] of scripts) new Script(script, { filename: 'ot-timeline.html' });
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML ids must be unique');
const tokens = (await readFile(new URL('../tokens.css', import.meta.url), 'utf8')).trim();
assert(html.includes(tokens), 'Standalone HTML tokens must match tokens.css');
const declared = new Set([...html.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
for (const [, token] of html.matchAll(/var\((--[\w-]+)\)/g)) {
  assert(declared.has(token) || ['--mark-color', '--rating-color'].includes(token), `Missing token: ${token}`);
}
assert(!/https?:\/\/[^"']+\.(?:js|css)["']/i.test(html), 'Timeline must work without remote runtime assets');
// Every element the script looks up by id must exist in the markup.
const source = scripts[0][1];
const createdAtRuntime = ['reader-title'];
for (const [, id] of source.matchAll(/\$\('([\w-]+)'\)/g)) assert(ids.includes(id) || createdAtRuntime.includes(id), `Script uses a missing element: #${id}`);
// Evaluate only the data section: no browser globals, DOM, or storage are involved.
const dataEnd = source.indexOf('const $ =');
assert(dataEnd > 0, 'Data must be defined before browser code');
const exported = '{ allItems, events, people, addedEvents, earlyEvents, undatedEvents, lanes, RANGES, RATINGS, FIRST_YEAR, LAST_YEAR, MIN_SPAN, DEFAULT_STORY, ERA_STORIES, OVERVIEW_LANES, GROUPED_LANES, EARLY_LANES }';
const data = new Script(source.slice(0, dataEnd) + `\n;(${exported});`).runInNewContext();
const { FIRST_YEAR, LAST_YEAR, MIN_SPAN } = data;
assert(FIRST_YEAR > LAST_YEAR && LAST_YEAR >= 1, 'The timeline must run from an earlier BC year to a later one');
assert.equal(new Set(data.allItems.map(d => d.key)).size, data.allItems.length, 'Share/bookmark keys must be unique');
assert.equal(new Set(data.allItems.map(d => d.id)).size, data.allItems.length, 'Data IDs must be unique');
const laneIds = data.lanes.map(l => l.id);
assert.equal(new Set(laneIds).size, laneIds.length, 'Lane ids must be unique');
for (const item of data.allItems) {
  const start = item.year ?? item.start, end = item.year ?? item.end;
  assert(Number.isFinite(start) && Number.isFinite(end), `Dates must be numbers: ${item.name}`);
  assert(start >= end && start <= FIRST_YEAR && end >= LAST_YEAR, `Invalid dates: ${item.name}`);
  assert(item.name && item.note && item.ref && item.key, 'Every entry needs a name, note, reference, and stable key');
  if (item.url) assert(/^https:\/\//.test(item.url), `Source must use HTTPS: ${item.name}`);
  if (item.kind === 'event') assert(Number.isInteger(item.year), `Story years must be whole numbers: ${item.name}`);
  else assert(laneIds.includes(item.lane), `Unknown lane "${item.lane}": ${item.name}`);
  if (item.kind === 'king') assert(Object.hasOwn(data.RATINGS, String(item.rating)), `Unknown rating: ${item.name}`);
}
for (const lane of data.lanes) assert(data.people.some(d => d.lane === lane.id), `Lane has no entries: ${lane.id}`);
for (const id of [...data.OVERVIEW_LANES, ...data.GROUPED_LANES, ...data.EARLY_LANES]) assert(laneIds.includes(id), `Unknown overview lane: ${id}`);
assert(data.events.every((d, i, a) => i === 0 || a[i - 1].year >= d.year), 'Events must remain chronological');
assert(data.addedEvents.every(d => d.url && d.approximate), 'New narrative entries need sources and approximate-date labels');
assert(data.earlyEvents.every(d => d.approximate && !d.undated), 'Dates before Samuel must be labelled approximate');
// Undated stories sit at the start of the axis, in a fixed order, and nothing dated may share that position.
assert(data.undatedEvents.length > 0 && data.undatedEvents.every((d, i) => d.undated && d.year === FIRST_YEAR && d.order === i), 'Undated stories must sit at the first year in canonical order');
assert(data.events.every(d => d.undated || d.year < FIRST_YEAR), 'Only undated stories may sit on the first year');
// Era buttons, their ranges, and their default stories must agree with each other and with the data.
const rangeButtons = [...html.matchAll(/data-range="([\w-]+)"[^>]*>[^<]*<span>(\d+)–(\d+) BC<\/span>/g)];
assert(rangeButtons.length >= 2, 'Expected era buttons');
for (const [, id, from, to] of rangeButtons) {
  assert(Object.hasOwn(data.RANGES, id), `Era button has no range: ${id}`);
  assert.deepEqual([Number(from), Number(to)], [...data.RANGES[id]], `Era button label does not match its range: ${id}`);
}
for (const [id, [from, to]] of Object.entries(data.RANGES)) {
  assert(from <= FIRST_YEAR && to >= LAST_YEAR && from - to >= MIN_SPAN, `Range out of bounds: ${id}`);
  assert(data.events.some(d => !d.undated && d.year <= from && d.year >= to), `Range has no stories: ${id}`);
}
const keys = new Set(data.allItems.map(d => d.key));
assert(keys.has(data.DEFAULT_STORY), 'The default story must exist');
for (const [era, key] of Object.entries(data.ERA_STORIES)) {
  assert(Object.hasOwn(data.RANGES, era) && keys.has(key), `Era default story is missing: ${era}`);
  const story = data.allItems.find(d => d.key === key), [from, to] = data.RANGES[era];
  assert(story.year <= from && story.year >= to, `Era default story is outside its era: ${era}`);
}
for (const [, value] of html.matchAll(/data-rating="([\w-]+)"/g)) assert(['all', 'good', 'mixed', 'bad'].includes(value), `Unknown rating filter: ${value}`);
const stories = data.events.length, tracks = data.people.length;
console.log(`Standalone HTML, JavaScript, IDs, tokens, and ${data.allItems.length} timeline entries checked (${stories} stories, ${tracks} people or political tracks, ${FIRST_YEAR}–${LAST_YEAR} BC).`);
