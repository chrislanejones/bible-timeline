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
console.log('Standalone HTML, JavaScript syntax, IDs, and design tokens checked.');
