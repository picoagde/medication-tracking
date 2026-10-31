import { db } from '../db';

export const handleList = (c: any) => {
  const rows = db.prepare('SELECT id, title, content, createdAt FROM notes ORDER BY id').all();
  return c.json(rows);
};
