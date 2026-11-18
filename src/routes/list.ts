import { db } from '../db';
import { isTakenToday } from '../helpers';

export const handleList = (c: any) => {
  const rows = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, takenDate, createdAt, updatedAt
       FROM medications ORDER BY id`,
    )
    .all();
  return c.json(
    (rows as any[]).map((row) => ({ ...row, taken: isTakenToday(row.takenDate) })),
  );
};
