import { db } from '../db';
import { Context } from 'hono';
import { readJson } from '../helpers';

export const handleCreate = async (c: Context) => {
  const { data, error } = await readJson(c);
  if (error) {
    return c.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!data || !data.title) {
    return c.json({ error: 'Title is required' }, { status: 400 });
  }
  const content = (data.content ?? '').trim();
  const id = crypto.randomUUID();
  // Single INSERT — createdAt is set by the column default.
  db.prepare('INSERT INTO notes (id, title, content) VALUES (?, ?, ?)').run(id, data.title, content);
  return c.json(db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id) as any);
};
