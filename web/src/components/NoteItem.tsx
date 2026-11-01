import { useState } from 'react';
import type { Note } from '../types';
import { deleteNote, updateNote } from '../api';

interface NoteItemProps {
  note: Note;
  onChanged: () => void;
}

export function NoteItem({ note, onChanged }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setTitle(note.title);
    setContent(note.content ?? '');
    setEditing(true);
    setError(null);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };

  const saveEdit = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateNote(note.id, { title, content });
      onChanged();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const removeNote = async () => {
    if (!window.confirm(`Delete note "${note.title}"?`)) return;
    try {
      await deleteNote(note.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (editing) {
    return (
      <div className="note-item">
        <div className="note-edit">
          <input
            className="note-edit__title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
          <textarea
            className="note-edit__content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={20000}
          />
          {error && <p className="error">{error}</p>}
          <div className="note-edit__actions">
            <button type="button" className="btn" onClick={cancelEdit} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={saveEdit} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="note-item">
      <div className="note-item__text">
        <div className="note-item__title">{note.title}</div>
        <div className="note-item__content">{note.content || 'No content'}</div>
      </div>
      <div className="note-item__actions">
        <button type="button" className="btn" onClick={startEdit}>
          Edit
        </button>
        <button type="button" className="btn btn--danger" onClick={removeNote}>
          Delete
        </button>
      </div>
    </div>
  );
}
