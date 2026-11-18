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
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export { db };
