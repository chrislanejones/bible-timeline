import { mkdir, copyFile } from 'node:fs/promises';
const out = new URL('../dist/', import.meta.url);
await mkdir(out, { recursive: true });
await copyFile(new URL('../ot-timeline.html', import.meta.url), new URL('index.html', out));
await copyFile(new URL('../ot-timeline.html', import.meta.url), new URL('ot-timeline.html', out));
await copyFile(new URL('../tokens.css', import.meta.url), new URL('tokens.css', out));
console.log('Built dist/index.html. Open directly or serve the dist directory.');
