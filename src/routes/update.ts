import { db } from '../db';
import { Context } from 'hono';
import { readJson } from '../helpers';

export const handleUpdate = async (c: Context) => {
  const id = c.req.param('id') as string;
  const { data, error } = await readJson(c);
  if (error) {
    return c.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const row = db
    .prepare(
      `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, createdAt, updatedAt
       FROM medications WHERE id = ?`,
    )
    .get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Medication not found' }, { status: 404 });
  }
  // Merge semantics: omitted fields keep their current values, explicit nulls are
  // ignored, and non-null values are trimmed. createdAt is intentionally preserved.
  const name =
    data?.name !== undefined && data.name !== null
      ? data.name.trim()
      : row.name;
  const dosage =
    data?.dosage !== undefined && data.dosage !== null
      ? data.dosage.trim()
      : row.dosage;
  const form =
    data?.form !== undefined && data.form !== null
      ? data.form.trim()
      : row.form;
  const frequency =
    data?.frequency !== undefined && data.frequency !== null
      ? data.frequency.trim()
      : row.frequency;
  const schedule =
    data?.schedule !== undefined && data.schedule !== null
      ? data.schedule.trim()
      : row.schedule;
  const instructions =
    data?.instructions !== undefined && data.instructions !== null
      ? data.instructions.trim()
      : row.instructions;
  const notes =
    data?.notes !== undefined && data.notes !== null
      ? data.notes.trim()
      : row.notes;
  if (
    name === row.name &&
    dosage === row.dosage &&
    form === row.form &&
    frequency === row.frequency &&
    schedule === row.schedule &&
    instructions === row.instructions &&
    notes === row.notes
  ) {
    return c.json(row);
  }
  // updatedAt is refreshed on update; the `id` column is deliberately excluded from
  // the SET clause.
  db.prepare(
    `UPDATE medications
     SET name=?, dosage=?, form=?, frequency=?, schedule=?, instructions=?, notes=?, updatedAt=datetime('now')
     WHERE id=?`,
  ).run(
    name,
    dosage,
    form,
    frequency,
    schedule,
    instructions,
    notes,
    id,
  );
  return c.json(
    db
      .prepare(
        `SELECT id, name, dosage, form, frequency, schedule, instructions, notes, createdAt, updatedAt
         FROM medications WHERE id = ?`,
      )
      .get(id) as any,
  );
};
