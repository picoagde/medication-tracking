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

serve(app)
