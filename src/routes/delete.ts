import { db } from '../db';

export const handleDelete = async (c: any) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Id required' }, { status: 400 });
  }
  await db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return c.json({ message: 'Note deleted' });
};
