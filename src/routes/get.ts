import { db } from '../db';

export const handleGet = (c: any) => {
  const id = c.req.param('id');
  const row = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, createdAt, updatedAt
       FROM medications WHERE id = ?`,
    )
    .get(id);
  if (!row || !row.id) {
    return c.json({ error: 'Medication not found' }, { status: 404 });
  }
  return c.json(row);
};
