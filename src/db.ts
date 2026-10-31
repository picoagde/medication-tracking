import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('notes.db');

// Ensure the notes table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

export { db };
