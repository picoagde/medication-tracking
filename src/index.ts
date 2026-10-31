import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { handleList } from './routes/list';
import { handleCreate } from './routes/create';
import { handleGet } from './routes/get';
import { handleUpdate } from './routes/update';
import { handleDelete } from './routes/delete';
import { handleRoot } from './routes/root';
import { handleUi } from './routes/ui';

const app = new Hono();

app.get('/notes', handleList);
app.post('/notes', handleCreate);
app.get('/notes/:id', handleGet);
app.patch('/notes/:id', handleUpdate);
app.delete('/notes/:id', handleDelete);
app.get('/', handleRoot);
app.get('/ui', handleUi);

// Listen on PORT (defaults to 3000); ignore non-numeric or invalid values
const rawPort = Number(process.env.PORT);
const port = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : 3000;

serve({
  fetch: (request, env) => app.fetch(request, env),
  port,
});
