import { useCallback, useEffect, useState } from 'react';
import { MedicationItem } from './components/MedicationItem';
import { createMedication, listMedications } from './api';
import type { Medication, MedicationDraft } from './types';
import './App.css';

export default function App() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MedicationDraft>({
    id: '',
    name: '',
    dosage: '',
    form: '',
    frequency: '',
    schedule: '',
    instructions: '',
    notes: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setMedications(await listMedications());
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name.trim()) {
      setCreateError('Name is required');
      return;
    }
    setCreateError(null);
    try {
      await createMedication(draft);
      setDraft({
        id: '',
        name: '',
        dosage: '',
        form: '',
        frequency: '',
        schedule: '',
        instructions: '',
        notes: '',
      });
      await refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>Medications</h1>
      </header>

      <section className="app__form">
        <form className="med-form" onSubmit={submitCreate}>
          <input
            className="med-form__name"
            type="text"
            placeholder="Medication name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            autoFocus
            maxLength={120}
          />
          <input
            className="med-form__dosage"
            type="text"
            placeholder="Dosage (e.g. 500 mg)"
            value={draft.dosage}
            onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
            maxLength={200}
          />
          <input
            className="med-form__form"
            type="text"
            placeholder="Form (e.g. tablet, capsule, liquid)"
            value={draft.form}
            onChange={(e) => setDraft({ ...draft, form: e.target.value })}
            maxLength={80}
          />
          <input
            className="med-form__frequency"
            type="text"
            placeholder="Frequency (e.g. once daily)"
            value={draft.frequency}
            onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
            maxLength={120}
          />
          <input
            className="med-form__schedule"
            type="text"
            placeholder="Schedule (e.g. 07:00, 19:00)"
            value={draft.schedule}
            onChange={(e) => setDraft({ ...draft, schedule: e.target.value })}
            maxLength={200}
          />
          <textarea
            className="med-form__instructions"
            placeholder="Instructions (e.g. Take with food)"
            value={draft.instructions}
            onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
            maxLength={500}
          />
          <textarea
            className="med-form__notes"
            placeholder="Notes (optional)"
            value={draft.notes}
            onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            maxLength={2000}
          />
          <button type="submit" className="btn btn--primary" disabled={loading}>
            Add medication
          </button>
          {createError && <p className="error">{createError}</p>}
        </form>
      </section>

      <section className="app__list">
        <h2>Medications</h2>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : loadError ? (
          <p className="error">{loadError}</p>
        ) : medications.length === 0 ? (
          <div className="empty">
            <span className="empty__icon">💊</span>
            <p className="empty__title">No medications yet</p>
            <p className="empty__subtitle">Add your first medication above to get started.</p>
          </div>
        ) : (
          <ul className="med-list">
            {medications.map((med) => (
              <li key={med.id} className="med-list__item">
                <MedicationItem medication={med} onChanged={() => void refresh()} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
