import type { FC } from 'hono/jsx';
import { Context } from 'hono';

interface Note {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
}

const Page: FC<{ notes: Note[] }> = (props: { notes: Note[] }) => {
  const notes = props.notes;
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Notes</title>
      </head>
      <body style="font-family: sans-serif; max-width: 600px; margin: 2rem auto;">
        <h1>Notes (Google Keep style)</h1>
        <p>A list of your notes.</p>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <strong>{note.title}</strong>
              <p style="margin: 4px 0; font-style: italic;">
                {note.content ?? ''} — {new Date(note.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
};

export const handleUi = async (c: Context) => {
  const res = await fetch(new URL('/notes', c.req.url));
  const notes = (await res.json()) as Note[];
  return c.html(<Page notes={notes} />);
};
