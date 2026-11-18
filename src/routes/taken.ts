import { db } from '../db';
import { Context } from 'hono';
import { isTakenToday } from '../helpers';

export const handleMarkTaken = async (c: Context) => {
  const id = c.req.param('id') as string;
  const row = db.prepare('SELECT id FROM medications WHERE id = ?').get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Medication not found' }, { status: 404 });
  }
  // Mark the medication as taken for today; takenDate naturally rolls over to a
  // new day on the next day, expiring the taken state.
  const takenDate = new Date().toISOString().slice(0, 10);
  db.prepare(
    `UPDATE medications SET takenDate = ?, updatedAt = datetime('now') WHERE id = ?`,
  ).run(takenDate, id);
  const updated = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, takenDate, createdAt, updatedAt
       FROM medications WHERE id = ?`,
    )
    .get(id) as any;
  return c.json({ ...updated, taken: isTakenToday(updated.takenDate) });
};
