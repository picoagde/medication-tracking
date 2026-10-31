import { db } from '../db';

export const handleGet = (c: any) => {
  const id = c.req.param('id');
  const row = db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id);
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  return c.json(row);
};
