import { useCallback, useEffect, useState } from 'react';
import { MedicationItem } from './components/MedicationItem';
import { createMedication, listMedications } from './api';
import type { Medication, MedicationDraft } from './types';
import './App.css';

const EMPTY_DRAFT: MedicationDraft = {
  id: '',
  name: '',
  dosage: '',
  form: '',
  frequency: '',
  schedule: '',
  instructions: '',
  notes: '',
};

export default function App() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState<MedicationDraft>(EMPTY_DRAFT);
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
      setDraft(EMPTY_DRAFT);
      await refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Create failed');
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <h1>Medications</h1>
        <p className="app__subtitle">Keep your doses on track.</p>
      </header>

      {/* Form section */}
      <section className="app__form">
        <form className="med-form" onSubmit={submitCreate}>
          <div className="med-form__field med-form__field--full">
            <label className="med-form__label" htmlFor="med-name">
              Medication name
            </label>
            <input
              className="med-form__name"
              id="med-name"
              type="text"
              placeholder="Medication name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              autoFocus
              maxLength={120}
            />
          </div>

          <div className="med-form__row">
            <div className="med-form__field">
              <label className="med-form__label" htmlFor="med-dosage">
                Dosage
              </label>
              <input
                className="med-form__dosage"
                id="med-dosage"
                type="text"
                placeholder="Dosage (e.g. 500 mg)"
                value={draft.dosage}
                onChange={(e) => setDraft({ ...draft, dosage: e.target.value })}
                maxLength={200}
              />
            </div>
            <div className="med-form__field">
              <label className="med-form__label" htmlFor="med-form">
                Form
              </label>
              <input
                className="med-form__form"
                id="med-form"
                type="text"
                placeholder="Form (e.g. tablet, capsule, liquid)"
                value={draft.form}
                onChange={(e) => setDraft({ ...draft, form: e.target.value })}
                maxLength={80}
              />
            </div>
          </div>

          <div className="med-form__row">
            <div className="med-form__field">
              <label className="med-form__label" htmlFor="med-frequency">
                Frequency
              </label>
              <input
                className="med-form__frequency"
                id="med-frequency"
                type="text"
                placeholder="Frequency (e.g. once daily)"
                value={draft.frequency}
                onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}
                maxLength={120}
              />
            </div>
            <div className="med-form__field">
              <label className="med-form__label" htmlFor="med-schedule">
                Schedule
              </label>
              <input
                className="med-form__schedule"
                id="med-schedule"
                type="text"
                placeholder="Schedule (e.g. 07:00, 19:00)"
                value={draft.schedule}
                onChange={(e) => setDraft({ ...draft, schedule: e.target.value })}
                maxLength={200}
              />
            </div>
          </div>

          <div className="med-form__row">
            <div className="med-form__field">
              <label className="med-form__label" htmlFor="med-instructions">
                Instructions
              </label>
              <textarea
                className="med-form__instructions"
                id="med-instructions"
                placeholder="Instructions (e.g. Take with food)"
                value={draft.instructions}
                onChange={(e) => setDraft({ ...draft, instructions: e.target.value })}
                maxLength={500}
              />
            </div>
            <div className="med-form__field med-form__field--full">
              <label className="med-form__label" htmlFor="med-notes">
                Notes
              </label>
              <textarea
                className="med-form__notes"
                id="med-notes"
                placeholder="Notes (optional)"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                maxLength={2000}
              />
            </div>
          </div>

          <div className="med-form__actions">
            <button type="submit" className="btn btn--primary" disabled={loading}>
              Add medication
            </button>
          </div>

          {createError && <p className="error">{createError}</p>}
        </form>
      </section>

      {/* List section */}
      <section className="app__list">
        <h2>
          Medications <span className="med-list__count">{medications.length}</span>
        </h2>
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
