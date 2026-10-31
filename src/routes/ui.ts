import { Context } from 'hono';

export const handleUi = (c: Context) => {
  const html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Notes</title></head><body style="font-family: sans-serif; max-width: 600px; margin: 2rem auto;"><h1>Notes (Google Keep style)</h1><p>A list of your notes. Click a note to view details.</p><ul id="notes-list"></ul><script>' +
    'async function loadNotes() {' +
    '  const res = await fetch("/notes");' +
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
};
