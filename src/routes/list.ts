import { db } from '../db';

export const handleList = (c: any) => {
  const rows = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, createdAt, updatedAt
       FROM medications ORDER BY id`,
    )
    .all();
  return c.json(rows);
};
