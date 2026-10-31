import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'crypto';

// SQLite database file (created on first run)
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

const app = new Hono();

// GET /notes - list all notes
app.get('/notes', (c) => {
  const rows = db.prepare('SELECT id, title, content, createdAt FROM notes ORDER BY id').all();
  return c.json(rows);
});

// POST /notes - create a new note
app.post('/notes', async (c) => {
  const body = await c.req.json() as { title?: string; content?: string };
  if (!body || !body.title) {
    return c.json({ error: 'Title is required' }, { status: 400 });
  }
  const content = (body.content ?? '').trim();
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO notes (id, title, content, createdAt) VALUES (?, ?, ?, datetime(\'now\'))').run(id, body.title, content);
  await db.prepare(`UPDATE notes SET title=?, content=?, id=?, createdAt=datetime('now') WHERE id=?`).run(body.title, content, id, id);
  return c.json(db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id));
});

// GET /notes/:id - get a single note
app.get('/notes/:id', (c) => {
  const id = c.req.param('id');
  const row = db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id);
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  return c.json(row);
});

// PATCH /notes/:id - update title and/or content
app.patch('/notes/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Id required' }, { status: 400 });
  }
  const body = await c.req.json() as { title?: string; content?: string };
  let updatedTitle = body.title ?? null;
  let updatedContent = body.content ?? null;
  await db.prepare('UPDATE notes SET title=?, content=?, id=?, createdAt=datetime(\'now\') WHERE id=?').run(updatedTitle, updatedContent, id, id);
  const row = db.prepare('SELECT id, title, content, createdAt FROM notes WHERE id = ?').get(id) as any;
  if (!row || !row.id) {
    return c.json({ error: 'Note not found' }, { status: 404 });
  }
  return c.json(row);
});

// DELETE /notes/:id - remove a note
app.delete('/notes/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Id required' }, { status: 400 });
  }
  await db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  return c.json({ message: 'Note deleted' });
});

// Root - simple info endpoint
app.get('/', (c) => c.text('Notes API running'));

// GET /ui - Google Keep style UI
app.get('/ui', (c) => {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Notes</title></head><body style="font-family: sans-serif; max-width: 600px; margin: 2rem auto;"><h1>Notes (Google Keep style)</h1><p>A list of your notes. Click a note to view details.</p><ul id="notes-list"></ul><script>' +
    'async function loadNotes() {' +
    '  const res = await fetch("http://localhost:3000/notes");' +
    '  const data = await res.json();' +
    '  if (Array.isArray(data)) {' +
    '    const ul = document.getElementById("notes-list");' +
    '    data.forEach(note => {' +
    '      const li = document.createElement("li");' +
    '      li.innerHTML = "<strong>" + note.title + "</strong><p style=\"margin:4px 0; font-style:italic;\">" + note.content + " — " + new Date(note.createdAt).toLocaleDateString() + "</p>";' +
    '      ul.appendChild(li);' +
    '    });' +
    '  }}' +
    '}' +
    ' loadNotes();' +
    ' </script>' +
    '</body></html>';
  return c.render(html);
});

serve(app);
