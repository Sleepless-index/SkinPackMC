// Tiny local web server (optional — index.html also works by just double-clicking it).
// Usage: node serve.mjs      -> opens http://localhost:8080 in your browser
// HTTPS is only used if you provide certificates via SSL_KEY / SSL_CERT env vars.
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json',
};

const handler = (req, res) => {
  const rel = req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
};

const useSsl = process.env.SSL_KEY && process.env.SSL_CERT;
const server = useSsl
  ? https.createServer({ key: fs.readFileSync(process.env.SSL_KEY), cert: fs.readFileSync(process.env.SSL_CERT) }, handler)
  : http.createServer(handler);
const scheme = useSsl ? 'https' : 'http';

let port = Number(process.env.PORT) || 8080;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < 8100) { port++; server.listen(port, '127.0.0.1'); }
  else { console.error(e.message); process.exit(1); }
});
server.on('listening', () => {
  const url = `${scheme}://localhost:${port}`;
  console.log(`\n  Skin Pack Creator is running at ${url}\n  (close this window or press Ctrl+C to stop)\n`);
  const opener = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(opener, () => {});
});
server.listen(port, '127.0.0.1');
