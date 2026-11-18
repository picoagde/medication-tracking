export interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  form: string | null;
  frequency: string | null;
  schedule: string | null;
  instructions: string | null;
  notes: string | null;
  taken: boolean;
  takenDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDraft {
  id: string;
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  schedule: string;
  instructions: string;
  notes: string;
}
