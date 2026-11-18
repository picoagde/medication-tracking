import { db } from '../db';
import { Context } from 'hono';
import { readJson } from '../helpers';

export const handleCreate = async (c: Context) => {
  const { data, error } = await readJson(c);
  if (error) {
    return c.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!data || !data.name) {
    return c.json({ error: 'Name is required' }, { status: 400 });
  }
  const name = data.name.trim();
  const dosage = (data.dosage ?? '').trim();
  const form = (data.form ?? '').trim();
  const frequency = (data.frequency ?? '').trim();
  const schedule = (data.schedule ?? '').trim();
  const instructions = (data.instructions ?? '').trim();
  const notes = (data.notes ?? '').trim();
  const id = crypto.randomUUID();
  // createdAt and updatedAt are set by the column defaults (datetime('now')).
  db.prepare(
    `INSERT INTO medications (id, name, dosage, form, frequency, schedule, instructions, notes, takenDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, name, dosage, form, frequency, schedule, instructions, notes, null, 'datetime(\'now\')', 'datetime(\'now\')');
  const row = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, takenDate, createdAt, updatedAt
       FROM medications WHERE id = ?`,
    )
    .get(id) as any;
  return c.json({ ...row, taken: false });
};
