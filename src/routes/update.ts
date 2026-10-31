import { db } from '../db';
import { Context } from 'hono';
import { readJson } from '../helpers';

export const handleUpdate = async (c: Context) => {
  const id = c.req.param('id') as string;
  const { data, error } = await readJson(c);
  if (error) {
    return c.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const row = db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  // Merge semantics: omitted fields keep their current values, explicit nulls are
  // ignored (title/content are NOT NULL, so setting them to NULL would fail).
  const title = data?.title !== undefined && data.title !== null ? data.title : row.title;
  const content = data?.content !== undefined && data.content !== null ? data.content : row.content;
  if (title === row.title && content === row.content) {
    return c.json(row);
  }
  // createdAt is refreshed on update; the `id` column is deliberately excluded from the SET clause.
  db.prepare('UPDATE notes SET title=?, content=?, createdAt=datetime(\'now\') WHERE id=?').run(title, content, id);
  return c.json(db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id) as any);
};
