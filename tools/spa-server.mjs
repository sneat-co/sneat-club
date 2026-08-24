import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
const root = resolve(process.argv[2]);
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.ico': 'image/x-icon', '.map': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  const path = req.url.split('?')[0];
  // Confine resolution to the dist root: a traversal like /../../etc/passwd
  // resolves outside it and falls through to the SPA shell instead.
  const file = resolve(root, '.' + path);
  const contained = file === root || file.startsWith(root + sep);
  try {
    if (!contained) {
      throw new Error('outside root');
    }
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    const body = await readFile(resolve(root, 'index.html'));
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(body);
  }
}).listen(4299);
console.log('spa server on 4299');
