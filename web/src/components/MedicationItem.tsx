import { useState } from 'react';
import type { Medication } from '../types';
import { deleteMedication, markMedicationTaken, updateMedication } from '../api';

interface MedicationItemProps {
  medication: Medication;
  onChanged: () => void;
}

export function MedicationItem({ medication, onChanged }: MedicationItemProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(medication.name);
  const [dosage, setDosage] = useState(medication.dosage ?? '');
  const [form, setForm] = useState(medication.form ?? '');
  const [frequency, setFrequency] = useState(medication.frequency ?? '');
  const [schedule, setSchedule] = useState(medication.schedule ?? '');
  const [instructions, setInstructions] = useState(medication.instructions ?? '');
  const [notes, setNotes] = useState(medication.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [taking, setTaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setName(medication.name);
    setDosage(medication.dosage ?? '');
    setForm(medication.form ?? '');
    setFrequency(medication.frequency ?? '');
    setSchedule(medication.schedule ?? '');
    setInstructions(medication.instructions ?? '');
    setNotes(medication.notes ?? '');
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
      await updateMedication(medication.id, {
        id: medication.id,
        name,
        dosage,
        form,
        frequency,
        schedule,
        instructions,
        notes,
      });
      onChanged();
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const takeMedication = async () => {
    setTaking(true);
    setError(null);
    try {
      await markMedicationTaken(medication.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setTaking(false);
    }
  };

  const removeMedication = async () => {
    if (!window.confirm(`Delete medication "${medication.name}"?`)) return;
    try {
      await deleteMedication(medication.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const formatValue = (value: string | null): string => (value === null ? '' : value);

  const fields = [
    { label: 'Dosage', value: medication.dosage },
    { label: 'Form', value: medication.form },
    { label: 'Frequency', value: medication.frequency },
    { label: 'Schedule', value: medication.schedule },
    { label: 'Instructions', value: medication.instructions },
    { label: 'Notes', value: medication.notes },
  ].filter((field) => field.value && field.value.trim() !== '');

  const pillIcon = (
    <svg
      className="med-item__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 12a4 4 0 0 0-4-4 4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4Z" />
    </svg>
  );

  if (editing) {
    return (
      <div className="med-item med-item--editing">
        <div className="med-edit">
          <div className="med-edit__field med-edit__field--full">
            <label className="med-edit__label" htmlFor={`med-edit-name-${medication.id}`}>
              Medication name
            </label>
            <input
              className="med-edit__name"
              id={`med-edit-name-${medication.id}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
            />
          </div>

          <div className="med-edit__row">
            <div className="med-edit__field">
              <label className="med-edit__label" htmlFor={`med-edit-dosage-${medication.id}`}>
                Dosage
              </label>
              <input
                className="med-edit__dosage"
                id={`med-edit-dosage-${medication.id}`}
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="med-edit__field">
              <label className="med-edit__label" htmlFor={`med-edit-form-${medication.id}`}>
                Form
              </label>
              <input
                className="med-edit__form"
                id={`med-edit-form-${medication.id}`}
                type="text"
                value={form}
                onChange={(e) => setForm(e.target.value)}
                maxLength={80}
              />
            </div>
          </div>

          <div className="med-edit__row">
            <div className="med-edit__field">
              <label className="med-edit__label" htmlFor={`med-edit-frequency-${medication.id}`}>
                Frequency
              </label>
              <input
                className="med-edit__frequency"
                id={`med-edit-frequency-${medication.id}`}
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="med-edit__field">
              <label className="med-edit__label" htmlFor={`med-edit-schedule-${medication.id}`}>
                Schedule
              </label>
              <input
                className="med-edit__schedule"
                id={`med-edit-schedule-${medication.id}`}
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          <div className="med-edit__field med-edit__field--full">
            <label className="med-edit__label" htmlFor={`med-edit-instructions-${medication.id}`}>
              Instructions
            </label>
            <textarea
              className="med-edit__instructions"
              id={`med-edit-instructions-${medication.id}`}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="med-edit__field med-edit__field--full">
            <label className="med-edit__label" htmlFor={`med-edit-notes-${medication.id}`}>
              Notes
            </label>
            <textarea
              className="med-edit__notes"
              id={`med-edit-notes-${medication.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
            />
          </div>

          {error && <p className="error med-edit__error">{error}</p>}

          <div className="med-edit__actions">
            <button type="button" className="btn btn--ghost" onClick={cancelEdit} disabled={saving}>
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
    <div className={`med-item${medication.taken ? ' med-item--taken' : ''}`}>
      <div className="med-item__text">
        <div className="med-item__name">
          {pillIcon}
          <span className="med-item__name-text">{medication.name}</span>
          {medication.dosage && <span className="med-item__badge">{medication.dosage}</span>}
        </div>
        {fields.length > 0 ? (
          <div className="med-item__details">
            {fields.map((field) => (
              <span key={field.label} className="med-item__detail">
                <strong>{field.label}:</strong> {formatValue(field.value)}
              </span>
            ))}
          </div>
        ) : (
          <div className="med-item__details med-item__details--muted">
            No additional details
          </div>
        )}
      </div>
      <div className="med-item__actions">
        {medication.taken ? (
          <button type="button" className="btn btn--taken" disabled>
            ✓ Taken today
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--take"
            onClick={() => void takeMedication()}
            disabled={taking}
          >
            {taking ? 'Taking…' : 'Take'}
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={startEdit}>
          Edit
        </button>
        <button type="button" className="btn btn--danger" onClick={removeMedication}>
          Delete
        </button>
      </div>
    </div>
  );
}
