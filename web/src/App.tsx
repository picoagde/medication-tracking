import { useCallback, useEffect, useState } from 'react';
import { NoteItem } from './components/NoteItem';
import { createNote, listNotes } from './api';
import type { Note, NoteDraft } from './types';
import './App.css';


export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<NoteDraft>({ title: '', content: '' });
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setNotes(await listNotes());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      setCreateError('Title is required');
      return;
    }
    setCreateError(null);
    try {
      await createNote(draft);
      setDraft({ title: '', content: '' });
      await refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Notes</h1>
      </header>

      <section className="app__form">
        <form className="note-form" onSubmit={submitCreate}>
          <input
            className="note-form__title"
            type="text"
            placeholder="Title"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            autoFocus
            maxLength={200}
          />
          <textarea
            className="note-form__content"
            placeholder="Content"
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            maxLength={20000}
          />
          <button type="submit" className="btn btn--primary" disabled={loading}>
            Add note
          </button>
          {createError && <p className="error">{createError}</p>}
        </form>
      </section>

      <section className="app__list">
        <h2>Notes</h2>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : loadError ? (
          <p className="error">{loadError}</p>
        ) : notes.length === 0 ? (
          <p className="empty">No notes yet — add your first note above.</p>
        ) : (
          <ul className="note-list">
            {notes.map((note) => (
              <li key={note.id} className="note-item">
                <NoteItem note={note} onChanged={() => void refresh()} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
