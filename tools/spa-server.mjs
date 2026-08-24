// Minimal static server with SPA fallback for the production-bundle smoke.
//
// The dist file set is enumerated once at startup and requests are served
// only from that allow-list — user input never reaches the filesystem, so
// there is no traversal surface at all.
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, relative, resolve, sep } from 'node:path';

const root = resolve(process.argv[2]);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.ico': 'image/x-icon', '.map': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };

async function listFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

const files = new Map(
  (await listFiles(root)).map((full) => ['/' + relative(root, full).split(sep).join('/'), full]),
);
const shell = await readFile(files.get('/index.html'));

createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  const known = files.get(path);
  if (known) {
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(known));
  } else {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(shell);
  }
}).listen(4299);
console.log(`spa server on 4299 (${files.size} files)`);
