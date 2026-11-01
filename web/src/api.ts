import type { Note, NoteDraft } from './types';

const BASE = '/api/notes';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.error === 'string') message = body.error;
    } catch {
      // Response body was not JSON; keep the default message.
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

export async function listNotes(): Promise<Note[]> {
  return request<Note[]>(BASE);
}

export async function createNote(input: NoteDraft): Promise<Note> {
  return request<Note>(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.title, content: input.content }),
  });
}

export async function updateNote(id: string, input: NoteDraft): Promise<Note> {
  return request<Note>(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.title, content: input.content }),
  });
}

export async function deleteNote(id: string): Promise<void> {
  await request<null>(`${BASE}/${id}`, { method: 'DELETE' });
}
