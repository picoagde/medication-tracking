import { db } from '../db';
import { Context } from 'hono';

export const handleDelete = async (c: Context) => {
  const id = c.req.param('id') as string;
  const row = db.prepare('SELECT id FROM notes WHERE id = ?').get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  await db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return c.json({ message: 'Note deleted' });
};
