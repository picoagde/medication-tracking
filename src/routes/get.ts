import { db } from '../db';
import { isTakenToday } from '../helpers';

export const handleGet = (c: any) => {
  const id = c.req.param('id');
  const row = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, takenDate, createdAt, updatedAt
       FROM medications WHERE id = ?`,
    )
    .get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Medication not found' }, { status: 404 });
  }
  return c.json({ ...row, taken: isTakenToday(row.takenDate) });
};
