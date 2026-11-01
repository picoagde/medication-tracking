import { serve } from '@hono/node-server';
import { Context, Hono } from 'hono';
import { handleList } from './routes/list';
import { handleCreate } from './routes/create';
import { handleGet } from './routes/get';
import { handleUpdate } from './routes/update';
import { handleDelete } from './routes/delete';
import { handleRoot } from './routes/root';
import path from 'node:path';
import { extname } from 'node:path';
import { readFile, stat } from 'node:fs/promises';

// Static file server for the React UI built by Vite into `web/dist`.
// The UI is served under `/ui` (see handleUi below); the built HTML references
// its assets at the root (`/assets/...`), which the `/assets/*` route serves.
const clientDistDir = path.resolve(__dirname, '..', 'web', 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function contentType(filePath: string): string {
  return MIME_TYPES[extname(filePath)] ?? 'text/plain; charset=utf-8';
}

async function serveStatic(relPath: string): Promise<Response> {
  const filePath = path.normalize(path.join(clientDistDir, relPath));
  if (!filePath.startsWith(clientDistDir + path.sep)) {
    return new Response('Not found', { status: 403 });
  }
  let target: Awaited<ReturnType<typeof stat>>;
  try {
    target = await stat(filePath);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (target.isFile()) {
    const data = await readFile(filePath);
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': contentType(filePath) },
    });
  }
  // Directory or missing file: fall back to index.html so client-side routes
  // (SPA fallback) keep working.
  const indexPath = path.join(filePath, 'index.html');
  let indexTarget: Awaited<ReturnType<typeof stat>>;
  try {
    indexTarget = await stat(indexPath);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (indexTarget.isFile()) {
    const data = await readFile(indexPath);
    return new Response(data, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  return new Response('Not found', { status: 404 });
}

// Serve the built React UI at `/ui` (and SPA fallback for `/ui/...` paths).
async function servePath(url: URL): Promise<Response> {
  let relPath = url.pathname;
  if (relPath === '/ui') {
    relPath = '/index.html';
  } else if (relPath.startsWith('/ui/')) {
    relPath = relPath.slice('/ui'.length);
  }
  return serveStatic(relPath);
}

async function handleUi(c: Context): Promise<Response> {
  return servePath(new URL(c.req.url ?? '/ui'));
}

const app = new Hono();

app.get('/notes', handleList);
app.post('/notes', handleCreate);
app.get('/notes/:id', handleGet);
app.patch('/notes/:id', handleUpdate);
app.delete('/notes/:id', handleDelete);
app.get('/', handleRoot);

// Same-origin API routes for the React UI (frontend talks to `/api/notes`).
const api = new Hono();
api.get('/notes', handleList);
api.post('/notes', handleCreate);
api.get('/notes/:id', handleGet);
api.patch('/notes/:id', handleUpdate);
api.delete('/notes/:id', handleDelete);
app.route('/api', api);

app.get('/ui', handleUi);
app.get('/ui/*', handleUi);

// The built HTML references its assets at the root (`/assets/...`), so serve
// those too when the UI is served at `/ui`.
app.get('/assets/*', handleUi);

// Listen on PORT (defaults to 3000); ignore non-numeric or invalid values
const rawPort = Number(process.env.PORT);
const port = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : 3000;

serve({
  fetch: (request, env) => app.fetch(request, env),
  port,
});
