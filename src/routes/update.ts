import { db } from '../db';

export const handleUpdate = async (c: any) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Id required' }, { status: 400 });
  }
  const body = await c.req.json();
  let updatedTitle = body.title ?? null;
  let updatedContent = body.content ?? null;
  await db.prepare('UPDATE notes SET title=?, content=?, id=?, createdAt=datetime(\'now\') WHERE id=?').run(updatedTitle, updatedContent, id, id);
  const row = db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  return c.json(row);
};
