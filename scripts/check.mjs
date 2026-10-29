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
// Evaluate only the data section: no browser globals, DOM, or storage are involved.
const source = scripts[0][1];
const dataEnd = source.indexOf('const $ =');
assert(dataEnd > 0, 'Data must be defined before browser code');
const data = new Script(source.slice(0, dataEnd) + '\n;({ allItems, events, addedEvents });').runInNewContext();
assert.equal(new Set(data.allItems.map(d => d.key)).size, data.allItems.length, 'Share/bookmark keys must be unique');
assert.equal(new Set(data.allItems.map(d => d.id)).size, data.allItems.length, 'Data IDs must be unique');
for (const item of data.allItems) {
  const start = item.year ?? item.start, end = item.year ?? item.end;
  assert(start >= end && start <= 1100 && end >= 1, `Invalid dates: ${item.name}`);
  assert(item.name && item.note && item.ref && item.key, 'Every entry needs a name, note, reference, and stable key');
  if (item.url) assert(/^https:\/\//.test(item.url), `Source must use HTTPS: ${item.name}`);
}
assert(data.events.every((d, i, a) => i === 0 || a[i - 1].year >= d.year), 'Events must remain chronological');
assert(data.addedEvents.every(d => d.url && d.approximate), 'New narrative entries need sources and approximate-date labels');
console.log(`Standalone HTML, JavaScript, IDs, tokens, and ${data.allItems.length} sourced timeline entries checked.`);
