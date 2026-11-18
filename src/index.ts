import { serve } from '@hono/node-server';
import { Context, Hono } from 'hono';
import { handleList } from './routes/list';
import { handleCreate } from './routes/create';
import { handleGet } from './routes/get';
import { handleUpdate } from './routes/update';
import { handleDelete } from './routes/delete';
import { handleMarkTaken } from './routes/taken';
import { handleRoot } from './routes/root';
import { logRequest, logServerAddress } from './logger';
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

app.get('/medications', handleList);
app.post('/medications', handleCreate);
app.get('/medications/:id', handleGet);
app.patch('/medications/:id', handleUpdate);
app.post('/medications/:id/taken', handleMarkTaken);
app.delete('/medications/:id', handleDelete);
app.get('/', handleRoot);

// Same-origin API routes for the React UI (frontend talks to `/api/medications`).
const api = new Hono();
api.get('/medications', handleList);
api.post('/medications', handleCreate);
api.get('/medications/:id', handleGet);
api.patch('/medications/:id', handleUpdate);
api.post('/medications/:id/taken', handleMarkTaken);
api.delete('/medications/:id', handleDelete);
app.route('/api', api);

app.get('/ui', handleUi);
app.get('/ui/*', handleUi);

// The built HTML references its assets at the root (`/assets/...`), so serve
// those too when the UI is served at `/ui`.
app.get('/assets/*', handleUi);

// Wrap the request pipeline so every request — API routes as well as the
// static UI routes — is logged with method, URL, status code and duration.
async function logFetch(request: Request, env: any) {
  const startedAt = process.hrtime.bigint();
  let response: Response;
  try {
    response = await app.fetch(request, env);
  } catch (err) {
    // The app threw while handling the request (e.g. an unhandled route
    // error); log it as an error entry before re-throwing.
    const durationMs = numberFromHrtime(startedAt);
    await logRequest({
      ts: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: 500,
      durationMs,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
  const durationMs = numberFromHrtime(startedAt);
  await logRequest({
    ts: new Date().toISOString(),
    method: request.method,
    url: request.url,
    status: response.status,
    durationMs,
    remote: request.headers.get('x-forwarded-for') ?? undefined,
  });
  return response;
}

function numberFromHrtime(startedAt: bigint): number {
  return Number(process.hrtime.bigint() - startedAt) / 1e6;
}

// Listen on PORT (defaults to 3000); ignore non-numeric or invalid values
const rawPort = Number(process.env.PORT);
const port = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : 3000;

// Report the address/port the server is listening on (startup info).
serve({
  fetch: logFetch,
  port,
}, (serverInfo) => {
  logServerAddress(serverInfo);
});
