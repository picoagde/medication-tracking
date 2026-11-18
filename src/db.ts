import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('medications.db');

// Ensure the medications table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS medications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dosage TEXT,
    form TEXT,
    frequency TEXT,
    schedule TEXT,
    instructions TEXT,
    notes TEXT,
    takenDate TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

// Migrate pre-existing databases that lack the takenDate column.
const columns = db.prepare(`PRAGMA table_info(medications)`).all() as Array<{ name: string }>;
const hasTakenDate = columns.some((column) => column.name === 'takenDate');
if (!hasTakenDate) {
  db.exec(`ALTER TABLE medications ADD COLUMN takenDate TEXT`);
}

export { db };
