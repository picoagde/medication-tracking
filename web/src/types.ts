export interface Note {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
}

export interface NoteDraft {
  id: string;
  title: string;
  content: string;
}
