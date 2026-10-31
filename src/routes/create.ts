import { db } from '../db';

export const handleCreate = async (c: any) => {
  const body = await c.req.json();
  if (!body || !body.title) {
    return c.json({ error: 'Title is required' }, { status: 400 });
  }
  const content = (body.content ?? '').trim();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO notes (id, title, content, createdAt) VALUES (?, ?, ?, datetime(\'now\'))').run(id, body.title, content);
  await db.prepare(`UPDATE notes SET title=?, content=?, id=?, createdAt=datetime('now') WHERE id=?`).run(body.title, content, id, id);
  return c.json(db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id));
};
